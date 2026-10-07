"""Compare native marked rendering with fixed independently reviewed complete DOM.
No browser claim; the fixture comes from the reviewed full reader, never copied
from production render or refreshed automatically. Stdlib-only Python.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse,unquote
import json,re,hashlib,subprocess,os,sys,copy
class Node:
 def __init__(self,tag='root',attrs=(),parent=None):self.tag=tag;self.attrs=dict(attrs);self.parent=parent;self.children=[]
 def text(self):return ''.join(x if isinstance(x,str) else x.text() for x in self.children)
 def all(self):
  yield self
  for x in self.children:
   if isinstance(x,Node):yield from x.all()
class Tree(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.root=Node();self.stack=[self.root]
 def handle_starttag(self,t,a):
  n=Node(t,a,self.stack[-1]);self.stack[-1].children.append(n)
  if t not in ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']:self.stack.append(n)
 def handle_startendtag(self,t,a):self.handle_starttag(t,a);self.handle_endtag(t)
 def handle_endtag(self,t):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i].tag==t:self.stack=self.stack[:i];break
 def handle_data(self,s):self.stack[-1].children.append(s)
def clean(s):return re.sub(r'\s+',' ',s).strip()
def digest(s):return hashlib.sha256(s.encode()).hexdigest()
def text_digest(s):return digest(re.sub(r'\s+','',s))
def parse(s):t=Tree();t.feed(s);return t.root
def classes(n):return set(n.attrs.get('class','').split())
def is_shell(n):
 if n.tag in ['head','script','style']:return True
 if classes(n)&{'toolbar','mode-note'}:return True
 if n.tag=='nav':
  hrefs=[x.attrs['href'] for x in n.all() if 'href' in x.attrs]
  return bool(hrefs) and any(not urlparse(h).scheme and not h.startswith('#') for h in hrefs)
 return False
def remove_shell(n):
 n.children=[c for c in n.children if isinstance(c,str) or not is_shell(c)]
 for c in n.children:
  if isinstance(c,Node):remove_shell(c)
 return n
def body(s):
 t=parse(s);m=[n for n in t.all() if n.tag=='main'];base=m[0] if len(m)==1 else t
 return remove_shell(base)
def hidden(n):
 style=n.attrs.get('style','').replace(' ','').lower()
 return 'hidden' in n.attrs or n.attrs.get('aria-hidden')=='true' or 'display:none' in style or 'visibility:hidden' in style or bool(classes(n)&{'hidden','kp-id','kid','id'})
def visible(n):
 child=n
 while child:
  if hidden(child):return False
  parent=child.parent
  if parent and parent.tag=='details' and 'open' not in parent.attrs and child.tag!='summary':return False
  child=parent
 return True
def closed_text(n):
 if hidden(n):return ''
 children=n.children
 if n.tag=='details' and 'open' not in n.attrs:children=[c for c in children if isinstance(c,Node) and c.tag=='summary']
 return ''.join(c if isinstance(c,str) else closed_text(c) for c in children)
def kp(n,keys):
 a=n.attrs.get('data-kp',n.attrs.get('data-kp-id'));return a if a in keys else n.attrs.get('id') if n.tag=='details' and n.attrs.get('id') in keys else None
def snapshot(t,keys):
 nodes=list(t.all());regions=[]
 for sec in [n for n in nodes if n.tag=='section']:
  owned=[kp(n,keys) for n in sec.all() if kp(n,keys)]
  if not owned:continue
  regions.append({'id':sec.attrs.get('id'),'heading':clean(' '.join(n.text() for n in sec.children if isinstance(n,Node) and n.tag in ['h2','h3'])),'owner_keys':owned,'closed_keys':[kp(n,keys) for n in sec.all() if kp(n,keys) and visible(n)],'full_text_sha256':text_digest(sec.text()),'closed_text_sha256':text_digest(closed_text(sec))})
 details=[]
 for d in [n for n in nodes if n.tag=='details']:
  summary=next((n for n in d.children if isinstance(n,Node) and n.tag=='summary'),None)
  details.append({'id':d.attrs.get('id'),'summary':clean(summary.text()) if summary else None,'open':'open' in d.attrs,'full_text_sha256':text_digest(d.text())})
 links=[{'href':n.attrs['href'],'text':clean(n.text())} for n in nodes if n.tag=='a' and 'href' in n.attrs]
 return {'full_text_sha256':text_digest(t.text()),'closed_text_sha256':text_digest(closed_text(t)),'regions':regions,'details':details,'links':links}
def binding_errors(t,keys):
 ns=list(t.all());errors=[]
 for kid,text in keys.items():
  found=[n for n in ns if kp(n,keys)==kid]
  if len(found)!=1:errors.append(kid+' identity multiplicity');continue
  n=found[0]
  target=next((x for x in n.children if isinstance(x,Node) and x.tag=='summary'),n) if n.tag=='details' else n
  if text not in target.text():errors.append(kid+' incomplete Current title/Prompt')
  if not visible(target):errors.append(kid+' hidden closed-default retrieval key')
 return errors

def main():
 script=Path(__file__).resolve().parent;root=Path(os.environ.get('KIANOS_REPO_ROOT',script.parents[1]));oracle=Path(os.environ.get('KIANOS_B_READER_ORACLE',script/'fixtures/b-reader-retrieval.json'));fixture=json.loads(oracle.read_text());env=dict(os.environ,KIANOS_REPO_ROOT=str(root),KIANOS_XIZONG_BUILD_CACHE='0')
 js="""import fs from 'node:fs';import {marked} from 'marked';import {pathToFileURL} from 'node:url';const root=process.env.KIANOS_REPO_ROOT;const native=await import(pathToFileURL(root+'/static-web/src/lib/xizong.mjs'));let out=[];for(const r of JSON.parse(fs.readFileSync(process.env.KIANOS_B_READER_ORACLE,'utf8')).readers){const b=native.loadXizongBlock('digestive-metabolic-endocrine-tumor',r.slug);out.push({path:r.path,html:marked.parse(fs.readFileSync(root+'/'+r.path,'utf8')),keys:Object.fromEntries(b.kpRecords.map(k=>[k.kpId,k.title+'〔'+k.prompt+'〕']))})}console.log(JSON.stringify(out));"""
 env['KIANOS_B_READER_ORACLE']=str(oracle);rows=json.loads(subprocess.check_output(['node','--input-type=module','-e',js],cwd=root/'static-web',env=env,text=True));checks=[];failures=[]
 def check(name,ok,detail=None):
  if ok:checks.append(name)
  else:failures.append({'name':name,'detail':detail})
 for row in rows:
  o=next(r for r in fixture['readers'] if r['path']==row['path']);t=body(row['html']);snap=snapshot(t,o['keys']);err=binding_errors(t,o['keys']);check(row['path']+' native Current identity/title/Prompt unchanged',row['keys']==o['keys']);check(row['path']+' own-node visible full Current keys',not err,err)
  for part in ['full_text_sha256','closed_text_sha256','regions','details','links']:check(row['path']+' reviewed complete '+part,snap[part]==o['expected'][part])
  ids={n.attrs.get('id') for n in t.all() if n.attrs.get('id')}
  for link in snap['links']:
   href=unquote(link['href']);u=urlparse(href)
   if href.startswith('#'):check(row['path']+' internal anchor '+href,href[1:] in ids);continue
   if not u.scheme:check(row['path']+' no unpublished local promise '+href,False);continue
   # Only these existing admission/answer owners are live entry references.
   # Original medical/Source destinations remain pinned below without exception.
   current_entries = {
    'content/xizong/knowledge/systems/b-digestive-metabolic-endocrine-tumor/ACCEPTANCE.md',
    'content/xizong/knowledge/learner/b-digestive-metabolic-endocrine-tumor-learning-cues.json',
    'content/xizong/knowledge/learner/shared-fields.json'}
   current_prefix='/kianwang022-hash/kianos/blob/main/'
   if u.netloc=='github.com' and u.path.startswith(current_prefix):
    target=u.path[len(current_prefix):]
    check(row['path']+' exact existing current entry '+href,target in current_entries and not u.fragment and (root/target).is_file())
    continue
   parts=u.path.split('/');ok=u.netloc=='github.com' and len(parts)>5 and parts[1:3]==['kianwang022-hash','kianos'] and parts[3] in ['blob','tree'] and parts[4]==fixture['source_ref'];check(row['path']+' pinned repository destination '+href,ok)
   if not ok:continue
   target='/'.join(parts[5:]).rstrip('/');proof=fixture['published_targets'].get(target);check(row['path']+' verified owner '+target,proof is not None)
   p=root/target
   check(row['path']+' real published owner '+target,p.exists())
   if u.fragment:
    m=re.fullmatch(r'L(\d+)(?:-L(\d+))?',u.fragment);check(row['path']+' reviewed line selector '+href,bool(m))
    if m and p.is_file():check(row['path']+' actual line span '+href,1<=int(m[1])<=int(m[2] or m[1])<=len(p.read_text().splitlines()))
 # Adversaries prove the fixture is sensitive to key placement, prompt truncation,
 # explanation loss and unpublished fallback routes, not just visible totals.
 for row in rows:
  o=next(r for r in fixture['readers'] if r['path']==row['path']);t=body(row['html']);ns=list(t.all());k=next((n for n in ns if kp(n,o['keys'])),None)
  if k:
   k.attrs['hidden']='';check(o['block']+' hidden-key adversary rejected',bool(binding_errors(t,o['keys'])))
  t=body(row['html']);k=next((n for n in t.all() if kp(n,o['keys'])),None)
  if k:
   k.children=['truncated'];check(o['block']+' shortened-Prompt adversary rejected',bool(binding_errors(t,o['keys'])))
  t=body(row['html']);d=next((n for n in t.all() if n.tag=='details'),None)
  if d:
   d.children=[n for n in d.children if isinstance(n,Node) and n.tag=='summary'];check(o['block']+' missing-expansion adversary rejected',snapshot(t,o['keys'])['details']!=o['expected']['details'])
  t=body(row['html']);a=next((n for n in t.all() if n.tag=='a'),None)
  if a:
   a.attrs['href']='memory-proposals.json';check(o['block']+' local-accounting-route adversary rejected',snapshot(t,o['keys'])['links']!=o['expected']['links'])
 out=Path(os.environ.get('KIANOS_QA_DIR',root/'static-web/.qa'));out.mkdir(parents=True,exist_ok=True);report={'scope':'Actual native loader and marked closed/expanded tree equality to independently reviewed full reader; not browser/served/Source proof.','fixture_sha256':digest(oracle.read_text()),'readers':len(rows),'native_keys':sum(len(r['keys']) for r in rows),'passed':len(checks),'failed':len(failures),'failures':failures};(out/'xizong-b-reader-retrieval.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False,indent=2));return bool(failures)
if __name__=='__main__':sys.exit(main())
