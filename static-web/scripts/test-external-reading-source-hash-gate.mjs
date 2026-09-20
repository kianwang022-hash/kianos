#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ensureExternalReadingPrivateBundle } from './privateExternalReadingStore.mjs';

const root=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-external-source-gate-'));
const privateDir=fs.mkdtempSync(path.join(os.tmpdir(),'kianos-external-bundle-'));

try{
  const missing=ensureExternalReadingPrivateBundle({sourceRoot:root,privateDir});
  assert.equal(missing.status,'missing_source');
  assert.ok(Array.isArray(missing.missing));
  assert.ok(missing.missing.length>0);

  const expected=[
    'source_manifest.json',
    ...Array.from({length:10},(_,i)=>`TOEFL/TPO${i+56}.md`),
    ...[17,18,19].map(n=>`IELTS/Cambridge_IELTS_${n}_Academic_Reading.md`)
  ];
  for(const relative of expected){
    const file=path.join(root,relative);
    fs.mkdirSync(path.dirname(file),{recursive:true});
    fs.writeFileSync(file,`stale fixture for ${relative}\n`,'utf8');
  }

  const stale=ensureExternalReadingPrivateBundle({sourceRoot:root,privateDir});
  assert.equal(stale.status,'stale_source');
  assert.equal(stale.mismatches.length,expected.length);
  assert.equal(stale.bundle,null);
  assert.ok(stale.mismatches.every(row=>row.relative&&row.expected_sha256&&row.actual_sha256));

  console.log('PASS external reading source hash gate');
}finally{
  fs.rmSync(root,{recursive:true,force:true});
  fs.rmSync(privateDir,{recursive:true,force:true});
}
