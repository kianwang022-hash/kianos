"""One-shot presentation patch: application namespace outranks Astro defaults.
Keeps native hidden permissions, all target identities, content and reducers intact.
"""
from pathlib import Path
import re
r=Path('static-web/src')
p=r/'layouts/Base.astro';s=p.read_text();assert '<body class=' in s;s=s.replace('<body class=', '<body id="kianos-workspace" class=',1);p.write_text(s)
for name in ['visual-convergence.css','english.css','lexical-presentation.css']:
 p=r/'styles'/name;s=p.read_text();assert '#kianos-workspace' not in s
 # The application root is deliberately more specific than component-scoped defaults.
 # [hidden] !important remains the absolute Runtime permission boundary.
 s=re.sub(r'(?<![\w-])\.(uiStageOne|uiEnglish|uiWordStudy|uiHub)\b',r'body#kianos-workspace.\1',s)
 if name=='visual-convergence.css':
  s=re.sub(r'\.(command\w+)',r'body#kianos-workspace .\1',s)
 if name=='english.css':
  s=s.replace('padding:28px 0 24px;', 'padding:22px 0 20px;')
  s=s.replace('padding:23px 24px;', 'padding:19px 24px;')
  s=s.replace('position:static;grid-column:1/-1;margin-top:-12px;', 'position:absolute;left:24px;bottom:9px;')
  s=s.replace('gap:24px;align-items:start;padding:19px 24px;', 'gap:24px;align-items:start;padding:19px 24px 27px;')
  s=s.replace('.writingRuntimeBoundary,.translationContractNote,.translationSourceGaps', '.writingRuntimeBoundary,.translationContractNote')
  s += '\nbody#kianos-workspace.uiEnglish .translationSourceGaps { display:block; }\nbody#kianos-workspace.uiEnglish .portedReadingQuestions { min-height:0;overflow-y:auto; }\nbody#kianos-workspace.uiEnglish .portedReadingPassage { min-height:0;overflow-y:auto; }\nbody#kianos-workspace.uiEnglish .clozeOptions button span { overflow-wrap:normal;word-break:normal; }\nbody#kianos-workspace.uiEnglish .portedReadingQuestion>p { font-weight:600; }\n'
 if name=='lexical-presentation.css':
  s=s.replace('min-height:40px;margin:0;padding:6px 0;', 'min-height:36px;margin:0;padding:3px 0;')
  s=s.replace('padding:22px 30px 23px;', 'padding:18px 30px 20px;')
  s += '\nbody#kianos-workspace.uiWordStudy .lexicalRelationDimensions { display:grid;gap:5px;margin:12px 0 0; }\nbody#kianos-workspace.uiWordStudy .lexicalRelationDimensions>div { display:grid;grid-template-columns:65px minmax(0,1fr);gap:9px;align-items:baseline; }\nbody#kianos-workspace.uiWordStudy .lexicalRelationDimensions dt { color:#8c9b87;font-size:11px;font-weight:400; }\nbody#kianos-workspace.uiWordStudy .lexicalRelationDimensions dd { margin:0;color:#70836a;font-size:13px;line-height:1.65;overflow-wrap:anywhere; }\n'
 p.write_text(s)
p=r/'components/VocabularyWordRuntime.astro';s=p.read_text();old='{Object.values(relation.difference_axes || relation.dimensions || {}).map((value) => <p>{String(value)}</p>)}';assert old in s
new='''<dl class="lexicalRelationDimensions">{Object.entries(relation.difference_axes || relation.dimensions || {}).map(([key, value]) => <div><dt>{({certainty:'确定度',collocation:'搭配',core_meaning:'意义差别',exam_trap:'辨析重点',register:'语域',semantic_prosody:'语义色彩',strength:'强度',syntax:'语法',writing_safety:'写作使用'} as Record<string,string>)[key] || key.replaceAll('_',' ')}</dt><dd>{String(value)}</dd></div>)}</dl>'''
s=s.replace(old,new);p.write_text(s)
p=r/'pages/english.astro';s=p.read_text();assert '80–85<span>+</span>' in s;s=s.replace('80–85<span>+</span>', '85<span>+</span>');p.write_text(s)
print('Updated presentation namespace and labelled unchanged Relation dimensions; English target aligned to Current orchestration owner.')
