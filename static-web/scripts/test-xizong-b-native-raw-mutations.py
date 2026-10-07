from pathlib import Path
import json, hashlib, shutil, subprocess, os
script_dir=Path(__file__).resolve().parent
root=Path(os.environ.get('KIANOS_REPO_ROOT',script_dir.parents[1]));out=Path(os.environ.get('KIANOS_QA_DIR',root/'static-web/.qa'));out.mkdir(parents=True,exist_ok=True)
work=out/'b-native-raw-owner-fixture'
if work.exists():shutil.rmtree(work)
work.mkdir()
for folder in ['content','static-web/src']:shutil.copytree(root/folder,work/folder)
(work/'static-web/node_modules').symlink_to(root/'static-web/node_modules',target_is_directory=True)
watched=['static-web/scripts/test-xizong-b-native-raw-mutations.py','static-web/scripts/xizong-b-raw-owner-probe.mjs','static-web/scripts/fixtures/b-reviewed-native-memory.json','static-web/src/lib/xizong.mjs','static-web/src/lib/xizongLearningCues.mjs','static-web/src/lib/xizongMemoryRelease.mjs','static-web/src/lib/xizongMemoryModel.mjs','content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-learning-cues.json','content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-learning.json','content/xizong/knowledge/learner/shared-fields.json','content/xizong/knowledge/learner/biochemistry-27-source-map.json','content/xizong/knowledge/learner/BIOCHEMISTRY_CONTRACT.md']
def input_hashes():return {p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in watched}
tested_inputs=input_hashes()
fixture=json.loads((script_dir/'fixtures/b-reviewed-native-memory.json').read_text());by_id={x['id']:x for x in fixture['accepted']}
checks=[];failures=[];details=[]
def probe(id,mode='witness'):
 p=subprocess.run(['node',str(script_dir/'xizong-b-raw-owner-probe.mjs'),str(work),id,mode],capture_output=True,text=True)
 try:return json.loads(p.stdout)
 except Exception:raise AssertionError((p.returncode,p.stdout,p.stderr))
def jmut(fn):
 def change(b):
  x=json.loads(b);fn(x);return (json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode()
 return change
def run(name,relative,change,id,expect='NATIVE_OWNER_REVIEW_STALE',metadata=True,unrelated_d=False,unrelated_d19=False):
 file=work/relative;before=file.read_bytes();base=probe(id);index_before=(work/index_path).read_bytes()
 try:
  assert not base.get('error') and not base['result']['error'],base
  changed=change(before)
  if changed is None:file.unlink()
  else:file.write_bytes(changed)
  result=probe(id)
  error=result.get('error') or result['result']['error']
  global_rejection = name in ['exact accepted biochemical Source map status','map missing','map malformed']
  assert error and (expect in error if expect and not global_rejection else True),(name,result)
  global_rejection = name in ['exact accepted biochemical Source map status','map missing','map malformed']
  if metadata and not global_rejection:assert result['result']['core']==base['result']['core'],'metadata-only mutation changed Core'
  if unrelated_d and not global_rejection:assert result['unrelatedD']==base['unrelatedD'],'nondependent D admission changed'
  if global_rejection:assert result['unrelatedD']['error'],'existing global B hydration must also fail closed'
  if unrelated_d19:assert result['neighborD19']==base['neighborD19'],'unrelated supported D19 LG06 changed'
  if not result.get('error'):assert result['unrelatedA']==base['unrelatedA'],'A3 admission changed'
  if relative!=index_path:assert (work/index_path).read_bytes()==index_before,'runtime resolution must not auto-resign witnesses'
  checks.append(name);details.append({'name':name,'error':error,'fresh_process':True,'preexisting_global_b_hydration_rejection':global_rejection,'core_unchanged':not result.get('error') and result['result']['core']==base['result']['core']})
 except Exception as e:failures.append({'name':name,'error':str(e)})
 finally:file.write_bytes(before)
map_path='content/xizong/knowledge/learner/biochemistry-27-source-map.json';contract_path='content/xizong/knowledge/learner/BIOCHEMISTRY_CONTRACT.md';learning_path='content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-learning.json';index_path='content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-learning-cues.json';shared_path='content/xizong/knowledge/learner/shared-fields.json';mg='b-m04-kp08-gluconeogenesis-energy'
for label,fn,invalid in [
 ('PDF hash',lambda x:x['source'].__setitem__('sha256','0'*64),False),('source cycle',lambda x:x['source'].__setitem__('cycle','changed'),False),('source page count',lambda x:x['source'].__setitem__('pages',171),False),('source snapshot',lambda x:x['source'].__setitem__('markdown_snapshot','changed'),False),('allowed-claims authority boundary',lambda x:x['authority_boundary'].__setitem__('rule','changed allowed claims'),False),('primary formation role',lambda x:x['source_units'][0]['canonical_content'][0].__setitem__('role','PRIMARY_FORMATION'),False),('source unit pages',lambda x:x['source_units'][0].__setitem__('pdf',[3,9]),False),('schema',lambda x:x.__setitem__('schema','wrong'),True),('status',lambda x:x.__setitem__('status','UNAPPROVED'),True),('source authority',lambda x:x['authority_boundary'].__setitem__('current_source_truth','26 Source'),True),('substrate authority',lambda x:x['authority_boundary'].__setitem__('explanatory_substrate','second course'),True),('Learning owner',lambda x:x['authority_boundary'].__setitem__('learning_owner','wrong'),True),('contract owner',lambda x:x['authority_boundary'].__setitem__('biochemistry_contract','wrong'),True),('native source binding',lambda x:x['authority_boundary']['canonical_hierarchy_owners'].__setitem__('M4','wrong'),True)]:
 run('exact accepted biochemical Source map '+label,map_path,jmut(fn),mg,'NATIVE_B_SOURCE_CONTRACT_INVALID' if invalid else 'NATIVE_OWNER_REVIEW_STALE',unrelated_d=True)
run('map missing',map_path,lambda b:None,mg,'NATIVE_B_SOURCE_CONTRACT_MISSING_OR_INVALID',unrelated_d=True)
run('map malformed',map_path,lambda b:b'{invalid',mg,'NATIVE_B_SOURCE_CONTRACT_MISSING_OR_INVALID',unrelated_d=True)
run('map byte-only freshness',map_path,lambda b:b+b'\n',mg,unrelated_d=True)
for label,old,new,invalid in [('status','Status: **CURRENT**','Status: **OLD**',True),('scope','Biochemistry only — M1–M10 + G1–G5','All Systems',True),('allowed-claims','This contract does **not** own medical facts','This contract owns new medical facts',False),('parent authority','`content/xizong/LEARNING_CONTRACT.md`','`unreviewed.md`',True)]:
 run('exact biochemical contract '+label,contract_path,lambda b,old=old,new=new:b.replace(old.encode(),new.encode(),1),mg,'NATIVE_B_SOURCE_CONTRACT_INVALID' if invalid else 'NATIVE_OWNER_REVIEW_STALE',unrelated_d=True)
run('contract missing',contract_path,lambda b:None,mg,'NATIVE_B_SOURCE_CONTRACT_MISSING_OR_INVALID',unrelated_d=True)
run('contract same-path byte-only freshness',contract_path,lambda b:b+b'\n',mg,unrelated_d=True)
for key in ['requires','benefits_from','reactivates','returns_to']:
 run('accepted B readiness '+key,learning_path,jmut(lambda x,key=key:x['blocks']['D19']['readiness'][key].append('CHANGED_ACCEPTED_PREMISE')),'b-d19-lg06-cholangiocarcinoma',unrelated_d=True)
run('missing readiness',learning_path,jmut(lambda x:x['blocks']['D19'].pop('readiness')),'b-d19-lg06-cholangiocarcinoma','NATIVE_B_READINESS_INVALID',unrelated_d=True)
for label,fn in [('Tumor Gate definition',lambda x:x['system_route']['tumor_gate'].__setitem__('definition','changed')),('Tumor Gate scope',lambda x:x['system_route']['tumor_gate'].__setitem__('rule','changed')),('cross-System owner',lambda x:x['cross_system_handoff']['formal_target_owners'].__setitem__('tumor_general','wrong'))]:
 run('accepted '+label,learning_path,jmut(fn),'b-d19-lg06-cholangiocarcinoma')
for label,fn,invalid in [('current-target rule',lambda x:x['readiness_execution_policy'].__setitem__('rule','prior website completion required'),False),('confirmation evidence boundary',lambda x:x['readiness_execution_policy'].__setitem__('evidence_boundary','automatically complete prerequisites'),False),('execution status',lambda x:x['readiness_execution_policy'].__setitem__('status','OLD'),True),('execution authority',lambda x:x['readiness_execution_policy'].__setitem__('authority','UNREVIEWED'),True)]:
 run('B model-readiness '+label,learning_path,jmut(fn),'b-d19-lg06-cholangiocarcinoma','NATIVE_B_LEARNING_INVALID' if invalid else 'NATIVE_OWNER_REVIEW_STALE')
run('exact scoped independent gate',learning_path,jmut(lambda x:x['blocks']['D15']['readiness']['independent_gates'][0]['logic_group_ids'].append('b-d15-lg06')),'b-d15-lg06-dentate-line',unrelated_d=True)
owner_group=next(x for x in by_id['b-d19-kp16-aosc']['native_basis']['cores'] if x['kpId']=='digestive-d19-kp16')['groupId']
for value in [{'status':'HOLD','reason':'DECLARED_SOURCE_CONFLICT'}, {'status':'UNREVIEWED'}, None, 'malformed']:
 run('required Core owning LG conflict '+str(value),learning_path,jmut(lambda x,value=value:x['blocks']['D19']['logic_groups'][owner_group].__setitem__('source_conflict',value)),'b-d19-kp16-aosc','NATIVE_B_DEPENDENCY_SOURCE_CONFLICT',unrelated_d=True,unrelated_d19=True)
for key in ['first_pass_focus','stop_line','recall_spine']:
 run('actual Learning Block qualifier '+key,learning_path,jmut(lambda x,key=key:x['blocks']['D19'].__setitem__(key,x['blocks']['D19'][key]+' CHANGED')),'b-d19-kp16-aosc',unrelated_d=True)
for key in ['label','goal','closure']:
 run('actual LG metadata '+key,learning_path,jmut(lambda x,key=key:x['blocks']['D6']['logic_groups']['b-d06-lg05'].__setitem__(key,x['blocks']['D6']['logic_groups']['b-d06-lg05'][key]+' CHANGED')),'b-d06-lg05-endocrine-localization',unrelated_d=True)
kp='b-d01-kp02-slow-wave-frequency';relative=by_id[kp]['required_core_refs'][0]['source_path'];data=(work/relative).read_text();start=data.index('<!-- kianos:kp id="digestive-d1-kp02" -->');end=data.index('<!-- kianos:kp id="digestive-d1-kp03" -->');section=data[start:end];heading=next(l for l in section.splitlines() if l.startswith('## '));prompt=next(l for l in section.splitlines() if '主提示' in l)
run('actual raw title metadata-only',relative,lambda b:b.replace(heading.encode(),(heading+' CHANGED').encode(),1),kp)
run('actual raw full Prompt metadata-only',relative,lambda b:b.replace(prompt.encode(),prompt.replace('主提示：','主提示：CHANGED ').encode(),1),kp)
for label in ['讲义定位','Outline']:
 run('actual raw '+label+' metadata-only',relative,lambda b,label=label:b.replace(prompt.encode(),(prompt+'\n> **'+label+'：** DECLARED_CHANGED_LOCATOR').encode(),1),kp)
run('raw conflicting Prompt diagnostic',relative,lambda b:b.replace(prompt.encode(),(prompt+'\n> **主提示：** DECLARED_CONFLICT').encode(),1),kp,'NATIVE_KP_METADATA_DIAGNOSTIC')
for label,fn in [('missing member',lambda x:x['blocks']['D6']['logic_groups']['b-d06-lg05'].__setitem__('kp',[11,12])),('invalid member order',lambda x:x['blocks']['D6']['logic_groups']['b-d06-lg05'].__setitem__('kp',[12,10])),('missing LG',lambda x:x['blocks']['D6']['logic_groups'].pop('b-d06-lg05')),('duplicate LG membership',lambda x:x['blocks']['D6']['logic_groups'].__setitem__('b-d06-lg99',x['blocks']['D6']['logic_groups']['b-d06-lg05']))]:
 run('actual native LG '+label,learning_path,jmut(fn),'b-d06-lg05-endocrine-localization',expect=None,metadata=False)
run('actual raw Core frequency change',relative,lambda b:b.replace('约 **3 次 / min**'.encode(),'约 **4 次 / min**'.encode(),1),kp,'NATIVE_CORE_REVIEW_STALE',False)
run('actual raw owner ID removed',relative,lambda b:b.replace(b'kianos:kp id="digestive-d1-kp02"',b'kianos:kp id="changed-kp02"',1),kp,expect=None,metadata=False)
run('extra required raw Core AOSC Charcot trio changed',by_id['b-d19-kp16-aosc']['required_core_refs'][1]['source_path'],lambda b:b.replace('胆绞痛 + 黄疸 + 寒战高热'.encode(),'胆绞痛 + 黄疸 + CHANGED'.encode(),1),'b-d19-kp16-aosc','NATIVE_CORE_REVIEW_STALE',False,True)
for field in ['answer','mnemonic','scope_note','source']:
 run('raw item stale '+field,shared_path,jmut(lambda x,field=field:x['precision_fields'][kp].__setitem__(field,str(x['precision_fields'][kp].get(field,''))+' changed')),kp,'ITEM_REVIEW_STALE')
run('missing shared item',shared_path,jmut(lambda x:x['precision_fields'].pop(kp)),kp,'NATIVE_ITEM_SHAPE_INVALID',False)
run('missing used source binding',shared_path,jmut(lambda x:x['source_bindings'].pop('D1')),kp,'SOURCE_BINDING_MISMATCH')
idx=work/index_path;before=idx.read_bytes()
for mode in ['missing-ref','zero-admission','empty-index','absent-index','duplicate-index']:
 try:
  x=json.loads(before)
  if mode=='missing-ref':next(r for r in x['precision_index'] if r['id']==kp).pop('prepared_memory_ref')
  elif mode=='zero-admission':
   for row in x['precision_index']:
    if row['anchor']['block_id']=='D1':row.pop('prepared_memory_ref',None)
  elif mode=='empty-index':x['precision_index']=[]
  elif mode=='absent-index':x.pop('precision_index')
  else:x['precision_index'].append(x['precision_index'][0])
  idx.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');result=probe(kp,mode)
  if mode=='duplicate-index':assert 'CUE_ID_DUPLICATE' in result.get('error',''),result
  else:assert result.get('status')=='PASS',result
  checks.append('actual native index '+mode+' fail-closed with historical preservation');details.append(result)
 except Exception as e:failures.append({'name':mode,'error':str(e)})
 finally:idx.write_bytes(before)
# An unrelated real held LG is not an input to AOSC or cholangiocarcinoma.
file=work/learning_path;before_learning=file.read_bytes();supported=['b-d19-kp16-aosc','b-d19-lg06-cholangiocarcinoma']
for mode in ['change-unrelated-hold','remove-unrelated-hold']:
 try:
  bases={id:probe(id) for id in supported};x=json.loads(before_learning)
  if mode=='change-unrelated-hold':x['blocks']['D19']['logic_groups']['b-d19-lg07']['source_conflict']['note']+=' DECLARED_CHANGE'
  else:x['blocks']['D19']['logic_groups']['b-d19-lg07'].pop('source_conflict')
  file.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
  for id in supported:
   actual=probe(id);assert actual==bases[id],(mode,id,actual)
  checks.append(mode+': unrelated D19 supported intents remain exact/current')
 except Exception as e:failures.append({'name':mode,'error':str(e)})
 finally:file.write_bytes(before_learning)
try:
 before_shared=(work/shared_path).read_bytes();idx.unlink();result=probe(kp,'missing-file')
 assert 'ENOENT' in result.get('error',''),result
 assert (work/shared_path).read_bytes()==before_shared
 checks.append('absent whole B cue owner fails unavailable without fallback or shared writes')
except Exception as e:failures.append({'name':'absent whole B cue owner','error':str(e)})
finally:idx.write_bytes(before)
if input_hashes()!=tested_inputs:failures.append({'name':'tested input byte stability','error':'Native inputs changed during test; retry only after reviewing the delta.'})
report={'input_sha256':tested_inputs,'status':'FAIL' if failures else 'PASS','scope':'Fresh process actual native loader and cue/admission consumers; cache disabled; every altered owner isolated in fixture; no live owner mutation or learner evidence.', 'passed':len(checks),'checks':checks,'details':details,'failures':failures}
(out/'xizong-b-native-raw-mutations.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':report['status'],'passed':len(checks),'failures':failures},ensure_ascii=False,indent=2));raise SystemExit(bool(failures))
