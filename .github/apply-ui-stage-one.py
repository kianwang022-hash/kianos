"""One-shot, exact-input presentation edit transport. Removed after materialization.
No content, learning authority, private state, or Evidence reducer is written.
"""
from pathlib import Path
from hashlib import sha256
expected = {
'static-web/src/components/ClozeWorkspace.astro': '47c4b5fc248b9d6e1f7a916980113e2bebf22b16a062aeefc435bad19277c1d1',
'static-web/src/components/ReadingWorkspace.astro': '3a8cba6236c98b807c0007cd5fb1292867ce367a63df3ab2a14c3f9366ebb67e',
'static-web/src/components/VocabularyHome.astro': 'c792d1cb35a420bf2a6878a45005b17087caaacfcbf10cc6dcbdfaabd76a4f72',
'static-web/src/components/VocabularyWordRuntime.astro': 'fe3a21c2e5fc27d9d15705998740e0e43ae0b2642532fb52ce0c9cdb253d1feb',
'static-web/src/layouts/Base.astro': '26bc9f4c50f5a7f1740abd7ebe6a1e800e037b8aecf61e47f77bfcf16c34b486',
'static-web/src/pages/english.astro': 'e168d4f2710f258d392fdbf9420591680eca3e717d0f2b50497401c82ae03a1f',
'static-web/src/pages/index.astro': 'c343b667d906194bc24445869caecb6f4173564dab37e49b60878cd71c054e2b',
'static-web/src/pages/vocabulary/[ordinal].astro': '8f20981b0dc68934d4af6f92a3628f6c4d8123831e493c32800929f7c38a4160',
'static-web/src/pages/vocabulary/index.astro': '501c685de72fecd5ee865d6943545072faf094a081238cfeb8dde91c4cb6e1d4',
}
for file, digest in expected.items():
    assert sha256(Path(file).read_bytes()).hexdigest() == digest, f'Concurrent input changed: {file}'
r=Path('static-web')
p=r/'src/layouts/Base.astro';s=p.read_text();s=s.replace("import '../styles/visual-convergence.css';", "import '../styles/visual-convergence.css';\nimport '../styles/lexical-presentation.css';")
s=s.replace("const navActive = isEnglishRoute ? 'english' : active;", """const navActive = isEnglishRoute ? 'english' : active;
const localPath = pathname.slice(base.length).replace(/^\\/+|\\/+$/g, '');
const isHub = ['', 'english', 'vocabulary'].includes(localPath);
const isWordStudy = /^vocabulary\\/\\d+$/.test(localPath);
const stageOne = isEnglishRoute || active === 'lexical' || localPath === '';
const navIcons = {
  home: 'M3 10 12 3l9 7M5 9v11h5v-6h4v6h5V9',
  xizong: 'M12 3v18M3 12h18M6 6l12 12M6 18 18 6',
  politics: 'M4 20h16M6 17V8m6 9V8m6 9V8M3 6l9-3 9 3H3Z',
  lexical: 'M5 4h13a2 2 0 0 1 2 2v15H7a3 3 0 0 1-3-3V5a1 1 0 0 1 1-1ZM4 17h16M8 8h8M8 11h6',
  english: 'M4 5h7a4 4 0 0 1 4 4v11a4 4 0 0 0-4-3H4V5Zm11 4a4 4 0 0 1 4-4h2v12h-2a4 4 0 0 0-4 3'
};""")
s=s.replace('<body class={`surfaceBody-${active}`}>','<body class={`surfaceBody-${active}${stageOne ? \' uiStageOne\' : \'\'}${isHub ? \' uiHub\' : \'\'}${isWordStudy ? \' uiWordStudy\' : \'\'}${isEnglishRoute ? \' uiEnglish\' : \'\'}`}>')
s=s.replace('<small>Learning Runtime</small>','<small>Personal workspace</small>')
s=s.replace("href={item.href}>{item.label}</a>","href={item.href} aria-current={navActive === item.key ? 'page' : undefined}><svg class=\"productNavIcon\" width=\"19\" height=\"19\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d={navIcons[item.key]} /></svg><span>{item.label}</span></a>")
p.write_text(s)
p=r/'src/pages/english.astro';s=p.read_text().split('---',2)[1]
s=s.replace("const statusLabel = (status) => status === 'ready' ? 'Ready' : status === 'invalid' ? 'Blocked' : 'Partial';", "const statusLabel = (status) => status === 'ready' ? '可进入' : status === 'invalid' ? '暂不可用' : '部分开放';")
p.write_text('---'+s+'---\n'+'''<Base title="English" active="english" showLead={false} objectId="english:performance-home">
  <section class="englishHub" data-english-hub data-base={base}>
    <nav class="englishTaskTabs" aria-label="English task families">
      <a class="active" href={`${base}english/`} aria-current="page">Overview</a>
      <a href={`${base}reading/`}>Reading A</a><a href={`${base}cloze/`}>Cloze</a>
      <a href={`${base}reading-b/`}>Part B</a><a href={`${base}translation/`}>Translation</a>
      <a href={`${base}writing/`}>Writing</a>
    </nav>
    <header class="englishOverview">
      <div><span>ENGLISH OS · PERFORMANCE WORKSPACE</span><h1>读懂，写清，稳定完成。</h1><p>从完整任务开始；有具体问题，再回到最小修复。</p></div>
      <aside><span>English I · Target</span><strong>80–85<span>+</span></strong><small>Objective 60 · Translation 10 · Writing 30</small></aside>
    </header>
    <div class="englishCapabilityLayout">
      <main class="englishCapabilityMap">
        <EnglishResume />
        <header class="englishWorkbenchHeading"><h2>选择本次任务</h2><span>Perform → Review / Exit</span></header>
        <section class="englishCapabilityGroup" data-capability="objective">
          <div class="englishCapabilityLead"><span>01 · OBJECTIVE</span><h2>阅读与判断</h2><p>整篇材料、完整题组；让证据决定选择。</p></div>
          <div class="englishCapabilityRoutes">
            <a href={`${base}reading/`}><span>40 <small>pts</small></span><div><strong>Reading A</strong><small>文章与整组题目 · 证据裁决</small></div><b>→</b></a>
            <a href={`${base}cloze/`}><span>10 <small>pts</small></span><div><strong>Cloze</strong><small>完整语境 · 逐空辨别</small></div><b>→</b></a>
            <a href={`${base}reading-b/`}><span>10 <small>pts</small></span><div><strong>Part B</strong><small>材料、候选与全局关系</small></div><b>→</b></a>
          </div>
          <small class="englishAvailability">{statusLabel(objectiveSource.status)}</small>
        </section>
        <section class="englishCapabilityGroup" data-capability="translation">
          <div class="englishCapabilityLead"><span>02 · TRANSLATION</span><h2>忠实重建</h2><p>保留英文意义与关系，形成自然中文。</p></div>
          <div class="englishCapabilityRoutes"><a href={`${base}translation/`}><span>10 <small>pts</small></span><div><strong>Translation</strong><small>原文与自己的完整译文同时可见</small></div><b>→</b></a></div>
          <small class="englishAvailability">{statusLabel(translation.status)}</small>
        </section>
        <section class="englishCapabilityGroup" data-capability="writing">
          <div class="englishCapabilityLead"><span>03 · WRITING</span><h2>从任务到成文</h2><p>Small / Big 两种任务，保留自己的第一版。</p></div>
          <div class="englishCapabilityRoutes"><a href={`${base}writing/`}><span>30 <small>pts</small></span><div><strong>Writing</strong><small>先规划或直接写 · 完整表达</small></div><b>→</b></a></div>
          <small class="englishAvailability">{statusLabel(writingRuntime.status)}</small>
        </section>
      </main>
      <aside class="englishContextRail">
        <section class="englishGuideWorkbench">
          <header><span>GUIDES</span><h2>需要时，回到模型。</h2><p>首次建立框架，或针对当前问题查阅。</p></header>
          <nav class="englishGuideLinks" aria-label="English Guides">
            <a href={`${base}objective-learn/`}><strong>Objective</strong><span>Reading · Cloze · Part B</span><b>↗</b></a>
            <a href={`${base}translation-learn/`}><strong>Translation</strong><span>表征 → 忠实重建 → 交付</span><b>↗</b></a>
            <a href={`${base}writing-learn/`}><strong>Writing</strong><span>六个基本能力 · Small / Big</span><b>↗</b></a>
          </nav>
        </section>
        <section class="englishLexicalCompanion"><span>LEXICAL COMPANION</span><h2>卡在一个词？</h2><p>查具体词义、结构或辨析，再回到原任务。</p><a href={`${base}vocabulary/`}>打开 Vocabulary <b>→</b></a></section>
      </aside>
    </div>
  </section>
</Base>
''')
p=r/'src/pages/index.astro';s=p.read_text();s=s.replace('<div><p class="pageKicker">KianOS · 学习工作台</p><h1>从正在做的事继续。</h1></div>','<div><p class="pageKicker">YOUR LEARNING WORKSPACE</p><h1>学习工作台</h1><p class="commandSubtitle">选一条主线，回到正在做的事。</p></div>')
s=s.replace('<p>三科主线 · 词汇随用随查<br /><span>断点与证据沿用各科，不另排一张课表。</span></p>','<div class="commandScope"><span>当前可进入</span><strong>{xizongSystems.length} Systems <i>／</i> English <i>／</i> {politicsSubjects.length} 科政治</strong></div>')
s=s.replace('<h2>Continue</h2><span>分科继续 · 自由选择</span>','<h2>Continue</h2><span>回到最近位置，或自由选择任务</span>')
s=s.replace('{xizongBlocks} Blocks · {xizongKp} KP · 原讲义连续学习，网页负责定位、Recall 与修补。','原讲义连续学习 · 框架定位 · 主动 Recall')
s=s.replace('Objective / Translation / Writing · 完成任务，问题出现时再做最小修复。','完整任务优先 · 阅读、翻译与写作')
s=s.replace('乘风原讲义 → 肖1000 验证 → 有问题时精准回源。','乘风原讲义 → 肖1000 验证 → 精准回源')
s=s.replace('查词、继续学习，或回到已有 Repair；与英语任务共用同一套词汇内容。','词义、结构、辨析。查清楚，再回原任务。')
s=s.replace('<small>{lexicalState.wordCount.toLocaleString(\'en-US\')} 词可检索 · 本地学习记录<br />查完词，回到原来的任务。</small>', '<small>{lexicalState.wordCount.toLocaleString(\'en-US\')} 词 · Continue / Search / Repair</small>')
s=s.replace('<p class="pageKicker">Guides · 随时查阅</p><h2>需要时再展开模型</h2>', '<p class="pageKicker">GUIDES</p><h2>随时回到模型</h2>')
s=s.replace('学习记录保存在这台浏览器；复盘仍由各科自己的证据决定。','本机学习记录 · 保留各科断点')
p.write_text(s)
p=r/'src/components/ReadingWorkspace.astro';s=p.read_text();s=s.replace('            hidden={index !== 0}\n','')
s=s.replace('const setCurrent = (index) => {','const setCurrent = (index, scrollToQuestion = false) => {')
s=s.replace('item.hidden = !active;','// Whole-set presentation; currentIndex remains the existing keyboard/navigation focus.\n        item.hidden = false;')
s=s.replace("      save();\n    };\n\n    const renderReviewNav", "      save();\n      if (scrollToQuestion) questions[state.currentIndex]?.scrollIntoView({ block: 'nearest' });\n    };\n\n    const renderReviewNav")
s=s.replace('setCurrent(questions.indexOf(question))','setCurrent(questions.indexOf(question), true)')
s=s.replace('() => setCurrent(index)', '() => setCurrent(index, true)')
s=s.replace('setCurrent(state.currentIndex - 1)', 'setCurrent(state.currentIndex - 1, true)')
s=s.replace('setCurrent(state.currentIndex + 1)', 'setCurrent(state.currentIndex + 1, true)')
s=s.replace("    questions.forEach((question) => {\n      const id = qid(question);\n      question.querySelectorAll('[data-option]')", "    questions.forEach((question, index) => {\n      const focusQuestion = () => { if (state.currentIndex !== index) setCurrent(index); };\n      question.addEventListener('pointerdown', focusQuestion);\n      question.addEventListener('focusin', focusQuestion);\n      const id = qid(question);\n      question.querySelectorAll('[data-option]')",1)
p.write_text(s)
p=r/'src/components/ClozeWorkspace.astro';s=p.read_text().replace(' hidden={index !== 0}','');s=s.replace('row.hidden = index !== active;', "// Every blank stays visible; active only determines navigation / Uncertain focus.\n        row.hidden = false;\n        row.classList.toggle('is-current', index === active);")
s=s.replace("    rows.forEach((row) => {\n      row.querySelectorAll('[data-cloze-option]')", "    rows.forEach((row, index) => {\n      const focusRow = () => { if (active !== index) { active = index; render(); } };\n      row.addEventListener('pointerdown', focusRow);\n      row.addEventListener('focusin', focusRow);\n      row.querySelectorAll('[data-cloze-option]')",1)
s=s.replace("          const id = idOf(row);\n          const answer", "          active = rows.indexOf(row);\n          const id = idOf(row);\n          const answer",1)
s=s.replace("active = Math.max(0, active - 1); render();", "active = Math.max(0, active - 1); render(); rows[active]?.scrollIntoView({ block: 'nearest' });")
s=s.replace("active = Math.min(rows.length - 1, active + 1); render();", "active = Math.min(rows.length - 1, active + 1); render(); rows[active]?.scrollIntoView({ block: 'nearest' });")
s=s.replace("active = index; render(); }));", "active = index; render(); rows[active]?.scrollIntoView({ block: 'nearest' }); }));")
p.write_text(s)
p=r/'src/components/VocabularyWordRuntime.astro';s=p.read_text()
s=s.replace('<div class="portedVocabBody" data-vocab-body>', '<div class="portedVocabBody" data-vocab-body data-has-relations={relationRows.length > 0 ? "true" : "false"}>')
a=s.index('          {constructionRows.length > 0 && <section>');b=s.index('\n\n          {relationRows.length',a);block=s[a:b]
s=s[:a]+s[b:]
block=block.replace('&& <section>','&& <section class="lexicalConstructionSection">',1).replace('<small>Current verified</small>','<small>构式与固定表达</small>')
s=s.replace('        </main>',block+'\n        </main>',1)
s=s.replace('              <section data-vocab-target-row>','              <section class="lexicalSenseRow" data-vocab-target-row>')
s=s.replace('                <div>\n                  <p>{sense.definition_cn || \'—\'}</p>\n                  <strong>{sense.definition_en || \'—\'}</strong>', '                <div class="lexicalSenseMeaning">\n                  <strong>{sense.definition_en || \'—\'}</strong>\n                  <p>{sense.definition_cn || \'—\'}</p>')
s=s.replace('                  {fixedCollocationsWithIndex(sense).length > 0 && (\n                    <ul>', '                </div>\n                  {fixedCollocationsWithIndex(sense).length > 0 && (\n                    <ul class="lexicalSenseUsage">')
s=s.replace('                    </ul>\n                  )}\n                </div>', '                    </ul>\n                  )}',1)
s=s.replace('                <div>\n                  <p>{branch.definition_cn || branch.meaning_cn || \'—\'}</p>\n                  <strong>{branch.definition_en || branch.label_en || \'—\'}</strong>\n                  {(branch.pattern || branch.boundary) && <code>{branch.pattern || branch.boundary}</code>}\n                </div>', '                <div class="lexicalSenseMeaning">\n                  <strong>{branch.definition_en || branch.label_en || \'—\'}</strong>\n                  <p>{branch.definition_cn || branch.meaning_cn || \'—\'}</p>\n                </div>\n                {(branch.pattern || branch.boundary) && <div class="lexicalSenseUsage"><code>{branch.pattern || branch.boundary}</code></div>}')
s=s.replace('<small>mental compression</small>','<small>核心语义</small>')
s=s.replace('<small>Relation owner</small>','<small>区别与边界</small>')
s=s.replace('<small>local-only until exported</small>','<small>本词具体分支</small>')
p.write_text(s)
for rel in ['src/pages/vocabulary/index.astro','src/pages/vocabulary/[ordinal].astro']:
 p=r/rel;s=p.read_text().replace('active="lexical">','active="lexical" showLead={false}>');p.write_text(s)
p=r/'src/components/VocabularyHome.astro';s=p.read_text().replace('LexicalOS · independent lane','LEXICAL / VOCABULARY').replace('<h2>Vocabulary</h2>','<h2>把词学透，也能快速扫过。</h2>')
s=s.replace('Depth Scan 是高价值遍历，不是 7,946 个完成债。会的快速过；真实慢、模糊、漏掉或影响 English 表现的分支才进入 Repair / Challenge。','熟悉的词快速继续；需要时展开词义，留下真正不稳的具体分支。')
s=s.replace('<span>Continue Depth Scan</span>','<span>CONTINUE / 继续学习</span>')
s=s.replace('<small data-lexical-continue-meta>{rows.length} Current Words</small>','<small data-lexical-continue-meta>{rows.length} Current Words</small>\n      <span class="lexicalContinueArrow" aria-hidden="true">↗</span>')
s=s.replace('<span>只显示实际打开过的词</span>','<span>回到最近的位置</span>')
p.write_text(s)
print('Materialized 9 presentation files against exact source hashes. No content/ or reducer writes.')
