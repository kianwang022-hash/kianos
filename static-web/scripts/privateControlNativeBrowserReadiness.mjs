import fs from 'node:fs';
import path from 'node:path';
import {performance} from 'node:perf_hooks';

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const errorText=error=>[error.code,error.message,error.cause?.code].filter(Boolean).join(': ');

// Test harness only: a port-file value alone does not prove that this owned
// browser's CDP endpoint is ready. Keep the original bounded startup budget.
export async function waitForNativeBrowser({child,profile,spawnError=()=>'',timeoutMs=10000,pollMs=100,fetchImpl=fetch}){
  const started=performance.now(),deadline=started+timeoutMs;
  const file=path.join(profile,'DevToolsActivePort');
  let attempts=0,lastFile=null,lastFileError='',lastCdp=null,lastCdpError='';
  const events=[];
  const note=(kind,value)=>{
    if(events.at(-1)?.kind===kind && events.at(-1)?.value===value)return;
    events.push({elapsedMs:Math.round(performance.now()-started),kind,value});
    if(events.length>12)events.shift();
  };
  const processWitness=pid=>{
    if(process.platform!=='linux'||!Number.isInteger(pid))return null;
    try{
      const status=fs.readFileSync(`/proc/${pid}/status`,'utf8').split('\n')
        .filter(line=>/^(Name|State|PPid|Threads|VmRSS|VmSwap):/.test(line));
      return {pid,status,wchan:fs.readFileSync(`/proc/${pid}/wchan`,'utf8').trim()};
    }catch(error){return {pid,error:errorText(error)};}
  };
  const finish=(ready,reason,port=null)=>{
    let profileWitness;
    try{
      const stat=fs.statSync(profile);
      profileWitness={exists:true,directory:stat.isDirectory(),mode:(stat.mode&0o777).toString(8),entries:fs.readdirSync(profile).slice(0,20)};
    }catch(error){profileWitness={exists:false,error:errorText(error)};}
    let children=[];
    if(process.platform==='linux'&&Number.isInteger(child.pid)){
      try{children=fs.readFileSync(`/proc/${child.pid}/task/${child.pid}/children`,'utf8').trim().split(/\s+/).filter(Boolean).slice(0,8).map(Number).map(processWitness);}catch{}
    }
    return {ready,port,reason,diagnostics:{elapsedMs:Math.round(performance.now()-started),timeoutMs,attempts,
      pid:child.pid??null,exitCode:child.exitCode,signalCode:child.signalCode,spawnError:spawnError(),
      profile:profileWitness,file,lastFile,lastFileError,lastCdp,lastCdpError,events,process:processWitness(child.pid),children}};
  };
  while(performance.now()<deadline){
    if(spawnError())return finish(false,'SPAWN_ERROR');
    if(child.exitCode!=null||child.signalCode!=null)return finish(false,'PROCESS_EXITED');
    attempts++;
    let port=null,browserPath=null;
    try{
      const raw=fs.readFileSync(file,'utf8');
      const stat=fs.statSync(file);
      lastFile={size:stat.size,mode:(stat.mode&0o777).toString(8),raw:raw.slice(0,512)};
      lastFileError='';
      const lines=raw.trim().split(/\r?\n/);
      if(/^\d+$/.test(lines[0])&&Number(lines[0])>=1&&Number(lines[0])<=65535
        &&/^\/devtools\/browser\/[A-Za-z0-9-]+$/.test(lines[1]??'')){
        port=Number(lines[0]);browserPath=lines[1];note('PORT_FILE_VALID',String(port));
      }else note('PORT_FILE_INCOMPLETE_OR_INVALID',raw.slice(0,120));
    }catch(error){lastFileError=errorText(error);note('PORT_FILE_READ_ERROR',lastFileError);}
    const remaining=Math.floor(deadline-performance.now());
    if(port && remaining>0){
      try{
        const response=await fetchImpl(`http://127.0.0.1:${port}/json/version`,{
          redirect:'error',signal:AbortSignal.timeout(Math.min(1000,remaining))});
        if(!response.ok)throw new Error('CDP_HTTP_'+response.status);
        const data=await response.json();
        lastCdp={browser:data.Browser??null,webSocketDebuggerUrl:data.webSocketDebuggerUrl??null};
        const endpoint=new URL(data.webSocketDebuggerUrl);
        if(endpoint.protocol!=='ws:'||!['127.0.0.1','localhost','[::1]'].includes(endpoint.hostname)
          ||Number(endpoint.port)!==port||endpoint.pathname!==browserPath){
          note('CDP_IDENTITY_MISMATCH',JSON.stringify(lastCdp));
          return finish(false,'CDP_IDENTITY_MISMATCH');
        }
        lastCdpError='';
        if(spawnError()||child.exitCode!=null||child.signalCode!=null)return finish(false,'PROCESS_EXITED_DURING_CDP');
        if(performance.now()>=deadline)return finish(false,'STARTUP_TIMEOUT');
        note('CDP_READY',data.Browser??'unknown');
        return finish(true,'CDP_READY',port);
      }catch(error){lastCdpError=errorText(error);note('CDP_NOT_READY',lastCdpError);}
    }
    const wait=Math.min(pollMs,deadline-performance.now());
    if(wait>0)await sleep(wait);
  }
  return finish(false,'STARTUP_TIMEOUT');
}
