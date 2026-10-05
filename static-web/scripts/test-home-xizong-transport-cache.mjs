import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'home-xizong-transport-'));
try {
  for (const relative of ['content/xizong','static-web/src/assets/xizong','static-web/src/lib']) {
    fs.mkdirSync(path.dirname(path.join(root,relative)),{recursive:true});
    fs.cpSync(path.join(sourceRoot,relative),path.join(root,relative),{recursive:true});
  }
  fs.symlinkSync(path.join(sourceRoot,'static-web/node_modules'),path.join(root,'static-web/node_modules'),'dir');
  for(const name of ['package.json','package-lock.json']) {const file=path.join(sourceRoot,'static-web',name); if(fs.existsSync(file)) fs.copyFileSync(file,path.join(root,'static-web',name));}
  const run = code => execFileSync(process.execPath,['--input-type=module','-e',code],{
    cwd:path.join(root,'static-web'),env:{KIANOS_REPO_ROOT:root,KIANOS_XIZONG_BUILD_CACHE:'0'},
    encoding:'utf8',maxBuffer:32*1024*1024
  });
  // Two independent fresh processes, one fixed copied tree, complete old/new
  // output including every witness and question semantic revision.
  const baseline = run("import {buildHomeXizongProjection as build} from './src/lib/homeXizongProjection.mjs'; process.stdout.write(JSON.stringify(build()));");
  const optimized = run("import {loadHomeXizongProjectionTransport as load} from './src/lib/homeXizongProjection.mjs'; process.stdout.write((await load()).body);");
  assert.equal(optimized,baseline,'fresh optimized output byte-equals independent uncached baseline');
  for(const key of ['xizongPacketIndex','xizongForecastQuestionScope','xizongForecastCanonicalScope'])
    assert.deepEqual(JSON.parse(optimized)[key],JSON.parse(baseline)[key],key+' complete equivalence');
  process.env.KIANOS_REPO_ROOT = root;
  const { loadHomeXizongProjectionTransport: load } = await import('../src/lib/homeXizongProjection.mjs');
  const [original, concurrent] = await Promise.all([load(),load()]);
  assert.strictEqual(original,concurrent,'concurrent cold requests share the same real build');
  assert.strictEqual(await load(),original,'unchanged real cached projection is reused');
  const packet = JSON.parse(original.body);
  const source = packet.xizongPacketIndex[0].packetMeta.sourcePath;
  const cases = [
    ['source',source],
    ['learning','content/xizong/knowledge/learner/a1-circulation-learning.json'],
    ['relationship','content/xizong/knowledge/learner/a2-respiratory-pathways.json'],
    ['support','content/xizong/knowledge/learner/shared-fields.json'],
    ['exam format','content/xizong/questions/exam-format.json']
  ];
  for (const [name,relative] of cases) {
    const file=path.join(root,relative),bytes=fs.readFileSync(file),stat=fs.statSync(file);
    // Appending whitespace changes length; restore mtime to prove byte-based
    // invalidation. A separate same-length semantic replacement follows.
    fs.writeFileSync(file,Buffer.concat([bytes,Buffer.from('\n')]));
    fs.utimesSync(file,stat.atime,stat.mtime);
    if(name==='source') {
      await assert.rejects(load(), /STRICT_SOURCE_STALE/, 'changed Source with old projection binding fails closed');
      fs.writeFileSync(file,bytes);
      assert.equal((await load()).body,original.body);
      continue;
    }
    const [changed,second]=await Promise.all([load(),load()]);
    assert.notEqual(changed.revision,original.revision,name+' bytes invalidate');
    assert.strictEqual(changed,second,name+' concurrent rebuild coalesces');
    fs.writeFileSync(file,bytes);
    const restored=await load();
    assert.equal(restored.revision,original.revision,name+' restored dependency revision');
    assert.equal(restored.body,original.body,name+' exact canonical output restored');
  }
  for(const [relative,mutate] of [
    ['content/xizong/knowledge/learner/a3-urinary-source-visuals.json',d=>{d.bundles[0].assets[0].alt+=' cache counterexample';}],
    ['content/xizong/knowledge/learner/a2-respiratory-extensions.json',d=>{d.assets[0].payload.rows[0].obstructive+=' cache counterexample';}]
  ]) {
    const file=path.join(root,relative),bytes=fs.readFileSync(file),d=JSON.parse(bytes);mutate(d);fs.writeFileSync(file,JSON.stringify(d));
    const changed=await load();assert.notEqual(changed.body,original.body,'fresh module graph includes changed support meaning '+relative);
    if(relative.endsWith('-source-visuals.json')) {
      const before=fs.readFileSync(file),stat=fs.statSync(file);
      const replacement=Buffer.from(before.toString().replace('cache counterexample','equal counterexample'));
      assert.equal(replacement.length,before.length,'semantic replacement is equal byte length');
      assert.notDeepEqual(replacement,before);
      fs.writeFileSync(file,replacement);fs.utimesSync(file,stat.atime,stat.mtime);
      const equalLength=await load();
      assert.notEqual(equalLength.revision,changed.revision,'same length and restored mtime still invalidates real old cache');
      assert.notEqual(equalLength.body,changed.body,'equal-length alt replacement reaches witness');
    }
    fs.writeFileSync(file,bytes);assert.equal((await load()).body,original.body,'support restoration');
  }
  const unknown=path.join(root,'content/xizong/transport-unknown.txt');
  fs.writeFileSync(unknown,'unknown future public dependency');
  assert.notEqual((await load()).revision,original.revision,'unknown added file invalidates');
  fs.unlinkSync(unknown);
  assert.equal((await load()).revision,original.revision,'removed file invalidates');
  const invalid=path.join(root,'content/xizong/projection/manifest.json'),saved=fs.readFileSync(invalid);
  fs.writeFileSync(invalid,'invalid JSON');
  await assert.rejects(load(),'invalid owner fails rather than returning previous cached body');
  fs.writeFileSync(invalid,saved);
  const restored=await load();
  assert.equal(restored.body,original.body,'failed pending build is released for repaired owner');
  fs.writeFileSync(unknown,'start changed revision');
  const inFlight=load();
  setTimeout(()=>fs.writeFileSync(unknown,'changed during actual build'),100);
  await assert.rejects(inFlight,/DEPENDENCIES_CHANGED_DURING_BUILD/,'mid-build edit cannot publish');
  fs.unlinkSync(unknown);
  assert.equal((await load()).body,original.body);
  fs.symlinkSync(path.join(root,'static-web/package.json'),unknown);
  await assert.rejects(load(),/DEPENDENCY_SYMLINK/,'unknown external path fails closed');
  fs.unlinkSync(unknown);
  const restart=execFileSync(process.execPath,['--input-type=module','-e',"import {loadHomeXizongProjectionTransport as load} from './src/lib/homeXizongProjection.mjs'; console.log((await load()).revision);"],{cwd:path.join(root,'static-web'),env:{KIANOS_REPO_ROOT:root},encoding:'utf8'}).trim();
  assert.equal(restart,original.revision,'fresh process rebuilds correct current revision');
  const git=(...args)=>execFileSync('git',['-c','user.name=Transport Test','-c','user.email=transport-test@example.invalid',...args],{cwd:root,encoding:'utf8'}).trim();
  git('init','--quiet');
  git('add','content/xizong','static-web/src/lib','static-web/src/assets/xizong','static-web/package.json');
  git('commit','--quiet','-m','fixed canonical fixture');
  process.env.KIANOS_CANDIDATE_RUNTIME='1';
  const candidateFirst=await load();
  assert.equal(candidateFirst.body,baseline,'candidate=true also matches uncached semantics');
  assert.strictEqual(await load(),candidateFirst,'actual old candidate=true cache is reused');
  git('commit','--quiet','--allow-empty','-m','new candidate HEAD');
  const nextHead=await load();
  assert.notEqual(nextHead.revision,candidateFirst.revision,'candidate HEAD change invalidates actual cached revision');
  assert.equal(nextHead.body,candidateFirst.body,'HEAD-only change preserves canonical semantics');
  const sourceFile=path.join(root,source),sourceBytes=fs.readFileSync(sourceFile);
  fs.writeFileSync(sourceFile,Buffer.concat([sourceBytes,Buffer.from('\n')]));
  git('add',source);git('commit','--quiet','-m','changed source without updated projection binding');
  await assert.rejects(load(),/STRICT_SOURCE_STALE|STRICT_BLOB/,'candidate new HEAD cannot bypass stale Source binding with previous cache');
  fs.writeFileSync(sourceFile,sourceBytes);git('add',source);git('commit','--quiet','-m','restore bound source');
  assert.equal((await load()).body,baseline,'candidate rebuild recovers after binding repair');
  console.log('HOME_XIZONG_TRANSPORT_CACHE PASS: independent uncached equivalence, candidate HEAD/stale binding, equal-length restored mtime, real old cache, source/learning/relationship/support edits, unknown add/remove, failed rebuild, mid-build change, external symlink, concurrency and restart');
} finally { fs.rmSync(root,{recursive:true,force:true}); }
