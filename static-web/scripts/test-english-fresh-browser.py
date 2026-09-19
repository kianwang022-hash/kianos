from playwright.sync_api import sync_playwright
from pathlib import Path
import json, time, traceback, os, sys
OUT=Path(os.environ.get('AUDIT_OUTPUT_DIR','.qa/english-fresh'));OUT.mkdir(parents=True,exist_ok=True);BASE=os.environ.get('AUDIT_BASE_URL','http://127.0.0.1:4333');results=[];errors=[];openpages=[]

def record(name,fn):
 try:
  detail=fn();results.append({'name':name,'status':'PASS','detail':detail})
 except Exception as e:
  results.append({'name':name,'status':'FAIL','message':str(e)[:1800],'traceback':traceback.format_exc()[-2500:]})
  for page in reversed(openpages):
   if not page.is_closed():
    try:
     results[-1]['failure_url']=page.url;results[-1]['failure_body']=page.locator('body').inner_text()[-2200:];results[-1]['failure_storage']=page.evaluate('Object.fromEntries(Object.entries(localStorage))');page.screenshot(path=str(OUT/('failure-'+str(len(results))+'.png')));break
    except Exception: pass

def state(page,key):return page.evaluate('(k)=>JSON.parse(localStorage.getItem(k)||"null")',key)
def shot(page,name):page.screenshot(path=str(OUT/(name+'.png')),full_page=False)
def ctx(browser):
 c=browser.new_context(viewport={'width':1512,'height':982},permissions=['clipboard-read','clipboard-write']);p=c.new_page();openpages.append(p);p.on('dialog',lambda d:d.accept());p.set_default_timeout(6500);p.on('pageerror',lambda e:errors.append(str(e)));return c,p

with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=os.environ.get('AUDIT_CHROMIUM') or None,args=['--no-sandbox'])
 def reading():
  c,p=ctx(browser);requests=[];p.on('request',lambda r:requests.append(r.url));p.goto(BASE+'/reading/audit-ra1/');p.locator('[data-question]').first.wait_for()
  assert p.locator('[data-question]').count()==5
  p.locator('[data-question]').nth(1).locator('[data-option="A"]').click()
  assert p.locator('[data-question]').evaluate_all('(xs)=>xs.every(x=>!x.hidden&&getComputedStyle(x).display!=="none")')
  assert not any('/reading-answer/' in u for u in requests)
  assert p.locator('[data-question]').evaluate_all('(xs)=>xs.every(x=>JSON.parse(x.dataset.answer||\'""\')==="")')
  shot(p,'fresh-reading-clean')
  for q in p.locator('[data-question]').all():q.locator('[data-option="A"]').click()
  p.locator('[data-reading-submit]').click();p.wait_for_function('JSON.parse(localStorage.getItem("kianos-reading-attempt-v1:audit-ra1")||"null")?.submitted===true')
  assert all(v=='correct' for v in state(p,'kianos-reading-attempt-v1:audit-ra1')['results'].values())
  assert p.locator('[data-reading-repair]').evaluate_all('(xs)=>xs.every(x=>x.hidden)')
  p.reload();p.locator('[data-question]').first.wait_for();assert state(p,'kianos-reading-attempt-v1:audit-ra1')['submitted']
  c.close();return 'Five question sections remain available; focus only, no pre-submit answer request, stable result has no repair panels; refresh preserved.'
 record('Reading A whole-question focus / clean answer gate / quiet stable / refresh',reading)
 def cloze():
  c,p=ctx(browser);requests=[];p.on('request',lambda r:requests.append(r.url));p.goto(BASE+'/cloze/audit-cl/');p.locator('[data-objective-question]').first.wait_for();assert p.locator('[data-objective-question]').count()==20
  assert p.locator('[data-objective-question]').evaluate_all('(xs)=>xs.every(x=>!x.hidden&&getComputedStyle(x).display!=="none")');assert '[20]' in p.locator('[data-objective-material]').inner_text();shot(p,'fresh-cloze-clean')
  for q in p.locator('[data-objective-question]').all():q.locator('[data-value="A"]').click()
  assert not any('/cloze-answer/' in u for u in requests)
  p.locator('[data-objective-submit]').click();p.wait_for_function('JSON.parse(localStorage.getItem("kianos-cloze-attempt-v1:audit-cl")||"null")?.submitted===true')
  s=state(p,'kianos-cloze-attempt-v1:audit-cl');assert len(s['answers'])==20;assert all(x=='correct' for x in s['results'].values());c.close();return 'Full 20-row sheet and continuous passage; one whole-unit submit.'
 record('Cloze complete passage, twenty visible answer rows and whole submit',cloze)
 for form in ['gap_match','heading_match','ordering','comment_match']:
  def partb(form=form):
   c,p=ctx(browser);p.goto(BASE+'/reading-b/audit-'+form+'/');p.locator('[data-reading-b-select]').first.wait_for();assert p.locator('[data-reading-b-task-form]').get_attribute('data-reading-b-task-form')==form;assert p.locator('[data-reading-b-select]').count()==5;assert p.locator('[data-objective-candidate]').count()==7
   if form=='ordering':assert p.locator('[data-reading-b-fixed]').count()==2
   for i,el in enumerate(p.locator('[data-reading-b-select]').all()):el.select_option(['B','C','D','E','F'][i])
   # Assignments remain revisable before whole-set submission.
   p.locator('[data-reading-b-select]').first.select_option('');p.locator('[data-reading-b-select]').first.select_option('B');shot(p,'fresh-'+form)
   p.locator('[data-objective-submit]').click();p.wait_for_function('(k)=>JSON.parse(localStorage.getItem(k)||"null")?.submitted===true',arg='kianos-reading-b-attempt-v1:audit-'+form)
   s=state(p,'kianos-reading-b-attempt-v1:audit-'+form);assert all(v=='correct' for v in s['results'].values());c.close();return 'Whole map/candidate inventory retained; editable placements; correct form-specific projection.'
  record('Part B '+form+' material/map/candidates and reassignment',partb)
 def translation():
  c,p=ctx(browser);requests=[];p.on('request',lambda r:requests.append(r.url));p.goto(BASE+'/translation/audit-tr/');p.locator('[data-attempt-id]').first.wait_for();assert p.locator('[data-attempt-id]').count()==5
  assert 'advice desk' in p.locator('[data-translation-source-text]').inner_text();p.locator('[data-attempt-id]').first.fill('第一份独立译文');p.locator('[data-freeze-first]').click();assert not state(p,'kianos-translation-attempt-v2:audit-tr')['firstSubmittedAt']
  for i,a in enumerate(p.locator('[data-attempt-id]').all()):a.fill('独立译文'+str(i+1))
  assert not any('/translation-reference/' in u for u in requests);shot(p,'fresh-translation-clean');p.locator('[data-freeze-first]').click();first=state(p,'kianos-translation-attempt-v2:audit-tr')['firstAttempts'];assert len(first)==5;p.locator('[data-pass-clean]').click();p.reload();assert state(p,'kianos-translation-attempt-v2:audit-tr')['firstAttempts']==first;assert state(p,'kianos-translation-attempt-v2:audit-tr')['stage']=='passed';c.close();return 'Partial freeze rejected; full source visible; references not fetched; full first version preserved after PASS/reload.'
 record('Translation whole-set first attempt, no reference leak and cheap PASS',translation)
 def writing():
  c,p=ctx(browser);p.goto(BASE+'/writing/writing-synthetic-small-v1/');p.locator('[data-essay-draft]').wait_for();assert p.locator('[data-plan-field]').is_hidden();text='Dear Sam, Please join our reading group at the library on Friday at two. We will share book recommendations and discuss useful reading habits. New members are welcome to bring a short story and a question. Please let me know whether you can attend. Best wishes, Pat.'
  p.locator('[data-essay-draft]').fill(text);p.locator('[data-essay-draft]').press('End');p.locator('[data-essay-draft]').press('Space');p.locator('[data-essay-draft]').press('1');assert p.locator('[data-essay-draft]').input_value().endswith(' 1');shot(p,'fresh-writing-direct');p.locator('[data-lock-first]').click();p.locator('.writingDirectReview').wait_for();s=state(p,'kianos-writing-runtime-v1:writing-synthetic-small-v1');first=s['firstDraft'];assert s['firstPlan']==''
  p.get_by_role('button',name='这篇可以了',exact=True).click();p.wait_for_function('JSON.parse(localStorage.getItem("kianos-writing-runtime-v1:writing-synthetic-small-v1")||"null")?.state==="PASS_ACCEPTABLE"');assert state(p,'kianos-writing-runtime-v1:writing-synthetic-small-v1')['firstDraft']==first
  p.goto(BASE+'/writing/writing-synthetic-big-v1/');p.locator('[data-plan-mode][value="planned"]').check();p.locator('[data-plan-draft]').fill('Describe the contrast; explain cooperation; conclude.');p.locator('[data-essay-draft]').fill('Tools have value when people use them effectively. Owning a resource is only a starting point. A shared plan allows a group to combine different skills and learn from feedback. This is why cooperation can turn available tools into useful results.');p.locator('[data-lock-first]').click();assert state(p,'kianos-writing-runtime-v1:writing-synthetic-big-v1')['firstPlan'].startswith('Describe');c.close();return 'Direct creates no fake plan; typing shortcuts stay inside editor; optional Planned works; manual PASS preserves first draft without Chat JSON.'
 record('Writing Direct / Planned / typing / learner-owned PASS',writing)
 def instructions():
  c,p=ctx(browser);p.goto(BASE+'/english/');p.locator('[data-english-session-control]').wait_for();catalog=json.loads(p.locator('[data-english-session-catalog]').text_content());assert len(catalog['reading_a'])>0
  p.locator('[data-english-session-control] > summary').click();p.locator('[data-english-toggle-import]').click()
  d=p.evaluate('new Date().toLocaleDateString("en-CA")');ts=p.evaluate('new Date().toISOString()');value={'schema':'kianos.english.session-instruction.v1','session_id':'browser-audit','study_day':d,'generated_at':ts,'current_step':0,'steps':[{'step_id':'s','task':'writing','object_id':'invented'}]}
  p.locator('[data-english-session-input]').fill(json.dumps(value));p.locator('[data-english-apply-session]').click();assert state(p,'kianos-english-session-instruction-v1') is None
  value['steps'][0]['object_id']='writing-synthetic-small-v1';value['steps'].append({'step_id':'b','task':'writing','object_id':'writing-synthetic-big-v1'});p.locator('[data-english-session-input]').fill(json.dumps(value));p.locator('[data-english-apply-session]').click();assert state(p,'kianos-english-session-instruction-v1')['session_id']=='browser-audit'
  p.evaluate('localStorage.setItem("kianos-writing-runtime-v1:writing-synthetic-small-v1",JSON.stringify({state:"PASS_ACCEPTABLE",firstDraft:"synthetic QA completion"}))');p.reload();assert p.locator('[data-english-resume-link]').get_attribute('href').endswith('/writing/writing-synthetic-big-v1/');shot(p,'fresh-english-resume');p.locator('[data-english-session-control] > summary').click();p.locator('[data-english-clear-session]').click();assert p.locator('[data-english-resume]').is_hidden();assert p.locator('a[href="/reading/"]').count()>0;c.close();return 'Invented ID rejected before write; exact current synthetic IDs accepted; follows only explicit order; no instruction still allows normal navigation.'
 record('Chat exact-ID import / atomic rejection / explicit-order Resume / free navigation',instructions)
 def examseal():
  c,p=ctx(browser);req=[];p.on('request',lambda r:req.append(r.url));p.goto(BASE+'/english-exam/audit-synthetic/');p.locator('[data-exam-start]').click();p.wait_for_url('**/cloze/audit-cl/**',wait_until='domcontentloaded');p.locator('[data-objective-question]').first.locator('[data-value="A"]').click();p.locator('[data-exam-return]').click();p.wait_for_url('**/english-exam/audit-synthetic/');p.locator('[data-exam-seal]').click();s=state(p,'kianos-english-exam-session-v1');assert s['status']=='SEALED';assert s['captures']['cl']['payload']['answers']['cl1']=='A';assert s['captures']['cl']['completed_at'] is None;assert not any('/cloze-answer/' in u or '/english-exam-answer/' in u for u in req)
  p.locator('[data-exam-release]').click();p.wait_for_function('JSON.parse(localStorage.getItem("kianos-english-exam-session-v1")).status==="RELEASED"');s=state(p,'kianos-english-exam-session-v1');assert s['release']['objective']['points']==0.5;assert 'points' not in s['release']['productive'];shot(p,'fresh-exam-partial-release');c.close();return 'Unfinished draft survived leaving task and early Seal; no answer HTTP requests before release; no invented subjective score.'
 record('Real exam page: unfinished-part capture / unified Seal / delayed release',examseal)
 def examfull():
  c,p=ctx(browser);req=[];p.on('request',lambda r:req.append(r.url));p.goto(BASE+'/english-exam/audit-synthetic/');p.locator('[data-exam-start]').click();p.wait_for_url('**/cloze/audit-cl/**',wait_until='domcontentloaded');deadline=state(p,'kianos-english-exam-session-v1')['deadline_at']
  for index in range(9):
   s=state(p,'kianos-english-exam-session-v1');step=s['steps'][s['current_step']];assert s['deadline_at']==deadline
   if step['task']=='cloze':
    for q in p.locator('[data-objective-question]').all():q.locator('[data-value="A"]').click()
   elif step['task']=='reading_a':
    for q in p.locator('[data-question]').all():q.locator('[data-option="A"]').click()
   elif step['task']=='reading_b':
    for i,q in enumerate(p.locator('[data-reading-b-select]').all()):q.select_option(['B','C','D','E','F'][i])
   elif step['task']=='translation':
    for i,q in enumerate(p.locator('[data-attempt-id]').all()):q.fill('合成测试中的独立译文'+str(i+1))
   else:p.locator('[data-essay-draft]').fill('This is a complete synthetic test output. It explains why tools work better when people coordinate their use. The output belongs only to the isolated engineering test session.')
   with p.expect_navigation(wait_until='domcontentloaded'):p.locator('[data-exam-complete]').click()
  s=state(p,'kianos-english-exam-session-v1');assert len(s['captures'])==9;assert s['deadline_at']==deadline
  assert not any('/reading-answer/' in u or '/cloze-answer/' in u or '/reading-b-answer/' in u for u in req)
  ordinary=p.evaluate('Object.keys(localStorage).filter(k=>/^kianos-(reading-attempt|cloze-attempt|reading-b-attempt|translation-attempt|writing-runtime)/.test(k))');assert ordinary==[],ordinary
  p.locator('[data-exam-seal]').click();p.locator('[data-exam-release]').click();p.wait_for_function('JSON.parse(localStorage.getItem("kianos-english-exam-session-v1")).status==="RELEASED"');s=state(p,'kianos-english-exam-session-v1');assert s['release']['objective']['points']==60;assert s['captures']['tr']['payload']['answers'];assert s['captures']['ws']['payload']['essay'];assert s['captures']['wb']['payload']['essay'];shot(p,'fresh-exam-complete-release');p.locator('[data-exam-copy]').click();raw=p.evaluate('navigator.clipboard.readText()');assert raw.startswith('KIANOS_ENGLISH_EXAM_EVIDENCE_V1');packet=json.loads(raw[raw.index('{'):]);assert len(packet['steps'])==9;assert packet['steps'][-1]['capture']['payload']['essay'];c.close();return 'Nine actual Current template pages, one deadline, no ordinary-attempt writes, all output preserved, 60/60 objective and full productive Chat packet.'
 record('Integrated nine-part exam journey / state isolation / objective 60 / productive export',examfull)
 browser.close()
 # Real browser-profile restart, not copying a storage-state JSON into a fresh browser.
 def restart():
  profile=OUT/'browser-profile';c=pw.chromium.launch_persistent_context(str(profile),executable_path=os.environ.get('AUDIT_CHROMIUM') or None,args=['--no-sandbox'],viewport={'width':1512,'height':982});p=c.new_page();openpages.append(p);p.on('dialog',lambda d:d.accept());p.set_default_timeout(8000);p.goto(BASE+'/english-exam/audit-synthetic/');p.locator('[data-exam-start]').click();p.wait_for_url('**/cloze/audit-cl/**',wait_until='domcontentloaded');p.locator('[data-objective-question]').first.locator('[data-value="A"]').click();before=state(p,'kianos-english-exam-session-v1');url=p.url;c.close()
  c=pw.chromium.launch_persistent_context(str(profile),executable_path=os.environ.get('AUDIT_CHROMIUM') or None,args=['--no-sandbox'],viewport={'width':1512,'height':982});p=c.new_page();openpages.append(p);p.on('dialog',lambda d:d.accept());p.set_default_timeout(8000);p.goto(url);assert state(p,'kianos-english-exam-session-v1')['deadline_at']==before['deadline_at'];assert state(p,f'kianos-english-exam-task-v1:{before["session_id"]}:cloze:audit-cl')['answers']['cl1']=='A'
  p.evaluate('''()=>{const k='kianos-english-exam-session-v1';const s=JSON.parse(localStorage.getItem(k));s.deadline_at=new Date(Date.now()-1).toISOString();s.started_at=new Date(Date.parse(s.deadline_at)-180*60000).toISOString();localStorage.setItem(k,JSON.stringify(s));}''');p.reload();p.wait_for_url('**/english-exam/audit-synthetic/');s=state(p,'kianos-english-exam-session-v1');assert s['status']=='SEALED';assert s['captures']['cl']['payload']['answers']['cl1']=='A';c.close();return 'Physical Chromium profile restart preserved deadline and in-progress answers; simulated deadline expiry then auto-Sealed without losing draft. Not a real three-hour learner trial.'
 record('Browser restart and accelerated deadline expiry preserve draft',restart)

report={'synthetic_only':True,'platform':'Linux Chromium 1512x982; NOT real macOS / NOT learner U','results':results,'page_errors':list(dict.fromkeys(errors)),'pass':sum(x['status']=='PASS' for x in results),'fail':sum(x['status']=='FAIL' for x in results)}
(OUT/'browser-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))

if report["fail"]: sys.exit(1)
