import { englishSessionCatalog } from '../src/lib/englishSessionCatalog.mjs';
import { syncPrivateControlRelayOnce } from './privateControlRelaySync.mjs';
import {
  readPrivateControlCurrent,
  readPrivateControlReceipt,
  readPrivateControlStatus,
  resolvePrivateControlDir,
  writePrivateControlReceipt
} from './privateControlStore.mjs';

const ROOT='/__kianos-private/control';
const MAX_BYTES=64*1024;

const isLoopback=address=>{
  const value=String(address||'').toLowerCase();
  return value==='127.0.0.1'||value==='::1'||value==='::ffff:127.0.0.1';
};
const json=(res,status,value)=>{
  res.statusCode=status;
  res.setHeader('content-type','application/json; charset=utf-8');
  res.setHeader('cache-control','no-store');
  res.end(JSON.stringify(value));
};
async function readBody(req){
  let size=0;const chunks=[];
  for await(const chunk of req){
    size+=chunk.length;
    if(size>MAX_BYTES)throw new Error('KIANOS_CONTROL_RECEIPT_TOO_LARGE');
    chunks.push(chunk);
  }
  const raw=Buffer.concat(chunks).toString('utf8');
  if(!raw.trim())throw new Error('KIANOS_CONTROL_RECEIPT_REQUIRED');
  return JSON.parse(raw);
}

export function privateControlBridge({privateDir=resolvePrivateControlDir()}={}){
  const configure=(server)=>{
      const pollMs=Math.max(3000,Number(process.env.KIANOS_CONTROL_POLL_MS||8000));
      let busy=false;
      let stopped=false;
      const sync=async()=>{
        if(busy||stopped)return;
        busy=true;
        try{await syncPrivateControlRelayOnce();}catch{}
        finally{busy=false;}
      };
      void sync();
      const timer=setInterval(()=>void sync(),pollMs);
      server.httpServer?.once('close',()=>{
        stopped=true;
        clearInterval(timer);
      });

      server.middlewares.use(async(req,res,next)=>{
        const url=new URL(req.url||'/','http://127.0.0.1');
        if(!url.pathname.startsWith(ROOT))return next();
        if(!isLoopback(req.socket?.remoteAddress))return json(res,403,{status:'forbidden'});
        try{
          if(req.method==='GET'&&url.pathname===ROOT+'/status'){
            return json(res,200,{status:'ready',relay:readPrivateControlStatus(privateDir)});
          }
          if(req.method==='GET'&&url.pathname===ROOT+'/current'){
            const command=readPrivateControlCurrent(privateDir);
            const receipt=readPrivateControlReceipt(privateDir);
            return command
              ? json(res,200,{status:'ready',command,receipt})
              : json(res,404,{status:'missing',command:null,receipt});
          }
          if(req.method==='GET'&&url.pathname===ROOT+'/english-session-catalog'){
            return json(res,200,{status:'ready',rows:englishSessionCatalog()});
          }
          if(req.method==='PUT'&&url.pathname===ROOT+'/receipt'){
            const receipt=writePrivateControlReceipt(await readBody(req),privateDir);
            return json(res,200,{status:'saved',receipt});
          }
          res.setHeader('allow','GET, PUT');
          return json(res,404,{status:'not_found'});
        }catch(error){
          const message=error instanceof Error?error.message:String(error);
          const status=/JSON|REQUIRED|INVALID|TOO_LARGE|SCHEMA/.test(message)?400:500;
          return json(res,status,{status:'error',error:message});
        }
      });
  };

  return{
    name:'kianos-private-control-bridge',
    apply:'serve',
    configureServer:configure,
    configurePreviewServer:configure
  };
}
