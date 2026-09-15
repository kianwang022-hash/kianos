import p55Url from '../assets/xizong/source-visuals/a2-r03-lg01/p55.webp?url';
import p60Url from '../assets/xizong/source-visuals/a2-r03-lg01/p60.webp?url';
import p63Url from '../assets/xizong/source-visuals/a2-r03-lg01/p63.webp?url';

const PATHOLOGY_SOURCE_SHA = '7b41f26673fbb562519ac57bb419c2ec82a88c63b5d538a77aaff2e46428dc3f';

const bundles = Object.freeze({
  'a2-r03-lg01-visual': Object.freeze({
    sourceSha256: PATHOLOGY_SOURCE_SHA,
    completenessPolicy: 'FAIL_CLOSED_IF_REQUIRED_ASSET_MISSING',
    assets: Object.freeze([
      Object.freeze({
        sourceObjectId: 'pathology:7b41f26673fbb562:pi54:r067191-059388-604717-938331',
        sourcePage: 55,
        usageLabel: 'P55 · 正常气道 → 肺腺泡定位',
        alt: '病理讲义 P55：传导部、呼吸部与肺腺泡的连续定位原图',
        src: p55Url,
        width: 420,
        height: 555,
        derivedAssetSha256: 'd755619e3b711effbaff75c818cf25d56585655bbd338ab92362a1e84bb80a83'
      }),
      Object.freeze({
        sourceObjectId: 'pathology:7b41f26673fbb562:pi59:r067191-593881-547125-873005',
        sourcePage: 60,
        usageLabel: 'P60 · 慢支气道壁病理',
        alt: '病理讲义 P60：慢性支气管炎气道壁病理变化原图',
        src: p60Url,
        width: 420,
        height: 197,
        derivedAssetSha256: '026d4a76477fedcded32732765ac20951048a8ef21a135b1228fee919b3a8b37'
      }),
      Object.freeze({
        sourceObjectId: 'pathology:7b41f26673fbb562:pi62:r076789-053449-623914-451349',
        sourcePage: 63,
        usageLabel: 'P63 · 肺气肿腺泡分型',
        alt: '病理讲义 P63：肺气肿在肺腺泡内的分型位置原图',
        src: p63Url,
        width: 420,
        height: 247,
        derivedAssetSha256: 'd767568499deb8db5d55b95beb0bde0f5db753e44b1dabbff263526820171b58'
      })
    ])
  })
});

export function sourceVisualBundleForCue(cueId) {
  return bundles[String(cueId || '')] || null;
}

export function attachSourceVisualBundles(rows = []) {
  return (Array.isArray(rows) ? rows : []).map((row) => {
    const bundle = sourceVisualBundleForCue(row?.id);
    if (!bundle) return row;
    return {
      ...row,
      source_visual_bundle: bundle
    };
  });
}
