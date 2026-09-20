import { ensureExternalReadingPrivateBundle } from './privateExternalReadingStore.mjs';
import {
  englishExternalCombinedAnswers,
  englishExternalCombinedCatalog,
  englishExternalCombinedPassage
} from './privateEnglishExternalStore.mjs';

const ROOT='/__kianos-private/external-reading';

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

export function privateExternalReadingBridge(options = {}){
  return{
    name:'kianos-private-external-reading-bridge',
    apply:'serve',
    configureServer(server){
      server.middlewares.use((req,res,next)=>{
        const url=new URL(req.url||'/','http://127.0.0.1');
        if(!url.pathname.startsWith(ROOT))return next();
        if(!isLoopback(req.socket?.remoteAddress))return json(res,403,{status:'forbidden'});
        if(req.method!=='GET'){
          res.setHeader('allow','GET');
          return json(res,405,{status:'method_not_allowed'});
        }
        try{
          const state=ensureExternalReadingPrivateBundle(options);
          if(url.pathname===ROOT+'/status'||url.pathname===ROOT+'/catalog'){
            const catalog=englishExternalCombinedCatalog({sourceState:state});
            return json(res,catalog.status==='ready'?200:catalog.status==='missing_source'?404:503,catalog);
          }
          if(url.pathname===ROOT+'/passage'){
            const id=String(url.searchParams.get('id')||'').trim();
            if(!id)return json(res,400,{status:'error',error:'EXTERNAL_READING_OBJECT_ID_REQUIRED'});
            return json(res,200,{status:'ready',passage:englishExternalCombinedPassage(id,{sourceState:state})});
          }
          if(url.pathname===ROOT+'/answers'){
            const id=String(url.searchParams.get('id')||'').trim();
            if(!id)return json(res,400,{status:'error',error:'EXTERNAL_READING_OBJECT_ID_REQUIRED'});
            return json(res,200,{status:'ready',answers:englishExternalCombinedAnswers(id,{sourceState:state})});
          }
          return json(res,404,{status:'not_found'});
        }catch(error){
          const message=error instanceof Error?error.message:String(error);
          const status=/NOT_FOUND|REQUIRED|INVALID/.test(message)?400:500;
          return json(res,status,{status:'error',error:message});
        }
      });
    }
  };
}
