"""Synthetic profiles only. Document reproducible blockers without calling them acceptance PASS."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, os, traceback
OUT=Path(os.environ.get('AUDIT_OUTPUT_DIR','.qa/english-fresh'));OUT.mkdir(parents=True,exist_ok=True)
BASE=os.environ.get('AUDIT_BASE_URL','http://127.0.0.1:4333');rows=[]
def snapshot(p):return p.evaluate('Object.fromEntries(Object.entries(localStorage))')
def filtered(d):return {k:v for k,v in d.items() if any(x in k for x in ['vocabulary','lexical','transfer-claims','review-return'])}
with sync_playwright() as pw:
 browser=pw.chromium.launch()
 def context():
  c=browser.new_context(viewport={'width':1512,'height':982});p=c.new_page();p.set_default_timeout(15000);p.on('dialog',lambda d:d.accept());return c,p
 for task,url,source,word,key in [('Reading A','/reading/audit-ra1/?audit_return=1#keep','[data-reading-passage]','help','kianos-reading-attempt-v1:audit-ra1'),('Cloze','/cloze/audit-cl/?audit_return=1#keep','[data-objective-material]','care','kianos-cloze-attempt-v1:audit-cl'),('Translation','/translation/audit-tr/?audit_return=1#keep','[data-translation-source-text]','help','kianos-translation-attempt-v2:audit-tr')]:
  c,p=context()
  try:
   p.goto(BASE+url);p.locator(source).first.wait_for()
   if task=='Reading A':p.locator('[data-question]').first.locator('[data-option="B"]').click()
   elif task=='Cloze':p.locator('[data-objective-question]').first.locator('[data-value="B"]').click()
   else:p.locator('[data-attempt-id]').first.fill('查词往返前已经写下的独立译文')
   before=snapshot(p)
   p.evaluate('''([selector,word])=>{const root=document.querySelector(selector),walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;while(node=walk.nextNode()){const i=node.textContent.indexOf(word);if(i<0)continue;const r=document.createRange();r.setStart(node,i);r.setEnd(node,i+word.length);const s=window.getSelection();s.removeAllRanges();s.addRange(r);root.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));return;}throw new Error('Word absent from synthetic source');}''',[source,word])
   p.locator('[data-selection-lexical]').click();p.wait_for_url('**/vocabulary/*/?mode=lookup',wait_until='domcontentloaded');p.locator('[data-local-port="vocabulary"]').wait_for()
   assert p.locator('[data-local-port="vocabulary"]').get_attribute('data-vocab-mode')=='lookup'
   assert p.locator('[data-local-port="vocabulary"]').get_attribute('data-vocab-word')==word
   assert filtered(snapshot(p))==filtered(before),'Lookup mutated lexical routing/repair evidence'
   p.screenshot(path=str(OUT/('fresh-lookup-'+task.lower().replace(' ','-')+'.png')))
   p.locator('[data-english-return-action]').click();p.wait_for_url(BASE+url,wait_until='domcontentloaded')
   assert snapshot(p).get(key)==before.get(key),'Return changed original answer/draft'
   assert filtered(snapshot(p))==filtered(before)
   rows.append({'path':task+' lookup -> exact original task','status':'PASS','detail':'Exact canonical word, lookup-only; unchanged lexical evidence, original answer/draft and full query/hash return.'})
  except Exception as e:
   rows.append({'path':task+' lookup -> exact original task','status':'BLOCKED','detail':str(e)[-1600:],'trace':traceback.format_exc()[-1800:],'url':p.url});p.screenshot(path=str(OUT/('failure-lookup-'+task.lower().replace(' ','-')+'.png')))
  finally:c.close()
 for probe in ['invalid-partial-return','invented-lexical-target']:
  c,p=context()
  try:
   p.goto(BASE+'/reading/audit-ra1/');p.locator('[data-question]').first.wait_for()
   for i,q in enumerate(p.locator('[data-question]').all()):q.locator('[data-option="'+('B' if i==0 else 'A')+'"]').click()
   p.locator('[data-reading-submit]').click();p.locator('[data-transfer-toggle]').wait_for();p.locator('[data-transfer-toggle]').click()
   packet={'schema':'kianos.english.objective_review_return.v1','task':'reading_a','objectId':'audit-ra1','threads':[],'newClaims':[],'claimUpdates':[]}
   if probe=='invalid-partial-return':
    packet['threads']=[{'threadId':'ok','scope':'local','itemIds':['ra1q1'],'route':'reading_a','summary':'Synthetic one-off adjudication','repairCompleted':True,'repairEvidence':'Learner independently states the decisive contrast.'},{'threadId':'bad','route':'INVENTED_ROUTE'}];packet['newClaims']=[{'claimId':'qa-invalid-batch','sourceThreadId':'ok','statement':'Synthetic repeated task demand.'}]
   else:packet['threads']=[{'threadId':'fake','scope':'local','itemIds':['ra1q1'],'route':'lexical','summary':'Synthetic exact-target negative test','repairCompleted':False,'lexicalEvidence':{'word_id':'word:answer','ordinal':209,'word':'answer','target_kind':'sense','target_id':'sense:THIS_TARGET_DOES_NOT_EXIST','outcome':'WRONG','demand':'recognition'}}]
   before=filtered(snapshot(p));p.locator('[data-transfer-input]').fill(json.dumps(packet));p.locator('[data-transfer-apply]').click();p.wait_for_timeout(400);after=filtered(snapshot(p));changed=[k for k in set(before)|set(after) if before.get(k)!=after.get(k)]
   rows.append({'path':probe,'status':'BLOCKED' if changed else 'PASS','detail':'Invalid return must leave every affected state byte unchanged.','changed_keys':changed,'status_text':p.locator('[data-transfer-status]').text_content()});p.screenshot(path=str(OUT/('fresh-'+probe+'.png')))
  except Exception as e:rows.append({'path':probe,'status':'UNTESTED','detail':str(e),'trace':traceback.format_exc()[-1800:]})
  finally:c.close()
 browser.close()
report={'synthetic_only':True,'platform':'Linux Chromium; not macOS or learner U','results':rows}
(OUT/'integration-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
if any(r['status']=='UNTESTED' for r in rows):raise SystemExit(1)
