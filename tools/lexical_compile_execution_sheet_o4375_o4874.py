#!/usr/bin/env python3
from __future__ import annotations
import json,re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
LEX=ROOT/'content/lexical'
INDEX=LEX/'execution/preflight/o4375-o4874.identity-index.json'
OUT=LEX/'execution/preflight/o4375-o4874.execution-sheet.md'
PROD=[LEX/'semantic-review/o4375-o4624.md',LEX/'semantic-review/o4625-o4874.md']
AUD=[LEX/'semantic-audit/o4225-o4424.audit.md',LEX/'semantic-audit/o4425-o4624.audit.md',LEX/'semantic-audit/o4625-o4824.audit.md',LEX/'semantic-audit/o4825-o5024.audit.md']
REC=LEX/'semantic-reconciliation/o4375-o4874.md'
SOURCE_SET={
4375,4376,4385,4388,4392,4396,4397,4400,4401,4402,4403,4409,4410,4412,4414,4423,
4425,4430,4432,4433,4434,4435,4438,4440,4442,4445,4452,4460,4462,4469,4472,4474,
4484,4487,4489,4490,4493,4496,4499,4503,4511,4512,4514,4517,4521,4524,
4528,4530,4533,4534,4542,4546,4553,4560,4561,4565,4567,4571,4572,4573,4576,4579,
4582,4583,4586,4588,4589,4595,4597,4598,4599,4603,4607,4612,4616,4617,4620,4621,4623,4624,
4628,4629,4633,4634,4638,4641,4642,4644,4650,4654,4661,4664,4666,4674,
4681,4682,4683,4684,4690,4691,4692,4693,4700,4701,4703,4705,4708,4712,4714,4716,4717,4718,4719,4721,4723,
4731,4734,4740,4742,4745,4747,4748,4749,4750,4752,4762,4763,4766,4768,4769,
4778,4782,4785,4786,4793,4795,4796,4798,4799,4801,4807,4810,4811,4815,4821,4824,
4825,4826,4828,4829,4841,4842,4845,4850,4852,4853,4855,4856,4864,4867,4869}

def clean(s:str)->str:
    return re.sub(r'\s+',' ',s.strip())

def production_blocks(path:Path):
    lines=path.read_text(encoding='utf-8').splitlines(); out={}
    i=0
    while i<len(lines):
        m=re.match(r'^- o(\d{4}) \*\*(.+?)\*\*\s*$',lines[i])
        if not m: i+=1; continue
        o=int(m.group(1)); word=m.group(2); buf=[]; j=i+1
        while j<len(lines):
            if re.match(r'^- o\d{4} \*\*',lines[j]) or lines[j].startswith('### Checkpoint') or lines[j].startswith('## '): break
            if lines[j].strip().startswith('- '): buf.append(clean(lines[j].strip()[2:]))
            j+=1
        out[o]={'word':word,'instructions':buf}; i=j
    return out

def audit_hits(path:Path,ordinal:int):
    lines=path.read_text(encoding='utf-8').splitlines(); key=f'o{ordinal:04d}'; hits=[]
    for i,line in enumerate(lines):
        if key not in line: continue
        # Ignore broad scope/provenance lines and NO_CHANGE lists unless they contain a verdict row.
        low=line.lower()
        if ('scope' in low or 'production handoff' in low or 'owner-read' in low) and 'flip_' not in low and 'refine_' not in low and 'identity_risk' not in low: continue
        if line.count('`o')>=4 and 'flip_' not in low and 'refine_' not in low and 'identity_risk' not in low: continue
        ctx=[line]
        for j in range(i+1,min(len(lines),i+4)):
            if lines[j].startswith('| o') or re.match(r'^- o\d{4}',lines[j]): break
            if lines[j].strip() and not lines[j].startswith('#'): ctx.append(lines[j])
        text=clean(' '.join(ctx))
        if text and text not in hits: hits.append(text)
    return hits[:4]

def rec_hits(text:str,ordinal:int):
    key=f'o{ordinal:04d}'; lines=text.splitlines(); hits=[]
    for i,line in enumerate(lines):
        if key not in line: continue
        ctx=[line]
        for j in range(i+1,min(len(lines),i+5)):
            if re.match(r'^- `?o\d{4}',lines[j]) or lines[j].startswith('### '): break
            if lines[j].strip(): ctx.append(lines[j])
        t=clean(' '.join(ctx))
        if t and t not in hits: hits.append(t)
    return hits[:3]

def sense_line(row):
    sid=row.get('sense_id') or row.get('stable_sense_id') or '?'; st=row.get('status','active'); pos=row.get('pos','?'); en=clean(str(row.get('definition_en','')))
    return f'{sid} [{st}|{pos}] {en}'

def main():
    idx=json.loads(INDEX.read_text(encoding='utf-8'))
    byord={x['ordinal']:x for x in idx['owners']}
    prod={}
    for p in PROD: prod.update(production_blocks(p))
    rectext=REC.read_text(encoding='utf-8')
    out=['# o4375–o4874 concise execution sheet','',f'Source owners: {len(SOURCE_SET)}','']
    for o in sorted(SOURCE_SET):
        row=byord[o]; out.append(f'## o{o:04d} — {row["word"]}')
        pb=prod.get(o)
        out.append('PRODUCTION: '+(' | '.join(pb['instructions']) if pb and pb['instructions'] else 'NO_CHANGE in Production / Audit-authorized source'))
        ah=[]
        for p in AUD: ah.extend(audit_hits(p,o))
        # De-dupe noisy repeats.
        seen=[]
        for x in ah:
            if x not in seen: seen.append(x)
        out.append('AUDIT: '+(' || '.join(seen[:5]) if seen else 'no additional audit refinement extracted'))
        rh=rec_hits(rectext,o)
        if rh: out.append('RECONCILIATION: '+' || '.join(rh))
        active=' ; '.join(sense_line(x) for x in row.get('active',[])) or '(none)'
        ref=' ; '.join(sense_line(x) for x in row.get('reference',[])) or '(none)'
        out.append('ACTIVE: '+active)
        out.append('REFERENCE: '+ref)
        if row.get('form_identity'): out.append('FORM: '+clean(json.dumps(row['form_identity'],ensure_ascii=False)))
        if row.get('constructions'):
            out.append('CONSTRUCTIONS: '+' ; '.join(clean(json.dumps(x,ensure_ascii=False)) for x in row['constructions']))
        if row.get('semantic_neighbors') or row.get('confusables') or row.get('relations'):
            rel={'refs':row.get('relations',[]),'semantic_neighbors':row.get('semantic_neighbors',[]),'confusables':row.get('confusables',[])}
            out.append('RELATIONS: '+clean(json.dumps(rel,ensure_ascii=False)))
        out.append('LOOKUP: '+', '.join(row.get('lookup_spellings',[])))
        out.append('')
    OUT.write_text('\n'.join(out)+'\n',encoding='utf-8')
    print('EXECUTION_SHEET_PASS',len(SOURCE_SET),'lines',len(out))
if __name__=='__main__': main()
