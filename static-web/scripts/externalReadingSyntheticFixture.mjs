import fs from 'node:fs';
import path from 'node:path';

const options=Array.from({length:4},(_,i)=>String.fromCharCode(65+i)+'. option '+(i+1)).join('\n');
const qblock=(start,end)=>Array.from({length:end-start+1},(_,i)=>{
  const n=start+i;
  return `${n}. Synthetic source-native question ${n}?\n${options}`;
}).join('\n');
const tpoKey=count=>Array.from({length:count},(_,i)=>`| ${i+1} | A |`).join('\n');

export function writeExternalReadingSyntheticSource(sourceRoot){
  fs.mkdirSync(path.join(sourceRoot,'TOEFL'),{recursive:true});
  fs.mkdirSync(path.join(sourceRoot,'IELTS'),{recursive:true});
  fs.writeFileSync(path.join(sourceRoot,'source_manifest.json'),JSON.stringify({schema:'synthetic-external-source-test'}));

  const tpoCounts={
    56:[14,13,14],57:[14,14,14],58:[14,14,14],59:[14,14,14],60:[14,14,14],
    61:[14,14,14],62:[14,14,14],63:[14,14,14],64:[10,10,10],65:[10,10,10]
  };
  for(const [number,counts] of Object.entries(tpoCounts)){
    const sections=counts.map((count,index)=>[
      `# Passage ${index+1} — Synthetic TPO ${number} P${index+1}`,
      '## Passage and Questions',
      `[Paragraph 1] Synthetic academic passage ${number}-${index+1}. Transferable reading skill is shared, but source-native task identity is preserved.`,
      qblock(1,count),
      '## Answer Key',
      '| Question | Answer |',
      '| --- | --- |',
      tpoKey(count)
    ].join('\n')).join('\n\n');
    fs.writeFileSync(path.join(sourceRoot,'TOEFL',`TPO${number}.md`),sections);
  }

  for(const book of [17,18,19]){
    const tests=[];
    for(let test=1;test<=4;test++){
      const passages=[[1,13],[14,26],[27,40]].map(([start,end],index)=>[
        `## Reading Passage ${index+1}`,
        `[Paragraph 1] Synthetic IELTS ${book} test ${test} passage ${index+1}. Engineering fixture only.`,
        `Questions ${start}–${end}`,
        qblock(start,end)
      ].join('\n')).join('\n\n');
      const key=Array.from({length:40},(_,i)=>`${i+1} A`).join('\n');
      tests.push([
        `# Test ${test}`,
        passages,
        `## Test ${test} — Reading Answer Key`,
        key
      ].join('\n\n'));
    }
    fs.writeFileSync(path.join(sourceRoot,'IELTS',`Cambridge_IELTS_${book}_Academic_Reading.md`),tests.join('\n\n'));
  }
  return sourceRoot;
}
