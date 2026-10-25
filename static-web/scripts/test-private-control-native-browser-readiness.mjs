import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {waitForNativeBrowser} from './privateControlNativeBrowserReadiness.mjs';

export async function testNativeBrowserReadiness(){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-native-readiness-'));
  const child=()=>({exitCode:null,signalCode:null});
  let count=0;
  const probe=async(name,{raw,process=child(),spawnError=()=>'',fetchImpl,prepare,timeoutMs=45}={},check)=>{
    const profile=path.join(root,name);fs.mkdirSync(profile);
    const file=path.join(profile,'DevToolsActivePort');
    if(raw!==undefined)fs.writeFileSync(file,raw);
    const cleanup=prepare?.(file);
    try{
      const result=await waitForNativeBrowser({child:process,profile,spawnError,fetchImpl,timeoutMs,pollMs:5});
      check(result);assert.ok(result.diagnostics.elapsedMs<timeoutMs+500,'deadline must remain bounded');count++;
    }finally{cleanup?.();}
  };
  const goodRaw='12345\n/devtools/browser/owned-id\n';
  const goodFetch=async()=>({ok:true,json:async()=>({Browser:'Synthetic Chrome',webSocketDebuggerUrl:'ws://127.0.0.1:12345/devtools/browser/owned-id'})});
  let server;
  try{
    await probe('missing',{},r=>{assert.equal(r.ready,false);assert.match(r.diagnostics.lastFileError,/ENOENT/);});
    await probe('unreadable',{prepare:file=>{fs.mkdirSync(file);}},r=>{assert.equal(r.ready,false);assert.match(r.diagnostics.lastFileError,/EISDIR/);});
    for(const raw of ['0\n/devtools/browser/owned-id','65536\n/devtools/browser/owned-id','12345\n','12345\n/not-a-browser']){
      await probe('invalid-'+count,{raw,fetchImpl:()=>{throw Error('invalid file must never probe CDP');}},r=>{
        assert.equal(r.ready,false);assert.equal(r.diagnostics.lastCdp,null);assert.equal(r.diagnostics.lastCdpError,'');
      });
    }
    await probe('exited',{process:{exitCode:7,signalCode:null}},r=>{assert.equal(r.reason,'PROCESS_EXITED');assert.equal(r.diagnostics.attempts,0);});
    await probe('signaled',{process:{exitCode:null,signalCode:'SIGTERM'}},r=>assert.equal(r.reason,'PROCESS_EXITED'));
    await probe('spawn',{spawnError:()=>'ENOENT: synthetic executable'},r=>assert.equal(r.reason,'SPAWN_ERROR'));
    await probe('cdp-down',{raw:goodRaw,fetchImpl:async()=>{throw Object.assign(Error('connection refused'),{code:'ECONNREFUSED'});}},r=>{
      assert.equal(r.ready,false);assert.match(r.diagnostics.lastCdpError,/ECONNREFUSED/);assert.ok(r.diagnostics.lastFile);
    });
    await probe('wrong-browser',{raw:goodRaw,fetchImpl:async()=>({ok:true,json:async()=>({webSocketDebuggerUrl:'ws://127.0.0.1:12345/devtools/browser/some-other-browser'})})},r=>assert.equal(r.reason,'CDP_IDENTITY_MISMATCH'));
    const dying=child();
    await probe('dies-during-probe',{raw:goodRaw,process:dying,fetchImpl:async()=>{dying.signalCode='SIGTERM';return goodFetch();}},r=>assert.equal(r.reason,'PROCESS_EXITED_DURING_CDP'));
    let tries=0;
    await probe('delayed-ready',{raw:goodRaw,timeoutMs:250,fetchImpl:async()=>{
      if(++tries===1)throw Error('still starting');return goodFetch();
    }},r=>{assert.equal(r.ready,true);assert.equal(r.port,12345);assert.ok(r.diagnostics.events.some(e=>e.kind==='CDP_NOT_READY'));});
    await probe('partial-file',{raw:'12345\n',timeoutMs:250,fetchImpl:goodFetch,prepare:file=>{
      const timer=setTimeout(()=>fs.writeFileSync(file,goodRaw),10);return ()=>clearTimeout(timer);
    }},r=>{assert.equal(r.ready,true);assert.ok(r.diagnostics.events.some(e=>e.kind==='PORT_FILE_INCOMPLETE_OR_INVALID'));});
    // Exercise the real Node fetch/AbortSignal boundary, not just a mock that
    // accepts an abort argument. A listening server never sends its body.
    let hanging=true;
    server=http.createServer((_request,response)=>{
      if(hanging)return;
      response.setHeader('Content-Type','application/json');
      response.end(JSON.stringify({Browser:'Synthetic HTTP Chrome',webSocketDebuggerUrl:`ws://127.0.0.1:${server.address().port}/devtools/browser/owned-id`}));
    });
    await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
    const port=server.address().port;
    await probe('hanging-http',{raw:`${port}\n/devtools/browser/owned-id\n`,timeoutMs:60},r=>{
      assert.equal(r.ready,false);assert.equal(r.reason,'STARTUP_TIMEOUT');assert.ok(r.diagnostics.lastCdpError);
    });
    hanging=false;
    await probe('actual-http-ready',{raw:`${port}\n/devtools/browser/owned-id\n`,timeoutMs:250},r=>{
      assert.equal(r.ready,true);assert.equal(r.diagnostics.lastCdp.browser,'Synthetic HTTP Chrome');
    });
    console.log(`PASS native browser readiness: ${count} isolated file/process/CDP/deadline cases; no Chrome launched`);
  }finally{
    if(server?.listening){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
    fs.rmSync(root,{recursive:true,force:true});
  }
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await testNativeBrowserReadiness();
