from pathlib import Path
import json,hashlib,shutil,subprocess,os
script_dir=Path(__file__).resolve().parent;root=Path(os.environ.get('KIANOS_REPO_ROOT',script_dir.parents[1]));here=Path(os.environ.get('KIANOS_QA_DIR',root/'static-web/.qa'));here.mkdir(parents=True,exist_ok=True);work=here/'a3-raw-owner-fixture';
if work.exists():shutil.rmtree(work)
work.mkdir()
for folder in ['content','static-web/src']:shutil.copytree(root/folder,work/folder)
(work/'static-web/node_modules').symlink_to(root/'static-web/node_modules',target_is_directory=True)
checks=[];failures=[];details=[]
def probe(id):
 p=subprocess.run(['node',str(script_dir/'xizong-a3-raw-owner-probe.mjs'),str(work),id],capture_output=True,text=True)
 assert p.returncode==0,(p.stdout,p.stderr)
 return json.loads(p.stdout)
def run(name,file,change,id,expect='NATIVE_OWNER_REVIEW_STALE',metadata=True):
 before=file.read_bytes();base=probe(id)
 try:
  changed=change(before)
  if changed is None:file.unlink()
  else:file.write_bytes(changed)
  result=probe(id)
  assert result['result']['error'] and expect in result['result']['error'],result['result']
  if metadata:assert result['result']['core']==base['result']['core'],'metadata-only changed Core unexpectedly'
  if expect=='NATIVE_OWNER_REVIEW_STALE':assert result['result']['witness']['owner_sha256']!=base['result']['witness']['owner_sha256']
  if id.startswith('a3-b05'):
   assert result['unrelated']==base['unrelated'],'unrelated A3 admission changed'
   assert result['a2']==base['a2'],'A2 admission changed'
   assert result['a1']==base['a1'],'A1 admission changed'
  checks.append(name);details.append({'name':name,'error':result['result']['error'],'core_unchanged':result['result']['core']==base['result']['core'],'fresh_process':True})
 except Exception as e:failures.append({'name':name,'error':str(e)})
 finally:file.write_bytes(before)
def jmut(fn):
 def change(b):
  x=json.loads(b);fn(x);return (json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode()
 return change
contract=work/'content/xizong/knowledge/learner/a3-urinary-b05-external-source-contract.json';id='a3-b05-lg06-precision'
for name,fn in [
 ('allowed claim',lambda x:x['sources'][0]['allowed_claims'].__setitem__(0,'changed admitted claim')),
 ('diagnostic algorithm',lambda x:x['allowed_algorithm'].__setitem__(0,'changed diagnostic scope')),
 ('prohibited treatment',lambda x:x['scope_limits']['may_not_change'].__setitem__(0,'changed prohibition')),
 ('source priority',lambda x:x['scope_limits'].__setitem__('source_priority','changed priority')),
 ('anti-drift',lambda x:x['anti_drift'].__setitem__(0,'changed anti-drift')),
 ('source URL',lambda x:x['sources'][0].__setitem__('url','https://example.invalid/changed')),
 ('provenance accessed',lambda x:x['sources'][0].__setitem__('accessed','2099-01-01')),
 ('wrong status',lambda x:x.__setitem__('status','NOT_ADMITTED')),
 ('wrong system',lambda x:x.__setitem__('system_id','respiratory')),
 ('wrong Block',lambda x:x.__setitem__('block_id','urinary-b06')),
 ('wrong schema',lambda x:x.__setitem__('schema','wrong')),
 ('wrong authority',lambda x:x.__setitem__('authority','UNREVIEWED'))]:
 run('B5 full contract '+name,contract,jmut(fn),id,'NATIVE_EXTERNAL_CONTRACT_INVALID' if name.startswith('wrong') else 'NATIVE_OWNER_REVIEW_STALE')
run('B5 same-path byte-only newline stales old witness',contract,lambda b:b+b'\n',id)
run('B5 missing file is local dependent failure',contract,lambda b:None,id,'NATIVE_EXTERNAL_CONTRACT_MISSING')
run('B5 malformed JSON is local dependent failure',contract,lambda b:b'{invalid',id,'NATIVE_EXTERNAL_CONTRACT_INVALID')
oracle=json.loads((script_dir/'fixtures/a3-independent-review.json').read_text());entries=[oracle['raw_mutation_dependency']]
# Nonmember cross-Block dependency is native KP06 of B4, required by B3 LG05.
dep=next(x for x in entries if x['kp_id']=='urinary-b04-kp06');file=work/dep['source_path'];cue='a3-b03-lg05-precision';raw=file.read_text();section=dep['literal_raw_section_excerpt'];lines=section.splitlines();heading=lines[0]
run('raw cross-Block nonmember title metadata-only rejects',file,lambda b:b.replace(heading.encode(),(heading+' [INDEPENDENT MUTATION]').encode(),1),cue)
for label in ['主提示','讲义定位']:
 line=next(x for x in lines if x.lstrip().startswith('>') and label in x)
 run('raw cross-Block nonmember '+label+' metadata-only rejects',file,lambda b,line=line:b.replace(line.encode(),(line.rstrip()+' [INDEPENDENT MUTATION]').encode(),1),cue)
# Real Current Learning qualifier and LG metadata pass through the unchanged native loader.
learning=work/'content/xizong/knowledge/learner/a3-urinary-learning.json'
for key in ['first_pass_focus','stop_line','recall_spine']:
 run('raw Learning cross-Block qualifier '+key,learning,jmut(lambda x,key=key:x['blocks']['urinary-b04'].__setitem__(key,x['blocks']['urinary-b04'][key]+' [INDEPENDENT MUTATION]')),cue)
for key in ['label','goal','closure']:
 run('raw Learning primary LG '+key,learning,jmut(lambda x,key=key:x['blocks']['urinary-b01']['logic_groups']['urinary-b01-lg04'].__setitem__(key,x['blocks']['urinary-b01']['logic_groups']['urinary-b01-lg04'][key]+' [INDEPENDENT MUTATION]')),'a3-b01-lg04-precision')
index_path=work/'content/xizong/knowledge/learner/a3-urinary-learning-cues.json';index_before=index_path.read_bytes()
for mode in ['missing-ref','zero-admission']:
 try:
  ix=json.loads(index_before)
  for row in ix['precision_index']:
   if row['anchor']['block_id']=='urinary-b01' and (mode=='zero-admission' or row['id']=='a3-b01-lg04-precision'):row.pop('prepared_memory_ref',None)
  index_path.write_text(json.dumps(ix,ensure_ascii=False,indent=2)+'\n')
  p=subprocess.run(['node',str(script_dir/'xizong-a3-raw-admission-probe.mjs'),str(work),mode],capture_output=True,text=True)
  result=json.loads(p.stdout);assert p.returncode==0,result
  checks.append('raw index '+mode+' excludes current prepared view and preserves historical data');details.append(result)
 except Exception as e:failures.append({'name':mode,'error':str(e)})
 finally:index_path.write_bytes(index_before)
report={'status':'PASS' if not failures else 'FAIL','claims':'Each altered raw owner reloaded by actual native loader in a fresh process with cache disabled; all writes isolated in review fixture. No product or runtime-owner writes.','passed':len(checks),'checks':checks,'failures':failures,'details':details,'input_hashes':{str(f.relative_to(root)):hashlib.sha256(f.read_bytes()).hexdigest() for f in [root/'static-web/src/lib/xizongLearningCues.mjs',root/'static-web/src/lib/xizong.mjs']}}
(here/'xizong-a3-raw-owner-mutations.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':report['status'],'passed':len(checks),'failures':failures},ensure_ascii=False,indent=2))
raise SystemExit(bool(failures))
