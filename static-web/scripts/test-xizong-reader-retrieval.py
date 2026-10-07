from html.parser import HTMLParser
from pathlib import Path
import json,re,sys,hashlib,subprocess,os
class Node:
 def __init__(self,tag='root',attrs=(),parent=None):self.tag=tag;self.attrs=dict(attrs);self.parent=parent;self.children=[]
 def text(self):return ''.join(c if isinstance(c,str) else c.text() for c in self.children)
 def all(self):
  yield self
  for c in self.children:
   if isinstance(c,Node):yield from c.all()
 def visible(self):
  n=self
  while n.parent:
   p=n.parent
   if p.tag=='details' and 'open' not in p.attrs and n.tag!='summary':return False
   n=p
  return True
class Tree(HTMLParser):
 def __init__(self):super().__init__();self.root=Node();self.stack=[self.root]
 def handle_starttag(self,t,a):
  n=Node(t,a,self.stack[-1]);self.stack[-1].children.append(n)
  if t not in ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']:self.stack.append(n)
 def handle_endtag(self,t):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i].tag==t:self.stack=self.stack[:i];break
 def handle_data(self,s):self.stack[-1].children.append(s)
def clean(t):return re.sub(r'\s+',' ',t).strip()
def parse(p):
 t=Tree();t.feed(p.read_text());return t.root

def kp(n):return n.attrs.get('data-kp',n.attrs.get('data-kp-id'))
def source_node(n):
 if n.tag=='footer':return True
 if n.tag=='details':
  summary=next((c for c in n.children if isinstance(c,Node) and c.tag=='summary'),None)
  if 'source-routing' in n.attrs.get('class','') or n.attrs.get('id')=='source-and-scope':return True
  if summary and any(w in summary.text() for w in ['来源与阅读边界','来源、精确复习','需要精确回看时']):return True
 return False
def medical(n):
 if kp(n) or source_node(n) or n.attrs.get('class')=='model-retrieval-keys':return ''
 return ''.join(c if isinstance(c,str) else medical(c) for c in n.children)
def digest(s):return hashlib.sha256(re.sub(r'\s+','',s).encode()).hexdigest()
def node_groups(t):
 groups=[];g=None
 for n in t.all():
  if n.tag=='h2':g={'heading':clean(medical(n)),'keys':[]};groups.append(g)
  if g and kp(n) and n.visible():g['keys'].append(kp(n))
 return groups

from urllib.parse import urlparse,unquote
root=Path(os.environ.get('KIANOS_REPO_ROOT',Path(__file__).resolve().parents[2]));script=Path(__file__).resolve().parent
oracle=json.loads((script/'fixtures/xizong-reader-retrieval.json').read_text());env=dict(os.environ,KIANOS_REPO_ROOT=str(root),KIANOS_XIZONG_BUILD_CACHE='0')
js="""import fs from 'node:fs';import {marked} from 'marked';import {pathToFileURL} from 'node:url';const root=process.env.KIANOS_REPO_ROOT;const native=await import(pathToFileURL(root+'/static-web/src/lib/xizong.mjs'));const out=[];for(const [system,family,prefix,count] of [['respiratory','a2-respiratory','r',12],['urinary','a3-urinary','b',14]])for(let n=1;n<=count;n++){const nn=String(n).padStart(2,'0'),path='content/xizong/projection/'+family+'/chat/b'+nn+'-teaching.md',md=fs.readFileSync(root+'/'+path,'utf8'),b=native.loadXizongBlock(system,prefix+nn);out.push({path,html:marked.parse(md),keys:b.kpRecords.map(k=>({id:k.kpId,text:k.title+'〔'+k.prompt+'〕'}))});}console.log(JSON.stringify(out));"""
rows=json.loads(subprocess.check_output(['node','--input-type=module','-e',js],cwd=root/'static-web',env=env,text=True));checks=[];failures=[]
def check(name,ok):
 (checks if ok else failures).append(name)
for row in rows:
 o=next(x for x in oracle['readers'] if x['path']==row['path']);t=Tree();t.feed(row['html']);tree=t.root;nodes=list(tree.all());bindings=[n for n in nodes if kp(n)];keys={kp(n):n for n in bindings}
 check(row['path']+' exact native identities once',len(bindings)==len(keys)==len(row['keys']) and set(keys)=={x['id'] for x in row['keys']})
 for x in row['keys']:check(x['id']+' native title/full Prompt',x['id'] in keys and clean(keys[x['id']].text())==clean(x['text']))
 check(row['path']+' same medical model and explanations',digest(medical(tree))==o['medical_sha256'])
 check(row['path']+' same-node closed-default full keys',node_groups(tree)==o['nodes'])
 check(row['path']+' answer explanations remain closed',all('open' not in n.attrs for n in nodes if n.tag=='details' and not source_node(n)))
 for local in ['finite-accounting.json','memory-proposals.md','memory-proposals.json','non-kp-disposition.json','本地 disposition']:check(row['path']+' no local-only promise '+local,local not in tree.text())
 for n in nodes:
  href=n.attrs.get('href')
  if not href:continue
  u=urlparse(href)
  if u.netloc=='github.com' and '/kianos/blob/' in u.path:
   ref,path=unquote(u.path.split('/kianos/blob/',1)[1]).split('/',1);p=root/path
   check(row['path']+' repo path '+path,p.is_file())
   if p.is_file() and u.fragment:
    f=unquote(u.fragment);lines=p.read_text().splitlines();m=re.fullmatch(r'L(\d+)(?:-L(\d+))?',f)
    if m:check(row['path']+' line selector '+path+'#'+f,1<=int(m[1])<=int(m[2] or m[1])<=len(lines))
    else:
     ids=re.findall(r'\bid=["\']([^"\']+)', '\n'.join(lines));heads=[re.sub(r'[^\w\-\s]','',re.sub(r'^#+\s*','',l).lower()).replace(' ','-') for l in lines if re.match(r'^#+ ',l)]
     check(row['path']+' anchor '+path+'#'+f,f in ids or f in heads)
  elif not u.scheme and not u.netloc:check(row['path']+' local path '+href,(root/row['path']).parent.joinpath(unquote(u.path)).is_file())
# Accepted-reader status is a reference to its existing owner, never a competing snapshot.
# Candidate metadata comments and dated source/medical holds remain untouched.
stale_entry_phrases = [
 '当前仍是候选阅读稿', '当前是候选阅读稿', '本页仍为候选',
 '候选学习稿。', '内容候选</p>', '本稿是连续教案候选',
 '本地待审教学稿', 'prepared答案为本地待审提案',
 '准备答案仅为待审提案，未进入真实Memory', '具体非KP逐项处置随本地审查清单交付',
]
for family in ['a1-circulation', 'a2-respiratory', 'a3-urinary']:
 for path in sorted((root/'content/xizong/projection'/family/'chat').glob('b??-teaching.md')):
  text=re.sub(r'<!--[\s\S]*?-->', '', path.read_text())
  for phrase in stale_entry_phrases:check(str(path.relative_to(root))+' no stale current-stage claim '+phrase,phrase not in text)
for n in range(1,5):
 row=next(x for x in rows if x['path'].endswith('/a2-respiratory/chat/b%02d-teaching.md'%n))
 check(row['path']+' actual cue owner', 'a2-respiratory-learning-cues.json#L' in row['html'])
 check(row['path']+' no nonexistent local accounting owner', '本地审查清单交付' not in row['html'])
# Negative examples target obsolete delivery prose, not genuine Source/clinical HOLD.
check('stale Memory claim is rejected', any(p in '准备答案仅为待审提案，未进入真实Memory。' for p in stale_entry_phrases))
check('genuine Source HOLD retained', not any(p in 'Current <120；候选≤120不采用；原图未核、PPD阈值缺失保持HOLD。' for p in stale_entry_phrases))

# Tree adversaries: a nested summary cannot escape an outer closed body; same-line tags stay closed.
for markup,expected in [('<details><summary><span data-kp="a">A</span></summary><span data-kp="b">B</span></details>',{'a'}),('<details><summary>A</summary><details><summary><span data-kp="b">B</span></summary></details></details>',set()),('<details open><summary>A</summary><details><summary><span data-kp="b">B</span></summary><span data-kp="c">C</span></details></details>',{'b'})]:
 t=Tree();t.feed(markup);check('closed-details HTML tree adversary '+markup,{kp(n) for n in t.root.all() if kp(n) and n.visible()}==expected)
# Mutate the exact audited examples: folded key, truncated Prompt and exposed answers must fail their real oracle.
for path,kid in [('content/xizong/projection/a3-urinary/chat/b03-teaching.md','urinary-b03-kp03'),('content/xizong/projection/a3-urinary/chat/b05-teaching.md','urinary-b05-kp02')]:
 row=next(x for x in rows if x['path']==path);o=next(x for x in oracle['readers'] if x['path']==path);t=Tree();t.feed(row['html']);key=next(n for n in t.root.all() if kp(n)==kid);key.attrs['data-kp']=key.attrs.get('data-kp',key.attrs.get('data-kp-id'));d=Node('details',parent=key.parent);key.parent.children[key.parent.children.index(key)]=d;d.children=[key];key.parent=d;check(kid+' missing retrieval mutation rejected',node_groups(t.root)!=o['nodes']);key.children=['truncated'];check(kid+' shortened Prompt mutation rejected',clean(key.text())!=next(x['text'] for x in row['keys'] if x['id']==kid));d.attrs['open']='';check(kid+' exposed answer mutation rejected',any('open' in n.attrs for n in t.root.all() if n.tag=='details'))
out=Path(os.environ.get('KIANOS_QA_DIR',root/'static-web/.qa'));out.mkdir(parents=True,exist_ok=True);report={'status':'FAIL' if failures else 'PASS','checks':len(checks),'native_keys':sum(len(r['keys']) for r in rows),'readers':len(rows),'failures':failures,'claim':'Actual marked HTML/tree and native title/Prompt evidence; no browser, Source pixels, learner records or mastery claim.'};(out/'xizong-reader-retrieval.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False,indent=2));sys.exit(bool(failures))
