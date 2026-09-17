import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(process.cwd(),'..');
const projectionRoot=path.join(root,'content/politics/projection');

const walk=(dir)=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
  const full=path.join(dir,entry.name);
  return entry.isDirectory()?walk(full):[full];
});
const projections=walk(projectionRoot).filter(p=>p.endsWith('.projection.json'));

const primaryMeaning=[];
const heavyPrimary=[];
const repeatedEdges=[];
const primaryDistribution={};
let passUnits=0;

for(const file of projections){
  const projection=JSON.parse(fs.readFileSync(file,'utf8'));
  const sourcePath=projection.source?.path;
  if(!sourcePath) continue;
  const source=JSON.parse(fs.readFileSync(path.join(root,sourcePath),'utf8'));
  const rawUnits=source.units||source.unit_projections||(source.unit?[source.unit]:[]);
  const rawById=new Map(rawUnits.map(u=>[u.natural_unit_id,u]));

  for(const unit of projection.units||[]){
    if(unit.projection_disposition!=='PASS') continue;
    passUnits+=1;
    const orient=unit.surface_mapping?.ORIENT||[];
    const primary=orient.filter(g=>g.zone==='PRIMARY');
    primaryDistribution[primary.length]=(primaryDistribution[primary.length]||0)+1;

    if(primary.length>=4){
      heavyPrimary.push({
        file:path.relative(root,file),
        unit:unit.unit_id,
        count:primary.length,
        groups:primary.map(g=>({id:g.id,primitive:g.primitive,title:g.title,item_fields:g.item_fields||[]}))
      });
    }

    for(const group of primary){
      if((group.item_fields||[]).includes('meaning')){
        primaryMeaning.push({
          file:path.relative(root,file),
          unit:unit.unit_id,
          group:group.id,
          primitive:group.primitive,
          title:group.title,
          item_fields:group.item_fields
        });
      }
    }

    const raw=rawById.get(unit.unit_id);
    for(const map of raw?.learning_semantics?.framework_maps||[]){
      const labels=new Map((map.nodes||[]).map(n=>[n.id,String(n.label||'').trim()]));
      for(const edge of map.edges||[]){
        const from=labels.get(edge.from)||String(edge.from||'');
        const to=labels.get(edge.to)||String(edge.to||'');
        const relation=String(edge.relation||'').trim();
        const repeatsFrom=Boolean(from&&relation.includes(from));
        const repeatsTo=Boolean(to&&relation.includes(to));
        if(relation&&(repeatsFrom||repeatsTo)){
          repeatedEdges.push({
            file:sourcePath,
            unit:unit.unit_id,
            map:map.id,
            from,to,relation,repeatsFrom,repeatsTo
          });
        }
      }
    }
  }
}

console.log(JSON.stringify({
  passUnits,
  primaryDistribution,
  primaryMeaningCount:primaryMeaning.length,
  primaryMeaning,
  heavyPrimaryCount:heavyPrimary.length,
  heavyPrimary,
  repeatedEdgeCount:repeatedEdges.length,
  repeatedEdges
},null,2));
