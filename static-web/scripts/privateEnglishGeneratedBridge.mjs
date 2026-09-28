import {
  englishGeneratedDrillAnswers,
  generatedDrillCatalogRows,
  materializeEnglishGeneratedDrill,
  readEnglishGeneratedDrill,
  resolveEnglishGeneratedDir
} from './privateEnglishGeneratedDrillStore.mjs';
import {
  ensureExternalReadingPrivateBundle,
  externalReadingPassage
} from './privateExternalReadingStore.mjs';

const ROOT='/__kianos-private/english-generated';
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

export function privateEnglishGeneratedBridge(options={}){
  const generatedDir=options.generatedDir||resolveEnglishGeneratedDir();
  const loadMaterial=id=>{
    const drill=readEnglishGeneratedDrill(id,{privateDir:generatedDir});
    return materializeEnglishGeneratedDrill(drill,{
      loadExternalSource:(sourceId)=>externalReadingPassage(sourceId,ensureExternalReadingPrivateBundle(options))
    });
  };
  return{
    name:'kianos-private-english-generated-bridge',
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
          if(url.pathname===ROOT+'/status'||url.pathname===ROOT+'/catalog'){
            const rows=generatedDrillCatalogRows({privateDir:generatedDir});
            return json(res,200,{status:'ready',rows});
          }
          const id=String(url.searchParams.get('id')||'').trim();
          if(!id)return json(res,400,{status:'error',error:'ENGLISH_GENERATED_OBJECT_ID_REQUIRED'});
          if(url.pathname===ROOT+'/material')return json(res,200,{status:'ready',material:loadMaterial(id)});
          if(url.pathname===ROOT+'/answers'){
            const drill=readEnglishGeneratedDrill(id,{privateDir:generatedDir});
            return json(res,200,{status:'ready',answers:englishGeneratedDrillAnswers(drill)});
          }
          return json(res,404,{status:'not_found'});
        }catch(error){
          const message=error instanceof Error?error.message:String(error);
          const status=/NOT_FOUND|REQUIRED|INVALID|UNSUPPORTED/.test(message)?400:500;
          return json(res,status,{status:'error',error:message});
        }
      });
    }
  };
}
