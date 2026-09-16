#!/usr/bin/env python3
from __future__ import annotations
import json,re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
LEX=ROOT/'content/lexical'
SHEET=LEX/'execution/preflight/o4375-o4874.execution-sheet.md'
INDEX=LEX/'execution/preflight/o4375-o4874.identity-index.json'
OUT=LEX/'execution/preflight/o4375-o4874.manifest-candidates.json'
SUMMARY=LEX/'execution/preflight/o4375-o4874.manifest-summary.md'
DETAIL=LEX/'execution/preflight/o4375-o4874.unresolved-resolution.md'

SID_RE=re.compile(r'sense:[a-z0-9_-]+:[0-9a-f]{16}')
BT_RE=re.compile(r'`([^`]+)`')

def blocks(text):
    parts=re.split(r'(?m)^## o(\d{4}) — (.+)$',text)
    out={}
    for i in range(1,len(parts),3):
        o=int(parts[i]); word=parts[i+1].strip(); body=parts[i+2]
        fields={}
        for line in body.splitlines():
            if ': ' in line:
                k,v=line.split(': ',1); fields[k]=v
        out[o]=(word,fields)
    return out

def slim_id(x,ref=False):
    sid=x.get('stable_sense_id') if ref else x.get('sense_id')
    return f"{sid}[{x.get('pos','?')}:{re.sub(r'\s+',' ',str(x.get('definition_en',''))).strip()}]"

def main():
    idx=json.loads(INDEX.read_text(encoding='utf-8'))
    byord={x['ordinal']:x for x in idx['owners']}
    bs=blocks(SHEET.read_text(encoding='utf-8'))
    rows=[]; stats={}
    for o,(word,f) in sorted(bs.items()):
        directive=' | '.join(x for x in (f.get('PRODUCTION',''),f.get('AUDIT',''),f.get('RECONCILIATION','')) if x)
        cur=byord[o]; active={x.get('sense_id'):x for x in cur.get('active',[]) if x.get('sense_id')}; ref={x.get('stable_sense_id'):x for x in cur.get('reference',[]) if x.get('stable_sense_id')}
        mentioned=[]
        for sid in SID_RE.findall(directive):
            if sid not in mentioned: mentioned.append(sid)
        ops=[]
        for sid in mentioned:
            if sid in ref and any(k in directive.lower() for k in ('reactivate','restore','unmerge','learner-main','co-main','secondary')):
                ops.append({'kind':'reactivate_exact','sense_id':sid,'identity_status':ref[sid].get('status'),'definition_en':ref[sid].get('definition_en')})
            elif sid in active:
                ops.append({'kind':'existing_sense_target','sense_id':sid,'definition_en':active[sid].get('definition_en')})
            else:
                ops.append({'kind':'mentioned_identity_needs_check','sense_id':sid})
        low=directive.lower()
        if any(k in low for k in ('re-anchor','reanchor','anchor construction','attachment')) and cur.get('constructions'):
            ops.append({'kind':'construction_reanchor','current_constructions':cur.get('constructions')})
        if any(k in low for k in ('pronunciation','form/','form behavior','spelling','plural','singular','capitaliz','lookup','heteronym','invariant')):
            ops.append({'kind':'form_or_lookup','instruction':directive})
        if any(k in low for k in ('reciprocal','relation','confusable','contrast')):
            ops.append({'kind':'relation','instruction':directive,'current_relation_refs':cur.get('relations',[])})
        if any(k in low for k in ('definition','broaden','narrow','scope','repair')):
            ops.append({'kind':'definition_or_scope','instruction':directive})
        pats=[]
        for x in BT_RE.findall(directive):
            if x.startswith('sense:') or x.startswith('o') or x in {'UPGRADE','NO_CHANGE','FLIP_TO_UPGRADE','REFINE_UPGRADE','IDENTITY_RISK'}: continue
            if len(x)>2 and any(ch.isalpha() for ch in x) and x not in pats: pats.append(x)
        if pats: ops.append({'kind':'surface_patterns','patterns':pats[:12]})
        unresolved=[]
        if any(k in low for k in ('add/reuse','add the common','add modern','branch is absent','sense is absent','restore/add','missing branch','is absent','ordinary count')) and not any(x['kind']=='reactivate_exact' for x in ops):
            unresolved.append('sense_identity_resolution')
        if any(x['kind']=='construction_reanchor' for x in ops): unresolved.append('construction_target_anchor')
        if any(x['kind']=='relation' for x in ops): unresolved.append('relation_mechanics_or_anchor')
        if any(x['kind']=='definition_or_scope' for x in ops): unresolved.append('definition_target')
        if any(x['kind']=='form_or_lookup' for x in ops): unresolved.append('form_payload')
        kinds={x['kind'] for x in ops}
        ready=bool(ops) and not unresolved and kinds <= {'reactivate_exact','existing_sense_target','surface_patterns'}
        row={'ordinal':o,'word':word,'directive':directive,'operations':ops,'ready_for_exact_compile':ready,'unresolved_classes':sorted(set(unresolved)),'active_ids':sorted(active),'reference_ids':sorted(ref)}
        rows.append(row)
        key='READY' if ready else 'NEEDS_COMPILE'; stats[key]=stats.get(key,0)+1
        for u in set(unresolved): stats[u]=stats.get(u,0)+1
    OUT.write_text(json.dumps({'schema':'kianos.lexical.manifest_candidates.v1','package':[4375,4874],'owner_count':len(rows),'stats':stats,'owners':rows},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    lines=['# o4375–o4874 manifest candidate summary','',f'Owners: {len(rows)}','', '## Stats','']+[f'- {k}: {v}' for k,v in sorted(stats.items())]+['','## Unresolved owners','']
    detail=['# o4375–o4874 unresolved resolution sheet','']
    for r in rows:
        if r['ready_for_exact_compile']: continue
        lines.append(f"- o{r['ordinal']:04d} {r['word']}: {', '.join(r['unresolved_classes']) or 'manual operation compile'}")
        cur=byord[r['ordinal']]
        a=' ; '.join(slim_id(x) for x in cur.get('active',[])) or '-'
        ref=' ; '.join(slim_id(x,True) for x in cur.get('reference',[])) or '-'
        d=re.sub(r'\s+',' ',r['directive']).strip()
        detail.append(f"o{r['ordinal']:04d} {r['word']} | CLASS={','.join(r['unresolved_classes']) or 'manual'} | ACTIVE={a} | REF={ref} | DIRECTIVE={d}")
    SUMMARY.write_text('\n'.join(lines)+'\n',encoding='utf-8')
    DETAIL.write_text('\n'.join(detail)+'\n',encoding='utf-8')
    print('MANIFEST_CANDIDATES_PASS',len(rows),stats,'unresolved_lines',len(detail)-2)
if __name__=='__main__': main()
