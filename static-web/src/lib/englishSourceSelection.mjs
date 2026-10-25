import {englishObjectiveSourceBlocks} from './englishLearnerEvidence.mjs';

// The DOM adapts to the existing snapshot coordinates, never the reverse.
export function englishSourceModel(root,meta){
 const material=[...root.querySelectorAll(meta.task==='reading_a'?'[data-reading-passage] p':'[data-objective-material-block]')];
 const candidates=[...root.querySelectorAll('[data-objective-candidate] > span')];
 const segments=englishObjectiveSourceBlocks(meta.snapshot,meta.task).map(block=>{
  const node=(block.kind==='candidate'?candidates:material)[block.index];
  return {...block,node:node?.textContent===block.text?node:null};
 });
 return {text:segments.map(row=>row.text).join('\n\n'),segments};
}

export function englishSourceSelection(model,range){
 const offset=(node,position)=>{
  const segment=model.segments.find(row=>row.node?.contains(node));
  if(!segment)return null;
  const prefix=segment.node.ownerDocument.createRange();
  prefix.selectNodeContents(segment.node);prefix.setEnd(node,position);
  return segment.start+prefix.toString().length;
 };
 const start=offset(range.startContainer,range.startOffset),end=offset(range.endContainer,range.endOffset);
 if(start==null||end==null||end<=start)return null;
 return {start,end,text:model.text.slice(start,end),source_locator:model.segments.find(row=>start>=row.start&&start<row.end)?.locator||''};
}

export function englishSourceRange(model,span){
 if(model.text.slice(span.start,span.end)!==span.text)return null;
 const point=offset=>{
  const segment=model.segments.find(row=>row.node&&offset>=row.start&&offset<=row.end);
  if(!segment)return null;
  const walker=segment.node.ownerDocument.createTreeWalker(segment.node,NodeFilter.SHOW_TEXT);
  let remaining=offset-segment.start,node;
  while((node=walker.nextNode())){
   if(remaining<=node.textContent.length)return [node,remaining];
   remaining-=node.textContent.length;
  }
  return null;
 };
 const start=point(span.start),end=point(span.end);
 if(!start||!end)return null;
 const range=start[0].ownerDocument.createRange();range.setStart(...start);range.setEnd(...end);
 return range;
}

export function englishSourceRanges(model,span){
 if(model.text.slice(span.start,span.end)!==span.text)return [];
 const blocks=model.segments.filter(row=>row.start<span.end&&row.end>span.start);
 if(blocks.some(row=>!row.node))return [];
 return blocks.map(block=>{
  const start=Math.max(block.start,span.start),end=Math.min(block.end,span.end);
  return englishSourceRange(model,{start,end,text:model.text.slice(start,end)});
 }).filter(Boolean);
}

export function clearEnglishSourceMarks(root){
 root.querySelectorAll('mark[data-reading-discussion-mark]').forEach(mark=>mark.replaceWith(...mark.childNodes));
 root.normalize();
}

// Fallback supports overlapping and cross-paragraph spans without inserting UI text.
export function markEnglishSourceFallback(model,spans){
 for(const segment of model.segments){
  if(!segment.node)continue;
  const doc=segment.node.ownerDocument,walker=doc.createTreeWalker(segment.node,NodeFilter.SHOW_TEXT),nodes=[];
  let node,offset=segment.start;
  while((node=walker.nextNode())){nodes.push({node,start:offset});offset+=node.textContent.length;}
  for(const {node,start} of nodes){
   const text=node.textContent,end=start+text.length;
   const matches=spans.filter(span=>span.start<end&&span.end>start);
   if(!matches.length)continue;
   const boundaries=[...new Set([0,text.length,...matches.flatMap(span=>[
    Math.max(0,span.start-start),Math.min(text.length,span.end-start)
   ])])].sort((a,b)=>a-b);
   const fragment=doc.createDocumentFragment();
   for(let i=0;i<boundaries.length-1;i++){
    const from=boundaries[i],to=boundaries[i+1];
    const selected=matches.filter(span=>span.start<start+to&&span.end>start+from);
    const part=doc.createTextNode(text.slice(from,to));
    if(!selected.length){fragment.append(part);continue;}
    const mark=doc.createElement('mark');mark.setAttribute('data-reading-discussion-mark','');
    mark.setAttribute('data-english-highlight-intent',selected.some(span=>span.intent==='DISCUSSION_CONTEXT')?'DISCUSSION_CONTEXT':'HIGHLIGHT');
    mark.append(part);fragment.append(mark);
   }
   node.replaceWith(fragment);
  }
 }
}
