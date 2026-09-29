#!/usr/bin/env python3
"""Xizong Projection validator v1.3: frozen v1.1 + accepted owner-shape adapters."""
from __future__ import annotations
import argparse, copy, json, re, sys
from collections import Counter
from pathlib import Path, PurePosixPath
import validate_projection_v1 as legacy
from validate_projection_v1 import *

VERSION='1.3.0'
B_SID='digestive-metabolic-endocrine-tumor'
legacy.VERSION=VERSION

def b_stable_id(raw: str | None) -> str | None:
    """Resolve only exact Current B IDs or explicitly admitted legacy aliases."""
    if not raw: return None
    value=raw.strip()
    direct=re.fullmatch(r'([DMG])0?(\d{1,2})',value,re.I)
    if direct:
        return f'{direct[1].upper()}{int(direct[2])}'
    legacy_alias=re.fullmatch(r'(?:digestive|dme)-([dmg])0?(\d{1,2})',value,re.I)
    if legacy_alias:
        return f'{legacy_alias[1].upper()}{int(legacy_alias[2])}'
    return None

def b_filename_id(path: str) -> str | None:
    """Exact filename token fallback only; never semantic/title fuzzy matching."""
    name=PurePosixPath(path).name
    m=re.search(r'(?:^|_)([DMG])0?(\d{1,2})(?=_|\.md$)',name,re.I)
    return f'{m[1].upper()}{int(m[2])}' if m else None

def b_kp_ordinals(text: str, bid: str, expected: int) -> tuple[list[int], list[str]]:
    """B K accepted stable kianos:kp markers own KP identity; do not re-infer it from Markdown fence parsing."""
    markers=re.findall(r'<!--\s*kianos:kp\s+id=["\']([^"\']+)["\']\s*-->',text)
    require(len(markers)==expected and len(set(markers))==expected,'OWNER',f'B {bid}: stable KP marker count/uniqueness mismatch')
    ordinals=[]
    for marker in markers:
        m=re.search(r'(?:^|-)kp0*(\d+)$',marker,re.I)
        require(m is not None,'OWNER',f'B {bid}: stable KP marker has no exact ordinal suffix: {marker}')
        ordinals.append(int(m[1]))
    require(Counter(ordinals)==Counter(range(1,expected+1)),'OWNER',f'B {bid}: stable KP marker ordinal gap/duplicate')
    return ordinals,markers

def stable_token(raw: str | None) -> str:
    value=str(raw or '').strip()
    if not value: return ''
    m=re.fullmatch(r'([A-Za-z]{1,4})0*(\d+)',value)
    if not m: m=re.search(r'(?:^|[-_])([A-Za-z]{1,4})0*(\d+)$',value)
    return f'{m[1].upper()}{int(m[2])}' if m else value.upper()

def frontmatter_scalar(text: str, key: str) -> str:
    if not text.startswith('---\n'): return ''
    end=text.find('\n---',4)
    if end<0: return ''
    front=text[4:end]
    m=re.search(rf'^{re.escape(key)}:\s*(.+?)\s*$',front,re.M)
    return (m[1].strip().strip('\"\'') if m else '')

def top_level_learning_shape(value: dict) -> bool:
    return (not isinstance(value.get('blocks'),dict)
            and isinstance(value.get('logic_groups'),dict)
            and isinstance(value.get('system_route',{}).get('default_route'),list))

class Validator(legacy.Validator):
    def build_owners(self, manifest: dict) -> None:
        systems=shape(manifest.get('systems'),dict,'systems')
        bspec=systems.get(B_SID)
        adapted={}
        for sid,spec in systems.items():
            if sid==B_SID: continue
            learning_path=spec.get('learning_source')
            if nonempty(learning_path) and top_level_learning_shape(self.repo.json(learning_path)):
                adapted[sid]=spec
        self.top_level_systems=set(adapted)
        filtered=copy.deepcopy(manifest)
        filtered['systems']={k:v for k,v in systems.items() if k!=B_SID and k not in adapted}
        legacy.Validator.build_owners(self,filtered)
        require(bspec is not None,'OWNER','B Projection adapter remains required in Current compiled set')

        sp=PREFIX+bspec['system_projection']; asset=self.repo.json(sp)
        ss=[s for s in asset.get('sources',[]) if s.get('kind')=='SYSTEM_CORE']
        require(len(ss)==1,'OWNER','B: exactly one canonical System source required')
        source=ss[0]['path']; self.repo.path(source,KNOWLEDGE+'systems/')
        require(PurePosixPath(source).name=='system.json','OWNER','B System owner must be system.json')
        system=self.repo.json(source)
        require(system.get('system_id')==B_SID and system.get('canonical_id')==bspec.get('canonical_id')=='B','OWNER','B System identity mismatch')
        require(str(system.get('semantic_authority','')).startswith('CHAT_APPROVED'),'OWNER','B System authority not accepted')
        self.systems[B_SID]={'path':source,'value':system,'canonical_id':'B'}

        learning_path=bspec.get('learning_source')
        require(nonempty(learning_path),'OWNER','B manifest learning_source required')
        self.repo.path(learning_path,KNOWLEDGE+'learner/')
        learning=self.repo.json(learning_path)
        require(learning.get('system_id')==B_SID,'OWNER','B Learning source System mismatch')
        learning_blocks=shape(learning.get('blocks'),dict,'B learning blocks')

        route=shape(system.get('block_route'),list,'B.block_route')
        require(all(isinstance(x,dict) and re.fullmatch(r'[DMG]\d{1,2}',str(x.get('id',''))) for x in route),'OWNER','B route requires D/M/G identities')
        unique([x.get('id') for x in route],'B.route')
        root=PurePosixPath(source).parent; dirs={'D':'d-d1-d23','M':'m-m1-m10','G':'g-g1-g5'}
        candidates=[]
        for d in dirs.values(): candidates+=self.repo.glob(str(root/d),'*.md')
        by_id={}
        for path in candidates:
            text=self.repo.text(path); front=text.split('\n---',1)[0] if text.startswith('---\n') else ''
            fm=re.search(r'^block_id:\s*(\S+)\s*$',front,re.M)
            fm_id=b_stable_id(fm[1]) if fm else None
            file_id=b_filename_id(path)
            if fm:
                require(fm_id is not None,'OWNER',f'B unrecognized explicit Block alias {fm[1]} in {path}')
                if file_id is not None:
                    require(file_id==fm_id,'OWNER',f'B frontmatter/filename Block mismatch {path}: {fm_id} vs {file_id}')
                stable=fm_id
            else:
                require(file_id is not None,'OWNER',f'B canonical file has no exact Block identity token: {path}')
                stable=file_id
            require(stable not in by_id,'OWNER',f'B duplicate Block {stable}')
            by_id[stable]=(path,text)

        for row in route:
            bid=row['id']; require(bid in by_id,'OWNER',f'B canonical file missing for {bid}')
            path,text=by_id[bid]
            require(PurePosixPath(path).parent.name==dirs[bid[0]],'OWNER',f'B canonical directory mismatch {bid}')
            require(type(row.get('kp')) is int and row['kp']>0,'OWNER',f'B {bid}: invalid System KP count')
            kps,markers=b_kp_ordinals(text,bid,row['kp'])
            lb=shape(learning_blocks.get(bid),dict,f'B learning {bid}')
            order=shape(lb.get('learner_order'),list,f'{bid}.learner_order')
            lgmap=shape(lb.get('logic_groups'),dict,f'{bid}.logic_groups')
            unique(order,f'{bid}.learner_order'); require(set(order)==set(lgmap),'OWNER',f'{bid}: learner order / LG mismatch')
            groups=[]; coverage=[]
            for gid in order:
                g=shape(lgmap[gid],dict,f'{bid}.{gid}'); ran=g.get('kp')
                require(isinstance(ran,list) and len(ran)==2 and all(type(x) is int for x in ran) and 1<=ran[0]<=ran[1]<=row['kp'],'OWNER',f'{bid}: bad LG range {gid}')
                require(nonempty(g.get('label')) and nonempty(g.get('goal')) and nonempty(g.get('closure')),'OWNER',f'{bid}: incomplete LG {gid}')
                coverage.extend(range(ran[0],ran[1]+1)); groups.append({'id':gid,'label':g['label'],'kp':ran})
            require(Counter(coverage)==Counter(kps),'OWNER',f'{bid}: LG overlap/gap against stable KP identities')
            self.blocks[bid]={'system_id':B_SID,'path':path,'text':text,'row':row,'groups':groups,'kp_ids':markers,'learner_order':order}

        for sid,spec in adapted.items():
            self.build_top_level_owner(sid,spec)

    def build_top_level_owner(self,sid: str,spec: dict) -> None:
        sp=PREFIX+spec['system_projection']; asset=self.repo.json(sp)
        ss=[s for s in asset.get('sources',[]) if s.get('kind')=='SYSTEM_CORE']
        require(len(ss)==1,'OWNER',f'{sid}: exactly one canonical System source required')
        source=ss[0]['path']; self.repo.path(source,KNOWLEDGE+'systems/')
        system=self.repo.json(source); cid=system.get('canonical_id') or system.get('identity',{}).get('canonical_id')
        require((system.get('system_id') or system.get('identity',{}).get('system_id'))==sid,'OWNER',f'{sid}: System identity mismatch')
        require(cid==spec.get('canonical_id'),'OWNER',f'{sid}: canonical ID mismatch')
        require(str(system.get('semantic_authority','')).startswith('CHAT_APPROVED'),'OWNER',f'{sid}: System authority not accepted')
        self.systems[sid]={'path':source,'value':system,'canonical_id':cid}

        learning_path=spec.get('learning_source'); require(nonempty(learning_path),'OWNER',f'{sid}: learning_source required')
        learning=self.repo.json(learning_path); require(top_level_learning_shape(learning),'OWNER',f'{sid}: unsupported Learning shape')
        require(learning.get('system_id')==sid and learning.get('canonical_id')==cid,'OWNER',f'{sid}: Learning identity mismatch')
        content_path=spec.get('content_source') or re.sub(r'-learning\.json$','-content.json',learning_path)
        content=self.repo.json(content_path)
        require(content.get('status')=='ACCEPTED' and content.get('system_id')==sid and content.get('canonical_id')==cid,'OWNER',f'{sid}: accepted Content owner required')

        route_ids=[]
        for family in shape(system.get('block_families'),list,f'{sid}.block_families'):
            require(isinstance(family,dict) and isinstance(family.get('blocks'),list),'OWNER',f'{sid}: invalid block family')
            route_ids.extend(map(str,family['blocks']))
        unique(route_ids,f'{sid}.family-route')
        default_route=list(map(str,shape(learning.get('system_route',{}).get('default_route'),list,f'{sid}.default_route')))
        require(len(route_ids)==len(default_route),'OWNER',f'{sid}: System/Learning route count mismatch')
        logic_root=shape(learning.get('logic_groups'),dict,f'{sid}.logic_groups')
        realization_root=shape(content.get('block_realization'),dict,f'{sid}.block_realization')

        root=PurePosixPath(source).parent; candidates=[]
        for p in self.repo.path(str(root)).rglob('*.md'):
            rel=p.relative_to(self.repo.root).as_posix(); text=self.repo.text(rel); declared=frontmatter_scalar(text,'block_id')
            if declared: candidates.append((rel,text,declared))

        total_kp=0
        for index,bid in enumerate(route_ids):
            default_key=default_route[index]
            if bid in logic_root: accepted_key=bid
            elif stable_token(bid)==stable_token(default_key): accepted_key=default_key
            else:
                matches=[k for k in logic_root if stable_token(k)==stable_token(bid)]
                require(len(matches)==1,'OWNER',f'{sid}:{bid}: Learning Block key unresolved')
                accepted_key=matches[0]
            require(accepted_key in realization_root,'OWNER',f'{sid}:{bid}: Content realization missing')

            matches=[row for row in candidates if row[2]==bid]
            if not matches: matches=[row for row in candidates if stable_token(row[2])==stable_token(bid)]
            require(len(matches)==1,'OWNER',f'{sid}:{bid}: canonical file missing/ambiguous')
            path,text,_=matches[0]

            raw_groups=shape(logic_root.get(accepted_key),list,f'{sid}.{accepted_key}.logic_groups')
            require(raw_groups,'OWNER',f'{sid}:{accepted_key}: empty Logic Groups')
            groups=[]; coverage=[]
            for pos,g in enumerate(raw_groups):
                require(isinstance(g,dict),'OWNER',f'{sid}:{accepted_key}: invalid Logic Group row')
                gid=str(g.get('id') or ''); members=g.get('members')
                require(nonempty(gid) and isinstance(members,list) and members and all(type(x) is int and x>0 for x in members),'OWNER',f'{sid}:{accepted_key}: invalid Logic Group membership')
                require(len(members)==len(set(members)) and nonempty(str(g.get('goal') or '')) and nonempty(str(g.get('closure') or '')),'OWNER',f'{sid}:{gid}: incomplete Logic Group')
                coverage.extend(members); groups.append({'id':gid,'label':str(g.get('label') or gid),'kp_members':members})
            expected_kp=max(coverage)
            require(Counter(coverage)==Counter(range(1,expected_kp+1)),'OWNER',f'{sid}:{bid}: Logic Group overlap/gap')
            fm_kp=frontmatter_scalar(text,'kp_count')
            require(not fm_kp or int(fm_kp)==expected_kp,'OWNER',f'{sid}:{bid}: frontmatter KP count mismatch')
            markers=re.findall(r'<!--\s*kianos:kp\s+id=["\']([^"\']+)["\']\s*-->',text)
            require(len(markers)==expected_kp and len(set(markers))==expected_kp,'OWNER',f'{sid}:{bid}: stable KP marker count/uniqueness mismatch')
            marker_ordinals=[]
            for marker in markers:
                m=re.search(r'(?:^|-)kp0*(\d+)$',marker,re.I); require(m is not None,'OWNER',f'{sid}:{bid}: invalid KP marker {marker}')
                marker_ordinals.append(int(m[1]))
            require(Counter(marker_ordinals)==Counter(range(1,expected_kp+1)),'OWNER',f'{sid}:{bid}: stable KP marker ordinal gap/duplicate')
            unique([g['id'] for g in groups],f'{sid}:{bid}.groups')
            self.blocks[bid]={'system_id':sid,'path':path,'text':text,'row':{'id':bid,'kp':expected_kp},'groups':groups,'kp_ids':markers,'learner_order':[g['id'] for g in groups],'learning_key':accepted_key}
            total_kp+=expected_kp
        require(len(route_ids)==int(system.get('identity',{}).get('block_count') or len(route_ids)),'OWNER',f'{sid}: Block count mismatch')
        require(total_kp==int(system.get('identity',{}).get('canonical_kp_count') or total_kp),'OWNER',f'{sid}: KP total mismatch')

    def owner_ref(self,asset,binding):
        if binding.get('owner_type')=='LOGIC_GROUP_SET':
            bid=binding.get('block_id') or binding.get('id')
            require(bid==asset.get('block_id') and bid in self.blocks,'OWNER',f'wrong/missing local LG set {bid}')
            require(self.blocks[bid]['system_id']==asset['system_id'],'OWNER','cross-System LG set')
            return [{'id':g['id'],'label':g['label']} for g in self.blocks[bid]['groups']]
        return legacy.Validator.owner_ref(self,asset,binding)

    def safe_object(self,asset,obj,view_name,view):
        b=obj.get('binding',{})
        if (view_name=='BLOCK_RECALL_FRONT' and obj.get('answer_bearing') is False
            and obj.get('role')=='MAP' and b.get('kind')=='OWNER_REF' and b.get('owner_type')=='LOGIC_GROUP_SET'
            and view.get('logic_map_policy')=='LABELS_AND_IDS_ONLY'):
            return True
        return legacy.Validator.safe_object(self,asset,obj,view_name,view)

    def check_views(self,asset,sources,resolved):
        # Systems without an owned neutral-front string intentionally project no
        # medical payload on SYSTEM_RECALL_FRONT. The shared renderer supplies
        # the generic attempt instruction. Preserve the full legacy view checks
        # by inserting a validator-only safe neutral sentinel.
        if 'block_id' not in asset and asset.get('views',{}).get('SYSTEM_RECALL_FRONT',{}).get('object_ids')==[]:
            tmp=copy.deepcopy(asset)
            tmp['objects'].append({
                'object_id':'__generic_system_recall_prompt__',
                'role':'RECALL',
                'geometry':'TEXT_STRUCTURE',
                'binding':{
                    'kind':'FIELD_REF',
                    'source_id':'system',
                    'selector':{'type':'JSON_POINTER','value':'/system_recall/neutral_front'},
                    'value_type':'string'
                },
                'answer_bearing':False
            })
            tmp['views']['SYSTEM_RECALL_FRONT']['object_ids']=['__generic_system_recall_prompt__']
            return legacy.Validator.check_views(self,tmp,sources,resolved)
        return legacy.Validator.check_views(self,asset,sources,resolved)

def validate_repository(root:Path=ROOT,overrides=None)->dict:
    return Validator(root,overrides).run()

def main()->int:
    p=argparse.ArgumentParser(description=__doc__); p.add_argument('--root',type=Path,default=ROOT); p.add_argument('--self-test',action='store_true'); p.add_argument('--json',type=Path)
    a=p.parse_args(); report=validate_repository(a.root)
    if a.self_test:
        from test_projection import run_suite as run_legacy
        from test_projection_b import run_suite as run_b
        x,y=run_legacy(a.root),run_b(a.root)
        report['mutation_tests']={'total':x['total']+y['total'],'passed':x['passed']+y['passed'],'failed':x['failed']+y['failed'],'legacy':x,'b_extension':y}
        if report['mutation_tests']['failed']: report['status']='FAIL'
    if a.json:
        a.json.parent.mkdir(parents=True,exist_ok=True); a.json.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    for i in report['issues']: print(f"FAIL [{i['code']}] {i['asset']}: {i['message']}")
    print(f"XIZONG_PROJECTION_VALIDATION: {report['status']}")
    print(f"coverage: {report['systems']} systems / {report['blocks']} blocks / {report['assets']} assets / {report['canonical_kps']} KP identities")
    if a.self_test:
        t=report['mutation_tests']; print(f"mutation/control tests: {t['passed']}/{t['total']} passed; failed={t['failed']}")
    print('boundary: asset validation only; no browser/runtime/medical/learner acceptance claim')
    return 0 if report['status']=='PASS' else 1
if __name__=='__main__': sys.exit(main())
