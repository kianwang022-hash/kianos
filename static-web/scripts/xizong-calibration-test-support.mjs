import assert from 'node:assert/strict';
import { marked } from 'marked';
import { createHash } from 'node:crypto';

// Test-only normalization of the explicitly adopted additive model/Prompt view.
// Do not strip Core, Memory routing, Source boundaries, or arbitrary headings.
export function beforePromptCalibration(source) {
  const pattern = /^#{1,2} (?:(?:1A|2\.4)｜)?同一模型上的自然节点〔完整 Prompt〕\n[\s\S]*?\n\*\*Residual 边界\*\*[^\n]*\n\n---\n\n?/gm;
  const matches = [...source.matchAll(pattern)];
  assert.ok(matches.length <= 1, 'ambiguous calibration view');
  return source.replace(pattern, '');
}

// Existing A2/A3/B descriptor goldens use these historical A1 source wrappers.
// The 2026-10-08 model review changes those wrappers while retaining every
// prepared card and semantic witness. Keep the ORIGINAL descriptor digests:
// normalize only their two whole-file transport hashes, never answer/Core data.
const frozenA1SourcePackaging = {
  "circulation-b02": "492d301d95616777cab94fc65d18cb5c530f7f573fc7e0f9ec1455dbf8bf3da2",
  "circulation-b03": "3770128a85547f8a258928592c38f5958db2555f814a8625a85be51f8c311297",
  "circulation-b04": "a3273e2ff1c4d3cb36495f338686892728977eca5a69b2f4f839eddf572db9e5",
  "circulation-b05": "27a66b4cd5188eeddeb9af0b1bdc1da61041f887a578d117bfa34625c4d21a60",
  "circulation-b06": "39f891bf22fd825b3147ccf5212a44fc0e09d1a45dc158676a64563402094048",
  "circulation-b07": "d05d101d29862ef5d62cd08978d0e8fda69595a66634c59be535c079e891d86e",
  "circulation-b08": "18b8ea4b2cac9186096b6d07152f344aac7ad25f421a6a02ce1c974d60d65208",
  "circulation-b09": "eb4dae031fce3091078e73213d76571c9f975898eb05c2ee5b3acbe57bf96b69",
  "circulation-b10": "2c2f489d1a6d514f08cdc89e4c6f150d7a1aa03251cbfe7683d34f304c86bd32",
  "circulation-b11": "3c985ab282d7e4ba7347b388f2a05863a461232e6468fc7ebda08f9244241221",
  "circulation-b12": "4d1bc93103759dabb2c3876be2a8fa2600d6025afd5c266a6470817b4ce0db6a"
};

export function descriptorAtFrozenPackaging(descriptor, source) {
  const result = structuredClone(descriptor);
  const sourceHash = frozenA1SourcePackaging[descriptor.blockId]
    || createHash('sha256').update(beforePromptCalibration(source)).digest('hex');
  // Only these two transport fingerprints may differ. The original frozen
  // descriptor digest still checks every card field and semantic witness.
  result.sourceHash = sourceHash;
  result.revisionWitness.sourceHash = sourceHash;
  return result;
}

// A1 B2–B12 models were read and cross-reviewed in the existing A1 Acceptance
// owner (2026-10-08). Before extracting these preserved values, c7a source and
// pre-entry fixtures reproduced BOTH original raw/pre-entry digests in the
// independent B and A3 baselines. Neither original baseline is rewritten.
// KP records, every non-Framework field and Framework owner metadata remain
// exact; the new authored Framework is checked with a separate Markdown lexer.
const a1ReviewedPreentry = {
  "circulation-b02": {
    "reviewed_raw_sha256": "a7a83d463138069ca11de92cb61c7c00ad5b27f0e536ddbafed880bc7fb798b0",
    "original_kp_records_sha256": "faad0e316332611ed76d488b4b4a3eca6db82c153ac1b0977545eaa83601ba14",
    "original_nonframework_sha256": "8394010086ce0444cd3dc27a6c46d022ad9aaa46bfe305e3fbcde0e45739e204",
    "original_framework_meta": {
      "present": true,
      "ownerPath": "content/xizong/knowledge/systems/a1-circulation/blocks/Block2_循环调节与容量控制_学习阅读版_v4_最终执行版.md",
      "anchor": "总 Framework",
      "items": [],
      "markdown": ""
    }
  },
  "circulation-b03": {
    "reviewed_raw_sha256": "9c4b932ea4211cb58a2d0277a2955bed0fd5107e5326db08b6cc47307247bc5f",
    "original_kp_records_sha256": "a0dc9a382c0f5376c32fb21af71b8dfaf39ba1fde7f14216652686c5d6df3077",
    "original_nonframework_sha256": "36f6c0d468f229baa7ad76e9169769b38873683fdeefe2bc0bdb664ed8fbf37d",
    "original_framework_meta": {
      "present": true,
      "ownerPath": "content/xizong/knowledge/systems/a1-circulation/blocks/Block3_心肌电活动与ECG语言_学习阅读版_v1_Batch2冻结版.md",
      "anchor": "总 Framework",
      "items": [],
      "markdown": ""
    }
  },
  "circulation-b04": {
    "reviewed_raw_sha256": "70c7f7363a96f29399cc1161d41c488ac3fd66cc81c9b6fb4bcf97eb285057f0",
    "original_kp_records_sha256": "1242277601c312f1cc3815f1ed41c6ea699a0fae7964441ac3ae2718a42890d3",
    "original_nonframework_sha256": "3829d4ecb34aab469968139f0cd682939b3a476f0a3d6bef1f3446f6c6dd608c",
    "original_framework_meta": {
      "present": true,
      "ownerPath": "content/xizong/knowledge/systems/a1-circulation/blocks/Block4_正常止血与病理循环整合_学习阅读版_v1_Batch2冻结版.md",
      "anchor": "总 Framework",
      "items": [],
      "markdown": ""
    }
  },
  "circulation-b05": {
    "reviewed_raw_sha256": "0d72778423b9c9812485bcd977a4594f72a99764e2ca9377e64f49484024a326",
    "original_kp_records_sha256": "1fd21dff8a62cf5bc1c30f1207acd41dbf50dc9deb4b1ba9c81a105cd15dfad0",
    "original_nonframework_sha256": "973ea5c6be2c56d84cc2a64e5c9fb527b7474911f9c7474ed502f48662d2c696",
    "original_framework_meta": {
      "present": true,
      "ownerPath": "content/xizong/knowledge/systems/a1-circulation/blocks/Block5_高血压与动脉粥样硬化_学习阅读版_v2_最终执行版.md",
      "anchor": "总 Framework",
      "items": [],
      "markdown": ""
    }
  },
  "circulation-b06": {
    "reviewed_raw_sha256": "274a32156d92940c89448f22ab09ab41ba6f8034c530e0d9bca54caf0faae0f8",
    "original_kp_records_sha256": "8fb9f8173de93bcd86bc840cf4967d40d7b1ba7ac140c8a7c013f625c2d8717e",
    "original_nonframework_sha256": "16f13604869897aaca51673089c4d522631cdb3a82bbabbdca2dec238d3edb25",
    "original_framework_meta": {
      "present": true,
      "ownerPath": "content/xizong/knowledge/systems/a1-circulation/blocks/Block6_冠心病与心肌梗死_学习阅读版_v1_Batch3冻结版.md",
      "anchor": "总 Framework",
      "items": [],
      "markdown": ""
    }
  },
  "circulation-b07": {
    "reviewed_raw_sha256": "7ef2596146bf4f280abcb57e6c969c6f70f3fb083261360d25f113c693396c25",
    "original_kp_records_sha256": "f804e53ddb198a8b7b725e58a6850f81b76f68be6a20b019ab174bab876c9163",
    "original_nonframework_sha256": "46b256cb86aa889f1d7821db68f40e91f3c6ed14c750640af85a2aaf292db86f",
    "original_framework_meta": {
      "present": true,
      "ownerPath": "content/xizong/knowledge/systems/a1-circulation/blocks/Block7_风湿_IE与四瓣膜病_学习阅读版_v1_Batch4冻结版.md",
      "anchor": "总 Framework",
      "items": [],
      "markdown": ""
    }
  },
  "circulation-b08": {
    "reviewed_raw_sha256": "8569da46c68e225553da36685355cb566992d2b51db76eef4dcc34770edfcb7a",
    "original_kp_records_sha256": "40bce756971fee6c7f362c022fd01767c94cbe9818b1d8b42839b6e36ce0a892",
    "original_nonframework_sha256": "92a7606d9b2bda130b384507f9e75648f268130cf20fd50e9ae53e90cd415aa0",
    "original_framework_meta": {
      "present": true,
      "ownerPath": "content/xizong/knowledge/systems/a1-circulation/blocks/Block8_心肌与心包_学习阅读版_v1_Batch4冻结版.md",
      "anchor": "总 Framework",
      "items": [],
      "markdown": ""
    }
  },
  "circulation-b09": {
    "reviewed_raw_sha256": "c1da7616684437e822ab2b52458dc78a7626f9ffd60d2de0dbdb303936da8af7",
    "original_kp_records_sha256": "f7d8adf7394b9c076a011a24f11b2011759019b2c8b788be951bf67a4d27a479",
    "original_nonframework_sha256": "d0e3ede8aef321341065420bdd93e2324934993f6800f66f005626c27f89a6dc",
    "original_framework_meta": {
      "present": true,
      "ownerPath": "content/xizong/knowledge/systems/a1-circulation/blocks/Block9_周围血管疾病_学习阅读版_v1_Batch4冻结版.md",
      "anchor": "总 Framework",
      "items": [],
      "markdown": ""
    }
  },
  "circulation-b10": {
    "reviewed_raw_sha256": "318425fa4b75ee4c94d629e87873ede8d14cda012ccde9249cb6550456abaef6",
    "original_kp_records_sha256": "fae2f5b9e01ec06aabae60403fee719f4dd19690881652429fd06ee5a47933fa",
    "original_nonframework_sha256": "fb7a6bcc330682821e69af01289921c795063f61409b939526596ac03051c2ce",
    "original_framework_meta": {
      "present": true,
      "ownerPath": "content/xizong/knowledge/systems/a1-circulation/blocks/Block10_心律失常_学习阅读版_v2_最终执行版.md",
      "anchor": "总 Framework",
      "items": [],
      "markdown": ""
    }
  },
  "circulation-b11": {
    "reviewed_raw_sha256": "88d27e49a07c1c103cf11969d96b151e696c517137006bf0c07984094a3b8ba3",
    "original_kp_records_sha256": "f2034af1387498eaf4c08a94c7067af6159d352f4fa85ab4c275772055b5fd2d",
    "original_nonframework_sha256": "86cff9d5f676b724836c1303cbae562883d39fd468241c70a2ba37c9c13a131f",
    "original_framework_meta": {
      "present": true,
      "ownerPath": "content/xizong/knowledge/systems/a1-circulation/blocks/Block11_心力衰竭_学习阅读版_v2_最终执行版.md",
      "anchor": "总 Framework",
      "items": [],
      "markdown": ""
    }
  },
  "circulation-b12": {
    "reviewed_raw_sha256": "e580557813d8eff5bbeb81cc5aa8804db3fd004e336c0d15db4ff3b4725ffa51",
    "original_kp_records_sha256": "dfb813b8be6c1d4fec05422a8390d1ddb9df77f10df5c2d3a9f10764a6d2ed42",
    "original_nonframework_sha256": "b3a616c7eba6b6f8dbfca66c8084143787c8e8bae33a6cc5ff517160eeb1c2f7",
    "original_framework_meta": {
      "present": true,
      "ownerPath": "content/xizong/knowledge/systems/a1-circulation/blocks/Block12_休克与心脏骤停_学习阅读版_v2_最终执行版.md",
      "anchor": "总 Framework",
      "items": [],
      "markdown": ""
    }
  }
};

export function assertReviewedA1Preentry(block, current, source) {
  const reviewed = block.systemId === 'circulation' && a1ReviewedPreentry[block.blockId];
  if (!reviewed) return false;
  const sha = value => createHash('sha256').update(value).digest('hex');
  assert.equal(sha(beforePromptCalibration(source)), reviewed.reviewed_raw_sha256);
  assert.equal(sha(JSON.stringify(block.kpRecords)), reviewed.original_kp_records_sha256);
  const { framework, ...other } = current;
  assert.equal(sha(JSON.stringify(other)), reviewed.original_nonframework_sha256);
  assert.deepEqual({ ...framework, items: [], markdown: '' }, reviewed.original_framework_meta);
  let offset = 0;
  const headings = [];
  for (const token of marked.lexer(source, { gfm: true })) {
    const start = source.indexOf(token.raw, offset);
    assert.ok(start >= offset, 'independent Markdown token must match the source');
    if (token.type === 'heading') headings.push({ anchor: token.text, level: token.depth,
      line: source.slice(0, start).split('\n').length });
    offset = start + token.raw.length;
  }
  const matches = headings.filter(row => row.anchor === framework.anchor);
  assert.equal(matches.length, 1, block.blockId + ': unique authored Framework');
  const start = matches[0];
  const end = headings.find(row => row.line > start.line && row.level <= start.level);
  const authored = source.split('\n').slice(start.line - 1, end ? end.line - 1 : undefined).join('\n').trim();
  assert.equal(framework.markdown, authored, block.blockId + ': complete current authored Framework');
  return true;
}

// A2 R2/R3 model review (2026-10-08), based on original 4ad inputs.
// Original A3/B source, descriptor and preentry goldens were first reproduced
// independently. Five Learning fields and five existing Memory owner witnesses
// really changed; tests assert the CURRENT values and revisions separately.
// No answer/admission/Core is re-signed and no runtime witness is normalized.
const a2ReviewedSources = {
  "respiratory-r02": {
    "originalCanonicalGitBlob": "a83808a1e3bf3a6c1d777f873bf27e4250f9dcb0",
    "originalPackagingSha256": "cc0b0d1f3df7ee8d8cd8009d61c966995407589c89ec1b45c9f6614f9f787c1b",
    "reviewedCurrentSourceSha256": "7b797f14db04ef71bd76ee27e4ca182a0491418b39ec33257ef194fafbd080c3",
    "originalProtectedSourceSha256": "a13ccf3448e78a7fa8ca1d7cf819a187f27645f14325fb7e8d4b3dd65b5a875c"
  },
  "respiratory-r03": {
    "originalCanonicalGitBlob": "5496f8e1769cdf061a582d2f2f4ef325a23bb40d",
    "originalPackagingSha256": "332800f4955c96167b019a3f811ea9f59fa3215ac4f5b5246c59c84b34a28b32",
    "reviewedCurrentSourceSha256": "6d05f676b86054597f6d6a4be46e687c8150bcce555124b682e92bb35a31a07b",
    "originalProtectedSourceSha256": "7366ba10eadd5241197e5be96a453b4ae357c272bbb520f461660067b65fa0a7"
  }
};

const a2ReviewedSynchronizedLines = {
  "respiratory-r02": [
    [
      "14. PaO₂ / PaCO₂ 对呼吸中枢既有间接兴奋，也有高水平直接抑制；",
      "14. PaO₂降低 / PaCO₂升高可经化学感受反射间接兴奋呼吸；严重低氧或过高CO₂可直接抑制呼吸中枢；"
    ],
    [
      "12. CO 中毒为什么 PaO₂正常、氧含量下降、PvO₂下降？",
      "12. CO 中毒为什么 PaO₂可正常、氧含量下降，而 PvO₂不能固定写成下降？"
    ]
  ],
  "respiratory-r03": [
    [
      "11. 为什么先动态顺应性下降，后静态顺应性升高？",
      "11. 小气道阻力和通气不均、肺气肿分别怎样影响动态与静态顺应性？为什么不能把它们当作所有 COPD 的固定先后阶段？"
    ]
  ]
};

const a2ReviewedLearningChanges = [
  {
    "path": "blocks/respiratory-r02/first_pass_focus",
    "before": "从肺泡气体跨膜开始，一路追到 VA/Q、Hb 运输和呼吸控制，建立‘氧为什么低、CO₂ 为什么高/低’的共同语言。",
    "after": "把肺泡通气与肺血流的并行匹配、跨膜弥散、双向气体运输和通气反馈接入同一模型，解释氧为什么低、CO₂为什么高或低。"
  },
  {
    "path": "blocks/respiratory-r02/recall_spine",
    "before": "跨膜 → VA/Q → O₂/CO₂运输 → Hb装卸氧 → 呼吸控制",
    "after": "VA与Q并行匹配 + 分压差/膜条件 → 肺血交换；O₂随Hb到组织，CO₂反向回肺；血气/H⁺ → 外周/中枢反馈 → 有效肺泡通气 → 血气"
  },
  {
    "path": "blocks/respiratory-r02/logic_groups/respiratory-r02-lg01/closure",
    "before": "能从呼吸膜改变预测弥散方向，并知道‘通气正常’不等于‘跨膜正常’。",
    "after": "能依分压差判断扩散方向、依膜厚度和有效面积变化预测弥散通量，并知道“通气正常”不等于“跨膜正常”。"
  },
  {
    "path": "blocks/respiratory-r03/first_pass_focus",
    "before": "把慢支和肺气肿放回同一条 COPD 机制链：结构损伤怎样变成持续气流受限、过度充气和换气失败。",
    "after": "把气道损伤与肺实质破坏放入同一COPD模型，分清并行底物、呼气受限、过度充气和气体交换失败的条件。"
  },
  {
    "path": "blocks/respiratory-r03/recall_spine",
    "before": "气道损伤 + 肺泡弹性破坏 → 持续气流受限 → 过度充气/换气失败 → 分期治疗",
    "after": "气道损伤 / 肺实质破坏 → 呼气受限（呼气时间不足可加重气体潴留）；区域VA/Q、弥散面积及整体有效肺泡通气分别解释血气 → 按当前稳定 / 急性加重处理对应故障"
  }
];

const a2ReviewedOwnerChanges = [
  {
    "id": "a2-r01-kp02-precision",
    "before": "e7cdcf0334724d0d243f226ba5b189e2851284dc903970afc4368a61e982ccda",
    "after": "d7cf40907e048e83fb5ae7e832bc49d1359e599b2a5116eab5346267d9cb1521"
  },
  {
    "id": "a2-r02-kp03-precision",
    "before": "e63984f172c18f0412e2188cea467f5157984ee1df2edcc79e4ecd62be7d691e",
    "after": "69c47a5b9e0315cdbfcbae8184d558a97eefa8101ab8f315fbde55d84738d967"
  },
  {
    "id": "a2-r02-lg04-precision",
    "before": "b37c78187cbb6cd4f16959acde74c4a91a888de747d2d486bc278a02bd6cf9b0",
    "after": "228f99ef37dae57e4597e6525fb4492e4d222ef97ba21d4e37be9fa4e19cbb78"
  },
  {
    "id": "a2-r03-lg03-precision",
    "before": "89abdbcf0bd4a9990d5c525fffe0610a6a0ce6d0c0c860816f0c87ff77eabaff",
    "after": "4b6789dcb75a1e821fe01b18a2eb1978f8311e487190e374c2395b14dbf8084d"
  },
  {
    "id": "a2-r03-lg05-precision",
    "before": "7480eaa3a89dd7d4ee7d62bd6b6b17509b99a3df56b5a4915c98da5b242ee93b",
    "after": "cbbfecff0a2aa6df06f89c316d38b93a1535e474d83a34e878ce5edfff6ecb1d"
  }
];

const a2ReviewedDescriptorChanges = {
  "respiratory-r01": [
    {
      "path": "revisionWitness/kps/respiratory-r01-kp02",
      "before": "325b23dd7684b9785a2606c3bfb67ac0069d31a3f570f51c660322672039d9b4",
      "after": "3c56f31568f2d278a7b0ddcf44fd8d1b0259b4a56595441361db671ecb50ead3"
    },
    {
      "path": "precisionCards/1/semanticRevision",
      "before": "325b23dd7684b9785a2606c3bfb67ac0069d31a3f570f51c660322672039d9b4",
      "after": "3c56f31568f2d278a7b0ddcf44fd8d1b0259b4a56595441361db671ecb50ead3"
    }
  ],
  "respiratory-r02": [
    {
      "path": "revisionWitness/kps/respiratory-r02-kp03",
      "before": "56b0bb2f7b0a951bd55714a61559a20c713b691e1db34aea2214427d58536ccc",
      "after": "f8aee8032e83a21eecab23d94284cb3968715679bb8faa39f80816c9584ffc53"
    },
    {
      "path": "revisionWitness/groups/respiratory-r02-lg01",
      "before": "7b9893233b9f9a864f603e78fef2bcb725949d2a1c80c0b9ede31593ad64cf00",
      "after": "a4206fc7bc78353ba5d492428d5823d41aa9bf5fe31a49d4ef07011c8bfa449e"
    },
    {
      "path": "revisionWitness/groups/respiratory-r02-lg04",
      "before": "9435642702b1378b0ac75b04b5e255fcc47f21da346fba72a6de18a8a31ff405",
      "after": "c016b784fcc500331c37c23cdf3cd294ceddb6c491605bbbf23d5592aef06208"
    },
    {
      "path": "revisionWitness/block",
      "before": "fcb3c7477d93656e4079d811a613f6b73624ec73d4bd8e7e55c9b565d70939fc",
      "after": "1cd608a60e9880ded011d5e71954fbf90623ea5dcaeebd56631bf9f106501371"
    },
    {
      "path": "precisionCards/0/semanticRevision",
      "before": "56b0bb2f7b0a951bd55714a61559a20c713b691e1db34aea2214427d58536ccc",
      "after": "f8aee8032e83a21eecab23d94284cb3968715679bb8faa39f80816c9584ffc53"
    },
    {
      "path": "precisionCards/1/semanticRevision",
      "before": "9435642702b1378b0ac75b04b5e255fcc47f21da346fba72a6de18a8a31ff405",
      "after": "c016b784fcc500331c37c23cdf3cd294ceddb6c491605bbbf23d5592aef06208"
    }
  ],
  "respiratory-r03": [
    {
      "path": "revisionWitness/groups/respiratory-r03-lg03",
      "before": "b2c22e0d81918ae1543601b890fe49e16ff9d25e7315eba5189f8aa379e5c79c",
      "after": "40a0b626403498aea6334d5225237ed1beb2bbeb12b64899dde0e5d0f0707308"
    },
    {
      "path": "revisionWitness/groups/respiratory-r03-lg05",
      "before": "3bcc3d9713f99113ada78d483bb6d54b892118a53e2d1b0035ed033e574d579b",
      "after": "41c1a001abec68a053de781a0609080e782cb6778cff89b46adbd73e9c220364"
    },
    {
      "path": "revisionWitness/block",
      "before": "6aa690c02d1667c9056e2e84dd2d9a8895c58e32ae21ddfb2e21ba265db702fa",
      "after": "275a5146ad36f5160fc9b3c9d66d312c255bd1f8842cf963bdd0de157ce59a1d"
    },
    {
      "path": "precisionCards/0/semanticRevision",
      "before": "b2c22e0d81918ae1543601b890fe49e16ff9d25e7315eba5189f8aa379e5c79c",
      "after": "40a0b626403498aea6334d5225237ed1beb2bbeb12b64899dde0e5d0f0707308"
    },
    {
      "path": "precisionCards/1/semanticRevision",
      "before": "3bcc3d9713f99113ada78d483bb6d54b892118a53e2d1b0035ed033e574d579b",
      "after": "41c1a001abec68a053de781a0609080e782cb6778cff89b46adbd73e9c220364"
    }
  ]
};

const a2ReviewedPreentry = {
  "respiratory-r02": {
    "originalKpRecordsSha256": "28b427cb329e51b7af153e0f8a944976fe5b7d25b07a0291b2cb81468866b227",
    "originalPreentrySha256": "e40af0376d38ec7bfeb70fe0b30f2d9ae55842ebef92a324224acab0d511e4a3",
    "originalStablePreentrySha256": "f078243db781f64ccb0df2a20569243076e1474ba60cdc1e0e4b74fa785e3296",
    "originalFrameworkMeta": {
      "present": false,
      "ownerPath": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block2_肺换气_气体运输与呼吸调节_学习阅读版_v1_最终执行版.md",
      "anchor": null,
      "items": [],
      "markdown": ""
    },
    "nonFrameworkChanges": [
      {
        "path": "memoryRouting/miG/13",
        "before": "PaO₂ / PaCO₂ 对呼吸中枢既有间接兴奋，也有高水平直接抑制；",
        "after": "PaO₂降低 / PaCO₂升高可经化学感受反射间接兴奋呼吸；严重低氧或过高CO₂可直接抑制呼吸中枢；"
      }
    ]
  },
  "respiratory-r03": {
    "originalKpRecordsSha256": "a13479d221fb8b117ec6fa0cba817964d0382815f8300fb91a0e9f0f7399cf17",
    "originalPreentrySha256": "417831688ac9b49d758a982f2afd3f8eed9dc7b43c8f6e1304bb4682ea143916",
    "originalStablePreentrySha256": "1fce42d379a51897341608e0c211212c84a10fc9b63958f7fb5c2ea2974908f9",
    "originalFrameworkMeta": {
      "present": false,
      "ownerPath": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block3_COPD_持续气流受限_学习阅读版_v1_最终执行版.md",
      "anchor": null,
      "items": [],
      "markdown": ""
    },
    "nonFrameworkChanges": []
  }
};

const a2TestSha = value => createHash('sha256').update(value).digest('hex');
const a2TestStable = value => Array.isArray(value) ? value.map(a2TestStable)
  : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, a2TestStable(value[key])])) : value;
const a2TestDigest = value => a2TestSha(JSON.stringify(a2TestStable(value)));

function a2ReplaceOnce(text, before, after) {
  assert.equal(text.split(before).length - 1, 1, 'unique explicitly reviewed A2 value');
  return text.replace(before, after);
}

function a2ProtectedSource(source, blockId) {
  let text = source;
  for (const prefix of ['> **文件性质**：', '> **中心问题**：']) {
    const lines = text.split('\n').filter(line => line.startsWith(prefix));
    assert.equal(lines.length, 1, blockId + ': unique existing model description');
    text = text.replace(lines[0], prefix + 'REVIEWED_MODEL_DESCRIPTION');
  }
  const model = /^## 0｜这个 Block 到底解决什么\n[\s\S]*?(?=^## 2｜Memory Routing\n)/gm;
  assert.equal([...text.matchAll(model)].length, 1, blockId + ': exact model/Framework span');
  text = text.replace(model, 'REVIEWED_MODEL_FRAMEWORK_AND_ANNOTATIONS\n');
  // Three independently read, explicitly approved repairs outside the main
  // model. The current wording is required before making a comparison copy.
  for (const [before, after] of a2ReviewedSynchronizedLines[blockId]) text = a2ReplaceOnce(text, after, before);
  if (blockId === 'respiratory-r02') {
    const exitModel = /B1 \+ B2 现在共同提供呼吸系统的正常语言：\n\n```text\n[\s\S]*?\n```/g;
    assert.equal([...text.matchAll(exitModel)].length, 1, 'R2: same model in existing exit');
    text = text.replace(exitModel, 'B1 + B2 现在共同提供呼吸系统的正常语言：\n\nREVIEWED_SAME_MODEL_EXIT');
  }
  return text;
}

export function assertReviewedA2Source(source, blockId, originalCanonicalGitBlob = null) {
  const reviewed = a2ReviewedSources[blockId];
  if (!reviewed) return false;
  if (originalCanonicalGitBlob) assert.equal(originalCanonicalGitBlob, reviewed.originalCanonicalGitBlob);
  assert.equal(a2TestSha(source), reviewed.reviewedCurrentSourceSha256, blockId + ': exact separately reviewed model and synchronized lines');
  assert.equal(a2TestSha(a2ProtectedSource(source, blockId)), reviewed.originalProtectedSourceSha256,
    blockId + ': original complete nonmodel content, Source, Core and Memory');
  return true;
}

// These return historical comparison bytes only. They require each exact
// current reviewed value and preserve every other byte for the ORIGINAL golden.
export function a2LearningBeforeModelReview(source) {
  const learning = JSON.parse(source);
  let historical = source;
  for (const change of a2ReviewedLearningChanges) {
    const actual = change.path.split('/').reduce((owner, key) => owner?.[key], learning);
    assert.equal(actual, change.after, change.path + ': actual reviewed Learning meaning');
    assert.notEqual(change.after, change.before);
    historical = a2ReplaceOnce(historical, JSON.stringify(change.after), JSON.stringify(change.before));
  }
  return historical;
}

export function a2CuesBeforeOwnerReview(source) {
  const index = JSON.parse(source);
  let historical = source;
  for (const change of a2ReviewedOwnerChanges) {
    const rows = index.precision_index.filter(row => row.id === change.id);
    assert.equal(rows.length, 1, change.id + ': existing admission only');
    assert.equal(rows[0].prepared_memory_ref.owner_sha256, change.after, change.id + ': current reviewed dependency witness');
    assert.notEqual(change.after, change.before);
    historical = a2ReplaceOnce(historical, JSON.stringify(change.after), JSON.stringify(change.before));
  }
  return historical;
}

export function assertPreparedDescriptorAfterModelReview(descriptor, source, originalDigest) {
  if (!descriptor) { assert.equal(a2TestDigest(null), originalDigest); return; }
  const comparison = descriptorAtFrozenPackaging(descriptor, source);
  const changes = a2ReviewedDescriptorChanges[descriptor.blockId];
  if (changes) {
    assert.equal(descriptor.systemId, 'respiratory');
    assert.equal(descriptor.canonicalId, 'A2');
    assert.equal(descriptor.sourceHash, a2TestSha(source));
    assert.equal(descriptor.revisionWitness.sourceHash, descriptor.sourceHash);
    for (const change of changes) {
      const keys = change.path.split('/');
      const actual = keys.reduce((owner, key) => owner?.[key], descriptor);
      // These are real current Learning/Block/LG/KP/card revisions. An old or
      // arbitrary revision is rejected, never silently treated as equivalent.
      assert.equal(actual, change.after, descriptor.blockId + '/' + change.path);
      assert.notEqual(actual, change.before, 'approved semantic revision must remain changed');
      const parent = keys.slice(0, -1).reduce((owner, key) => owner[key], comparison);
      parent[keys.at(-1)] = change.before;
    }
    const reviewed = a2ReviewedSources[descriptor.blockId];
    if (reviewed) {
      assertReviewedA2Source(source, descriptor.blockId);
      comparison.sourceHash = reviewed.originalPackagingSha256;
      comparison.revisionWitness.sourceHash = reviewed.originalPackagingSha256;
    }
  }
  // The old independent digest still protects every answer, context, identity,
  // owner, Source field and every semantic field outside the exact changes.
  // Neither the actual descriptor nor any runtime/learner state is rewritten.
  assert.equal(a2TestDigest(comparison), originalDigest, descriptor.blockId + ': original descriptor outside explicitly reviewed deltas');
}

export function assertReviewedA2Preentry(block, current, source) {
  const reviewed = block.systemId === 'respiratory' && a2ReviewedPreentry[block.blockId];
  if (!reviewed) return false;
  assertReviewedA2Source(source, block.blockId);
  assert.equal(a2TestSha(JSON.stringify(block.kpRecords)), reviewed.originalKpRecordsSha256,
    block.blockId + ': complete original native KP records');
  // This existing preentry consumer has no Framework recovery for R2/R3 in
  // either old or current output. Do not invent a new model-consumption claim.
  assert.deepEqual(current.framework, reviewed.originalFrameworkMeta);
  const comparison = structuredClone(current);
  for (const change of reviewed.nonFrameworkChanges) {
    const keys = change.path.split('/');
    const actual = keys.reduce((owner, key) => owner?.[key], current);
    assert.equal(actual, change.after, block.blockId + ': actual reviewed MI-G14');
    const parent = keys.slice(0, -1).reduce((owner, key) => owner[key], comparison);
    parent[keys.at(-1)] = change.before;
  }
  // Both unrelated original A3 and B raw/preentry baselines were reproduced
  // from the original 4ad inputs before extracting these unchanged values.
  assert.equal(a2TestSha(JSON.stringify(comparison)), reviewed.originalPreentrySha256);
  assert.equal(a2TestDigest(comparison), reviewed.originalStablePreentrySha256);
  return true;
}
