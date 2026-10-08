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
