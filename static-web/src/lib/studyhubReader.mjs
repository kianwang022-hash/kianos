// UI reading position only; never an attempt, mastery signal or private checkpoint.
const PREFIX='kianos-studyhub-reader-v1:';
const NAVIGATION=PREFIX+'navigation', PENDING=PREFIX+'return', LAST=PREFIX+'last', FONT=PREFIX+'font';
const read=(storage,key,fallback=null)=>{try{return JSON.parse(storage.getItem(key))??fallback;}catch{return fallback;}};
const write=(storage,key,value)=>{try{storage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
const localURL=(url)=>{try{const u=new URL(url,location.href);return u.origin===location.origin&&u.pathname.includes('/studyhub/')?u:null;}catch{return null;}};
const sourceText=node=>{const clone=node.cloneNode(true);clone.querySelectorAll('[data-sh-preview],[data-sh-ui]').forEach(n=>n.remove());return clone.textContent.trim();};

export function initStudyhubReader(){
  const root=document.querySelector('[data-sh-reader]');
  const last=read(localStorage,LAST);
  const resume=document.querySelector('[data-sh-resume]');
  if(resume&&last&&localURL(last.url)) {resume.href=last.url;resume.textContent='继续阅读：'+last.title+' →';resume.hidden=false;}
  // Each native history entry owns its return path. A global stack goes stale
  // when BFCache restores an older document without rerunning module setup.
  const queued=read(sessionStorage,NAVIGATION);
  try{sessionStorage.removeItem(NAVIGATION);}catch{}
  const cleanTrail=entries=>{
    const valid=(Array.isArray(entries)?entries:[]).filter(x=>x&&localURL(x.url)&&x.position).slice(-20);
    while(valid.at(-1)?.url===location.pathname)valid.pop();
    return valid;
  };
  const initialTrail=history.state?.shTrail ?? (queued?.to===location.pathname?queued.trail:[]);
  history.replaceState({...history.state,shTrail:cleanTrail(initialTrail)},'');
  const trail=()=>cleanTrail(history.state?.shTrail);
  document.addEventListener('click',event=>{
    const link=event.target.closest?.('a[data-sh-link]');
    if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const target=localURL(link.href);if(!target||target.pathname===location.pathname)return;
    const entries=trail();
    if(root){save();entries.push({url:location.pathname,title:root.dataset.shTitle,position:modalPosition||capture()});}
    write(sessionStorage,NAVIGATION,{to:target.pathname,trail:entries.slice(-20)});
  });
  if(!root)return;
  const article=root.querySelector('[data-sh-article]');
  const status=root.querySelector('[data-sh-status]');
  const key=PREFIX+root.dataset.shFile;
  const line=()=>root.querySelector('.shToolbar').getBoundingClientRect().bottom+22;
  const allBlocks=()=>[...article.querySelectorAll('[data-sh-block]')].filter(n=>n.getBoundingClientRect().height>0);
  const details=[...article.querySelectorAll('details')];
  let ready=true, restoring=true, modalPosition=null, modalTrigger=null, selection=null;
  const setStatus=(message)=>{status.textContent=message;};
  function capture(){
    const blocks=allBlocks(), y=line();
    const block=blocks.find(n=>n.getBoundingClientRect().bottom>y)||blocks.at(-1);
    if(!block)return {scrollY};
    const rect=block.getBoundingClientRect();
    const preceding=[...article.querySelectorAll('a[id],h2[id],h3[id]')].filter(n=>n.getBoundingClientRect().top<=y).at(-1);
    return {id:block.id,top:rect.top,ratio:Math.max(0,(y-rect.top)/rect.height),inside:rect.top<y,section:preceding?.id,scrollY,width:innerWidth,font:getComputedStyle(article).fontSize,open:details.map((d,i)=>d.open?i:-1).filter(i=>i>=0)};
  }
  function restore(position){
    if(!position)return;
    details.forEach((d,i)=>d.open=position.open?.includes(i)||false);
    const target=document.getElementById(position.id)||document.getElementById(position.section);
    if(target&&article.contains(target)){
      const rect=target.getBoundingClientRect();
      const changed=position.width!==innerWidth||position.font!==getComputedStyle(article).fontSize;
      const delta=changed&&position.inside?rect.top+rect.height*position.ratio-line():rect.top-position.top;
      window.scrollBy({top:delta,behavior:'instant'});
    }else window.scrollTo({top:position.scrollY||0,behavior:'instant'});
  }
  function save(){
    if(!ready||restoring||document.querySelector('.shDialog[open]'))return;
    const position=capture();
    history.replaceState({...history.state,shPosition:position},'');
    const ok=write(localStorage,key,position)&&write(localStorage,LAST,{url:location.pathname,title:root.dataset.shTitle});
    if(!ok)setStatus('当前位置无法保存在此浏览器中；仍可继续阅读。');
  }
  const font=root.querySelector('[data-sh-font]');
  const storedFont=read(localStorage,FONT,20);
  if([18,20,22,24].includes(storedFont)){root.style.setProperty('--sh-font-size',storedFont+'px');font.value=String(storedFont);}
  history.scrollRestoration='manual';
  const pending=read(sessionStorage,PENDING);
  let initial=history.state?.shPosition;
  if(pending?.url===location.pathname){initial=pending.position;try{sessionStorage.removeItem(PENDING);}catch{}}
  initial ||= !location.hash ? read(localStorage,key):null;
  void document.fonts.ready.then(()=>requestAnimationFrame(()=>{
    if(initial)restore(initial);
    else if(location.hash){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{}const target=id&&document.getElementById(id);if(target)target.scrollIntoView();}
    restoring=false;save();
  }));
  let timer;
  window.addEventListener('scroll',()=>{clearTimeout(timer);timer=setTimeout(save,180);},{passive:true});
  window.addEventListener('pagehide',save);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save();});
  window.addEventListener('pageshow',event=>{
    if(event.persisted){renderReturn();if(history.state?.shPosition)restore(history.state.shPosition);}
  });
  font.addEventListener('change',()=>{
    const position=capture();restoring=true;
    root.style.setProperty('--sh-font-size',font.value+'px');
    requestAnimationFrame(()=>{restore(position);restoring=false;if(ready&&!write(localStorage,FONT,Number(font.value)))setStatus('字号已调整，但无法保存设置。');save();});
  });

  const returnButton=root.querySelector('[data-sh-return]');
  function renderReturn(){
    const entries=trail();history.replaceState({...history.state,shTrail:entries},'');
    const entry=entries.at(-1);returnButton.hidden=!entry;
    returnButton.textContent=entry?'← 返回：'+entry.title:'返回上一处';returnButton.title=entry?.title||'';
  }
  renderReturn();
  returnButton.addEventListener('click',()=>{
    const entries=trail(),entry=entries.pop();if(!entry)return;
    save();write(sessionStorage,NAVIGATION,{to:new URL(entry.url,location.href).pathname,trail:entries});
    write(sessionStorage,PENDING,{url:new URL(entry.url,location.href).pathname,position:entry.position});location.assign(entry.url);
  });
  root.querySelectorAll('[data-sh-anchor]').forEach(link=>link.addEventListener('click',()=>{requestAnimationFrame(save);}));
  const anchors=root.querySelectorAll('[data-sh-anchor]');
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){anchors.forEach(a=>{if(a.hash==='#'+entry.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}},{rootMargin:'-100px 0px -65% 0px'});
  anchors.forEach(a=>{const node=document.getElementById(decodeURIComponent(a.hash.slice(1)));if(node)observer.observe(node);});

  function openDialog(dialog,trigger){save();modalPosition=capture();modalTrigger=trigger;dialog.showModal();}
  root.querySelectorAll('dialog').forEach(dialog=>{
    dialog.querySelectorAll('[data-sh-close]').forEach(button=>button.addEventListener('click',()=>dialog.close()));
    dialog.addEventListener('close',()=>{const pos=modalPosition;modalPosition=null;modalTrigger?.focus({preventScroll:true});restore(pos);save();});
  });
  const context=root.querySelector('[data-sh-context]');
  let previewRequest=0;
  context.addEventListener('close',()=>{previewRequest++;});
  document.addEventListener('click',async event=>{
    const button=event.target.closest?.('[data-sh-preview]');if(!button)return;
    const target=localURL(button.dataset.shPreview);if(!target)return;
    // Nested links in a preview remain normal source links, not another popup stack.
    if(context.open)return;
    const request=++previewRequest;
    openDialog(context,button);
    const body=context.querySelector('[data-sh-context-body]');body.textContent='正在读取已有原文…';
    const open=context.querySelector('[data-sh-context-open]');open.href=target.href;
    const label=context.querySelector('[data-sh-context-label]');label.textContent='';
    try{
      const response=await fetch(target.pathname);if(!response.ok)throw Error('unavailable');
      const parsed=new DOMParser().parseFromString(await response.text(),'text/html');
      if(request!==previewRequest||!context.open)return;
      const source=parsed.querySelector('[data-sh-article]');if(!source)throw Error('unavailable');
      let fragment='';try{fragment=decodeURIComponent(target.hash.slice(1));}catch{}
      const start=fragment&&source.querySelector('#'+CSS.escape(fragment));
      if(fragment&&!start){body.textContent='此链接的锚点未在当前原文中找到，请打开完整原文核对。';return;}
      body.replaceChildren();
      if(start){
        let node=start;while(node.parentElement!==source&&node.parentElement)node=node.parentElement;
        let first=true, contentStarted=false, headingLevel=null;
        for(;node;node=node.nextElementSibling){
          const level=/^H[1-6]$/.test(node.tagName)?Number(node.tagName[1]):null;
          if(!first){
            if(node.matches('a[id]')||node.querySelector('a[id]'))break;
            if(level&&(headingLevel?level<=headingLevel:contentStarted))break;
          }
          // An explicit source anchor often sits just before its section heading.
          // Keep that heading and its prose, stopping at the next peer section.
          if(level&&headingLevel===null)headingLevel=level;
          body.append(node.cloneNode(true));
          contentStarted ||= !!node.textContent.trim();first=false;
        }
      }else [...source.children].forEach(node=>body.append(node.cloneNode(true)));
      body.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
      body.querySelectorAll('[data-sh-preview]').forEach(n=>n.remove());
      label.textContent=parsed.querySelector('[data-sh-reader]')?.dataset.shTitle||'原文';
    }catch{if(request!==previewRequest||!context.open)return;body.textContent='这份原文暂时无法展开。请打开完整原文，或稍后重试。';}
  });

  function captureSelection(){
    const current=window.getSelection();
    if(!current||current.isCollapsed||!current.rangeCount)return;
    const range=current.getRangeAt(0);
    if(!article.contains(range.startContainer)||!article.contains(range.endContainer))return;
    const text=sourceText(range.cloneContents());if(!text)return;
    const blockFor=node=>(node.nodeType===1?node:node.parentElement)?.closest('[data-sh-block],li,blockquote');
    const first=blockFor(range.startContainer),last=blockFor(range.endContainer);
    const blocks=allBlocks(),start=blocks.indexOf(first),end=blocks.indexOf(last);
    const contextBlocks=start>=0&&end>=0?blocks.slice(Math.max(0,start-1),Math.min(blocks.length,end+2)):[first,last].filter(Boolean);
    const preceding=selector=>[...article.querySelectorAll(selector)].filter(n=>(n.compareDocumentPosition(first||range.startContainer)&Node.DOCUMENT_POSITION_FOLLOWING)||n===first).at(-1);
    const sourceAnchor=preceding('a[id]')||preceding('h2[id],h3[id]');
    selection={text,context:[...new Set(contextBlocks)].map(sourceText).join('\n\n'),anchor:sourceAnchor?.id||'',paragraph:first?.id||''};
  }
  document.addEventListener('selectionchange',captureSelection);
  root.querySelector('[data-sh-ask]').addEventListener('pointerdown',captureSelection);
  const question=root.querySelector('[data-sh-question]'),input=question.querySelector('[data-sh-question-input]'),payload=question.querySelector('[data-sh-payload]');
  let questionSelection=null;
  function updatePayload(){
    if(!questionSelection)return;
    payload.value=`我在阅读《${root.dataset.shTitle}》。\n原文：${root.dataset.shSource}${questionSelection.anchor?'#'+questionSelection.anchor:''}\n阅读位置：${location.origin}${location.pathname}#${questionSelection.paragraph}\n\n选中原文：\n${questionSelection.text}\n\n相邻上下文（原文）：\n${questionSelection.context}\n\n我的问题：\n${input.value.trim()||'请结合上下文解释这段内容。'}\n\n请区分原文事实、推断与不确定处；不要把这次讨论记为我的观点或已掌握。`;
  }
  root.querySelector('[data-sh-ask]').addEventListener('click',event=>{
    if(!selection){setStatus('先在正文中选中一段文字，再点“选段提问”。');return;}
    setStatus('');questionSelection={...selection};question.querySelector('[data-sh-quote]').textContent=questionSelection.text;
    question.querySelector('[data-sh-copy-status]').textContent='';input.value='';updatePayload();openDialog(question,event.currentTarget);input.focus({preventScroll:true});
  });
  input.addEventListener('input',updatePayload);
  question.querySelector('[data-sh-copy]').addEventListener('click',async()=>{
    updatePayload();
    try{await navigator.clipboard.writeText(payload.value);question.querySelector('[data-sh-copy-status]').textContent='已复制。粘贴到现有 Chat 即可继续。';}
    catch{question.querySelector('[data-sh-copy-status]').textContent='浏览器未允许自动复制。下方文本已选中，可手动复制。';question.querySelector('[data-sh-payload-detail]').open=true;payload.focus({preventScroll:true});payload.select();}
  });
}
