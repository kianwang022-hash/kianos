import assert from 'node:assert/strict';

// Counts/text can pass while SVG arrows point the wrong way. Sample the actual
// paths against rendered nodes, including direct edges that skip a rank.
export async function assertPoliticsMapGeometry(rendered, label) {
  const observation=await rendered.locator('[data-frame-graph]').evaluate(graph=>{
    const origin=graph.getBoundingClientRect();
    const horizontal=getComputedStyle(graph).gridTemplateColumns.trim().split(/\s+/).length>1;
    const nodes=[...graph.querySelectorAll('[data-graph-node]')].map(node=>{const b=node.getBoundingClientRect();return {id:node.dataset.graphNode,left:b.left-origin.left,right:b.right-origin.left,top:b.top-origin.top,bottom:b.bottom-origin.top};});
    const paths=[...graph.querySelectorAll('[data-edge-path]')].map(path=>{
      const from=nodes.find(node=>node.id===path.dataset.from),to=nodes.find(node=>node.id===path.dataset.to),length=path.getTotalLength();
      const start=path.getPointAtLength(0),end=path.getPointAtLength(length);
      const expectedStart=horizontal?{x:from.right+1,y:(from.top+from.bottom)/2}:{x:(from.left+from.right)/2,y:from.bottom+1};
      const expectedEnd=horizontal?{x:to.left-3,y:(to.top+to.bottom)/2}:{x:(to.left+to.right)/2,y:to.top-3};
      const collisions=new Set();
      for(let i=1;i<80;i++){
        const point=path.getPointAtLength(length*i/80);
        for(const node of nodes){if(node.id===from.id||node.id===to.id)continue;if(point.x>node.left+2&&point.x<node.right-2&&point.y>node.top+2&&point.y<node.bottom-2)collisions.add(node.id);}
      }
      return {from:from.id,to:to.id,skip:path.dataset.rankSkip,startError:Math.hypot(start.x-expectedStart.x,start.y-expectedStart.y),endError:Math.hypot(end.x-expectedEnd.x,end.y-expectedEnd.y),collisions:[...collisions]};
    });
    return {direction:graph.dataset.graphDirection,expectedDirection:horizontal?'horizontal':'vertical',paths};
  });
  assert.equal(observation.direction,observation.expectedDirection,`${label}: wrong rendered axis`);
  for(const edge of observation.paths){assert.ok(edge.startError<1&&edge.endError<1,`${label}: edge endpoint mismatch ${JSON.stringify(edge)}`);assert.deepEqual(edge.collisions,[],`${label}: edge crosses an unrelated node ${JSON.stringify(edge)}`);}
  return observation;
}
