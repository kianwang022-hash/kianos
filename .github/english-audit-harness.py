from pathlib import Path
import hashlib
p=Path('static-web/scripts/test-english-fresh-browser.py')
s=p.read_text()
s=s.replace("results=[];errors=[]", "results=[];errors=[];openpages=[]")
s=s.replace("'message':str(e)[:1800]", "'message':str(e)[:1800],'traceback':traceback.format_exc()[-2500:]")
s=s.replace("p=c.new_page();p.set_default_timeout", "p=c.new_page();openpages.append(p);p.on('dialog',lambda d:d.accept());p.set_default_timeout")
s=s.replace("p.on('pageerror',lambda e:errors.append(str(e)));p.on('dialog',lambda d:d.accept());return c,p", "p.on('pageerror',lambda e:errors.append(str(e)));return c,p")
s=s.replace("p.locator('[data-reading-next]').click()", "p.locator('[data-question]').nth(1).locator('[data-option=\"A\"]').click()")
s=s.replace("packet=json.loads(p.evaluate('navigator.clipboard.readText()'));assert len(packet['steps'])==9", "raw=p.evaluate('navigator.clipboard.readText()');assert raw.startswith('KIANOS_ENGLISH_EXAM_EVIDENCE_V1');packet=json.loads(raw[raw.index('{'):]);assert len(packet['steps'])==9")
s=s.replace("p.wait_for_url('**/cloze/audit-cl/**')", "p.wait_for_url('**/cloze/audit-cl/**',wait_until='domcontentloaded')")
s=s.replace("'traceback':traceback.format_exc()[-2500:]})", "'traceback':traceback.format_exc()[-2500:]})\n  for page in reversed(openpages):\n   if not page.is_closed():\n    try:\n     results[-1]['failure_url']=page.url;results[-1]['failure_body']=page.locator('body').inner_text()[-2200:];results[-1]['failure_storage']=page.evaluate('Object.fromEntries(Object.entries(localStorage))');page.screenshot(path=str(OUT/('failure-'+str(len(results))+'.png')));break\n    except Exception: pass")
assert hashlib.sha256(s.encode()).hexdigest() == 'ea751dbe9383f476f7e83601c0ac08fe4e531d49c9f53a1ab792629dc38c1ec6'
p.write_text(s)
