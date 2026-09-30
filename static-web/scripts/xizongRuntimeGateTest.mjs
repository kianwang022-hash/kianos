import assert from 'node:assert/strict';
import vm from 'node:vm';

// Test-only shared oracle. Evaluate the actual final-group callback with both
// original-visual negative paths; never remove a Runtime gate to satisfy a
// retired source-text assertion. No filesystem or learner-state mutation.
export function assertXizongFinalGroupTransition(runtimeSource) {
  const finalTransition = runtimeSource.match(/window\.setTimeout\(\(\) => \{\s*(const visualBlockedIndex = firstBlockingVisualGroupIndex\(\);[\s\S]*?)\n\s*\}, 120\);/)?.[1];
  assert.ok(finalTransition, 'runtime-final-group-transition-missing');
  for (const [blocked, reviewable, expectedStage] of [[false,false,'block_recall'],[true,true,'source_contact'],[true,false,'kp_recall']]) {
    const next=[];
    const state={groupIndex:2,kpIndex:8,sourceSegmentIndex:0};
    const context={state,groups:[{label:'fixture'}],statusLabel:{textContent:''},
      firstBlockingVisualGroupIndex:()=>blocked?0:-1,firstIndexForGroup:()=>3,
      naturalSegmentIndexForGroup:()=>1,groupVisualGapReviewableFromOriginalSource:()=>reviewable,
      save:()=>{},setStage:stage=>next.push(stage)};
    new vm.Script(`(()=>{${finalTransition}})()`).runInNewContext(context,{timeout:100});
    assert.ok(next.length===1&&next[0]===expectedStage,`runtime-final-group-transition:${blocked}/${reviewable}`);
    if(blocked)assert.ok(state.groupIndex===0&&state.kpIndex===3&&state.sourceSegmentIndex===1,'runtime-final-group-visual-return-location');
  }
}
