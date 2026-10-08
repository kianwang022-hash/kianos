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

// R4–R12: the exact named spans were independently reversed to the original
// Git bytes before recording these ranges. The current span and whole-file hashes
// are required; every byte outside them still matches the original protected hash.
// Five explicitly reviewed Core exceptions are also checked as full native records
// below. These are test comparison inputs, never runtime or learner normalization.
const a2AdditionalSourceReviews = {
  "respiratory-r04": {
    "originalCanonicalGitBlob": "4da385542a0c524e780922612de0cd0d7559c4ae",
    "originalPackagingSha256": "442d79cb6eef36fdbe300fa3a76ab9e08480ffb1cfc550df38575ee9a383339b",
    "reviewedCurrentSourceSha256": "2020e566bdb6baf1edd53ac23783fe59a33c23f22571cc1888e206dead24cbe6",
    "originalProtectedSourceSha256": "d984e87a571778e4c2d2a5ff6b07eb625aa3b846f13c72387d78cd5671299d39",
    "reviewedSpans": [
      {
        "label": "preamble-purpose",
        "marker": "REVIEWED_A2_SPAN_0",
        "start": 49,
        "end": 132,
        "sha256": "08aba1f89ad4449a2a277889b895e1dba05a9c248ac1915c8006bf7804114022"
      },
      {
        "label": "center-question",
        "marker": "REVIEWED_A2_SPAN_1",
        "start": 521,
        "end": 591,
        "sha256": "fc25cd075e64af982883f7cf7accf84b35fe7c485fd8c6cf65191fd352b5411f"
      },
      {
        "label": "model-sections-0-1-1a",
        "marker": "REVIEWED_A2_SPAN_2",
        "start": 595,
        "end": 5566,
        "sha256": "166e25838f40a767599f35f0404496db90ebb0347a4f9d1179d2722b408f6b6c"
      },
      {
        "label": "exit-handoff",
        "marker": "REVIEWED_A2_SPAN_3",
        "start": 19557,
        "end": 19640,
        "sha256": "fb32c0b2cf7da8f9eae9468da54c57e39682671ab37e601102bd1e1aa3ef303f"
      }
    ]
  },
  "respiratory-r05": {
    "originalCanonicalGitBlob": "f08a4e954cdc195cd599df5185d65aba550dfb07",
    "originalPackagingSha256": "7bb48fd1dfc5d4cd423d1dac539f0d6e81c48cff7da0529c093d4b3e45828abd",
    "reviewedCurrentSourceSha256": "720261e1c6e572097d2a00955ca6a7ea11164cbb3bb74885065cd35280500ef7",
    "originalProtectedSourceSha256": "a5436ebb283b255f4d1b949870b3bd140bfa622b2b21b9cfb02b3f4facf03bc6",
    "reviewedSpans": [
      {
        "label": "preamble-purpose",
        "marker": "REVIEWED_A2_SPAN_0",
        "start": 54,
        "end": 134,
        "sha256": "15384b379569a21a1f3d6b8cf1b00bbfe533a29e05db5e150aceee35f5c8eaa8"
      },
      {
        "label": "center-question",
        "marker": "REVIEWED_A2_SPAN_1",
        "start": 587,
        "end": 664,
        "sha256": "536787da7ccf49cf97e830bae751b9e4ef6fd0fb19e3f8c33bd3455660695b7f"
      },
      {
        "label": "model-sections-0-1-1a",
        "marker": "REVIEWED_A2_SPAN_2",
        "start": 668,
        "end": 5392,
        "sha256": "fe23c99948f20ba167c96750756b55301e7bdeba36531b613e82034e1ba00041"
      },
      {
        "label": "exit-q18",
        "marker": "REVIEWED_A2_SPAN_4",
        "start": 18384,
        "end": 18431,
        "sha256": "72cb73cdc310c90896ebc5d4fc6c3cd8695a11783703ac3828fce2c7f7c1842c"
      },
      {
        "label": "exit-handoff",
        "marker": "REVIEWED_A2_SPAN_3",
        "start": 18433,
        "end": 18513,
        "sha256": "581dfe19a8cc3bbd1ef9fa960c8fb5f0f5cfa0a35ac3e1f45c681b2b565ba8b8"
      }
    ]
  },
  "respiratory-r06": {
    "originalCanonicalGitBlob": "e618604921f5735fd6631a122fc00196cdf57ee1",
    "originalPackagingSha256": "fe906df99f144b537e541013b931437864b8e8433655a2e2e210fa559ef44f80",
    "reviewedCurrentSourceSha256": "568d39bd3467fbb4bbb20235cce0176ab3c896da88ab8ba5d13cb444bdae8ab1",
    "originalProtectedSourceSha256": "f312ace489a2d6e124966f2699f8ee5ad9379f13651aca61124efe43405f3654",
    "reviewedSpans": [
      {
        "label": "preamble-purpose",
        "marker": "REVIEWED_A2_SPAN_0",
        "start": 49,
        "end": 139,
        "sha256": "19beb4eef8825e11e74cc4272c1cc2d34af4474d5d304663db035cf4da4b5c68"
      },
      {
        "label": "model-sections-0-1-1a",
        "marker": "REVIEWED_A2_SPAN_1",
        "start": 605,
        "end": 4995,
        "sha256": "be89d17828fad1dcd1592fe34c656000bc88b9953f7443cbab17955b3f1a2cbc"
      },
      {
        "label": "mi-g05",
        "marker": "REVIEWED_A2_SPAN_3",
        "start": 5169,
        "end": 5211,
        "sha256": "3afe871cb558a5f9cfe382452b3274bbecc1efdf76d7f8f98c01ce688c4b626a"
      },
      {
        "label": "mi-g13",
        "marker": "REVIEWED_A2_SPAN_4",
        "start": 5437,
        "end": 5477,
        "sha256": "09687c549e6a88a4e612b4ad8bb579b3dd05671b587778d892909ddc224b2742"
      },
      {
        "label": "comparison-aspiration-treatment",
        "marker": "REVIEWED_A2_SPAN_5",
        "start": 14129,
        "end": 14209,
        "sha256": "020556c3cfc5993c13a7a799db7323518d5e180ba9d8fe094bcc72747418c427"
      },
      {
        "label": "exit-q16",
        "marker": "REVIEWED_A2_SPAN_6",
        "start": 15600,
        "end": 15638,
        "sha256": "04143d599f184efb260b6508219c04d5497f1b73ca18a7bf365479ca6486c2cb"
      },
      {
        "label": "exit-handoff",
        "marker": "REVIEWED_A2_SPAN_2",
        "start": 15710,
        "end": 15803,
        "sha256": "40e35399de7e20ecae0ceb6226abe9c76ccce5b72d55d04f52129b35d50d12a8"
      }
    ]
  },
  "respiratory-r07": {
    "originalCanonicalGitBlob": "19e95efa68cf98954179e9b93268ef4f09d8bb20",
    "originalPackagingSha256": "a6eec5ec1194459dfd2f4b2414ec8d808a10375780b8f0ff0938030319e2d1cc",
    "reviewedCurrentSourceSha256": "876f0d8e306e02706a0c4ed77c4afcfd3cc240378d8a38b4539274d9ee08f5bf",
    "originalProtectedSourceSha256": "a04e05033a128df3fc78b9fb5e735e4c43912e81105241eab3abcee5bde6a4f7",
    "reviewedSpans": [
      {
        "label": "File nature same-model restatement",
        "marker": "REVIEWED_A2_SPAN_1",
        "start": 50,
        "end": 144,
        "sha256": "cdd421a79971e3f45e5f3724dff7c1a805c25e77d97e0f4bc79779f7976c3aeb"
      },
      {
        "label": "§0 / Framework / §1A and original same-model entry",
        "marker": "REVIEWED_A2_SPAN_0",
        "start": 762,
        "end": 5508,
        "sha256": "c82377a5f0a1a9964688f1ba30b6c0e72c6c237082b73edd4061def530b97d45"
      },
      {
        "label": "MI-G11",
        "marker": "REVIEWED_A2_SPAN_2",
        "start": 5923,
        "end": 5983,
        "sha256": "40807b5e9270d5c23201379bb6281d7e4e4183dec7e2a9ca52534c50613a48f5"
      },
      {
        "label": "MI-G13",
        "marker": "REVIEWED_A2_SPAN_3",
        "start": 6003,
        "end": 6066,
        "sha256": "fb3de17cb82877f1ac8bb9ba7f8e8cc2534b24a621514fa27a4266aa6072c72c"
      },
      {
        "label": "MI-G15",
        "marker": "REVIEWED_A2_SPAN_4",
        "start": 6098,
        "end": 6160,
        "sha256": "fc52215ee08dfa9f9cd2d3fa146e198a415104347800d9894df496073457ae11"
      },
      {
        "label": "MI-G19",
        "marker": "REVIEWED_A2_SPAN_5",
        "start": 6233,
        "end": 6316,
        "sha256": "3a2e4386fca5105cc3dd4725f0413af129d3799a35b2a2c168a1b11dd41be013"
      },
      {
        "label": "Unit C same-model restatement",
        "marker": "REVIEWED_A2_SPAN_6",
        "start": 9663,
        "end": 9699,
        "sha256": "ac5547778ff451dbfbdeb5328d6246d1181bc2618cb9ca979c35d85cc40bf84f"
      },
      {
        "label": "Exit22",
        "marker": "REVIEWED_A2_SPAN_7",
        "start": 23220,
        "end": 23297,
        "sha256": "ef6f4ee529f19b642faabd93c73cec6ef23a7c0be268b8a5b50d27e2d115d2d0"
      }
    ]
  },
  "respiratory-r08": {
    "originalCanonicalGitBlob": "9e0b91de8ca970455246b67ca39d3510209a413d",
    "originalPackagingSha256": "043088529d1218e2d17a8aa771b876fd1601a0e333c1fb515a907251d1e5e03f",
    "reviewedCurrentSourceSha256": "4f8cd323c34602cacc2a1e0e2b2504dadeb0fd5bb311a1621fb5cb694a1164f3",
    "originalProtectedSourceSha256": "6a77e143c206dc01f80529c8cd5c22e7019304945d1dad9494bf48a5ad3a63d4",
    "reviewedSpans": [
      {
        "label": "File nature same-model restatement",
        "marker": "REVIEWED_A2_SPAN_1",
        "start": 83,
        "end": 156,
        "sha256": "73a3f9900c13fe83ef829dc55873134870b7765d65f903231d19c007476f1ef9"
      },
      {
        "label": "§0 / Framework / §1A and original same-model entry",
        "marker": "REVIEWED_A2_SPAN_0",
        "start": 715,
        "end": 4657,
        "sha256": "32c62f063e0d9cf7c11c6057e3cfed4d7f345171b328751a9b876b0197d8d941"
      },
      {
        "label": "MI-G7",
        "marker": "REVIEWED_A2_SPAN_2",
        "start": 5095,
        "end": 5157,
        "sha256": "957c59ad12ac28392451e8177195b8c58bd42866fd747aeccad61e8e66ffa45e"
      },
      {
        "label": "MI-G9",
        "marker": "REVIEWED_A2_SPAN_3",
        "start": 5195,
        "end": 5252,
        "sha256": "55e1d655e663cf1365784a13d3734eddeacf8a6ae8b2655a1834838d90a75000"
      },
      {
        "label": "KP08 single Core exception: imaging stage versus mandatory chronology",
        "marker": "REVIEWED_A2_SPAN_4",
        "start": 9639,
        "end": 9900,
        "sha256": "ba255aab64a2dd58b2be5630507ba45189ba182d56f8b9e56d4e8e76efbee8ff"
      },
      {
        "label": "§4 case reconstruction, table retained",
        "marker": "REVIEWED_A2_SPAN_5",
        "start": 13485,
        "end": 13838,
        "sha256": "05c3c02a8ff4885eaca407d6a108b58813ddcd8f6a9e5014bcba64e159a679b1"
      },
      {
        "label": "Exit8",
        "marker": "REVIEWED_A2_SPAN_6",
        "start": 15906,
        "end": 15959,
        "sha256": "14923074da357570d5e9830ec87d1c7af49af82958201ec79b0820018204d0ed"
      }
    ]
  },
  "respiratory-r09": {
    "originalCanonicalGitBlob": "c546c3c6f2cde391da35034f64c97c0829100c0c",
    "originalPackagingSha256": "5571204e9d4c855eced490fdfb97e170900c736f5757a7a3c007aee2cb6a7897",
    "reviewedCurrentSourceSha256": "1b580e40a1474b6ad9a183367df8b8efcab1e576375c55152c6da308e8346cb8",
    "originalProtectedSourceSha256": "86407c9fbb9147e7da7dada12f8f38e80abad8ebd2401b634df91dbcecc362ec",
    "reviewedSpans": [
      {
        "label": "File nature same-model restatement",
        "marker": "REVIEWED_A2_SPAN_1",
        "start": 94,
        "end": 171,
        "sha256": "0bf110df2967f155a51f1c5e40919ffb87d4da43c8ffc01256f0794dbf7ce85e"
      },
      {
        "label": "§0 / Framework / §1A and original same-model entry",
        "marker": "REVIEWED_A2_SPAN_0",
        "start": 836,
        "end": 5415,
        "sha256": "bcdd2ab9e2a3f6428a82050a72a3adbbd211c096c32f637dfd5f022f69243211"
      },
      {
        "label": "Unit C independent IPAH scope",
        "marker": "REVIEWED_A2_SPAN_2",
        "start": 11124,
        "end": 11153,
        "sha256": "53c11f1778f08204477b2b02cd8af6ffe31daf18d0335a1b05ff821945d9366a"
      },
      {
        "label": "§4A-C same-model clinical reconstruction",
        "marker": "REVIEWED_A2_SPAN_3",
        "start": 16423,
        "end": 17180,
        "sha256": "44a540d92599f80dcaabd5c208f5a6a552b3741d464cfaa6623855965f15ebfd"
      },
      {
        "label": "Exit7",
        "marker": "REVIEWED_A2_SPAN_4",
        "start": 19409,
        "end": 19460,
        "sha256": "f9c02a82d5b93567fbbd6259a34af9eea9bcf90e675c9f3cb2fb6d8aa89ec19f"
      }
    ]
  },
  "respiratory-r10": {
    "originalCanonicalGitBlob": "5dd3fd247775b510276f0664dc4b279aed28da57",
    "originalPackagingSha256": "bd647be75d38d3625a0c19b488121c709c342c75667e076abea5f2af2dce1fe8",
    "reviewedCurrentSourceSha256": "c2da9207a73fa56a17371e76b36045be80ab48ce36a43717efb56862de9de7d0",
    "originalProtectedSourceSha256": "130b7cc942ef78c91917b650ae31fc41ee99627fcf6c43b48817142360890e4e",
    "reviewedSpans": [
      {
        "label": "中心问题",
        "marker": "REVIEWED_A2_SPAN_0",
        "start": 1017,
        "end": 1108,
        "sha256": "9fb825d199a97e7eb2dda26c6c8720963114155dd12bc458b7355b94f6a3353f"
      },
      {
        "label": "§0统一机制模型",
        "marker": "REVIEWED_A2_SPAN_1",
        "start": 1112,
        "end": 1618,
        "sha256": "e595c30c5e4cd55a03a467462de8ca365c3834c2191730e60b7bc82acaea5654"
      },
      {
        "label": "第一轮模型回建",
        "marker": "REVIEWED_A2_SPAN_2",
        "start": 1726,
        "end": 1788,
        "sha256": "0b5600acc97185a689338200626186c29e41b846e041ead600249028194dcc29"
      },
      {
        "label": "§2 Framework",
        "marker": "REVIEWED_A2_SPAN_3",
        "start": 2023,
        "end": 2712,
        "sha256": "07f7a11bdfc0735f95e31edb75998b34dc18117628ba3fc7d012d09c4194469c"
      },
      {
        "label": "§1A 自然模型",
        "marker": "REVIEWED_A2_SPAN_4",
        "start": 2712,
        "end": 6293,
        "sha256": "08fa7b38dba9124b37ff469ac1c2048fc496814b40588d7a80d1387c820db427"
      },
      {
        "label": "MI-G7 经批准补积液区域条件",
        "marker": "REVIEWED_A2_SPAN_10",
        "start": 6569,
        "end": 6635,
        "sha256": "80fa0fc70b6a7c83dae1f4c264816813dd3c0114500320b705341e2705c98ba6"
      },
      {
        "label": "MI-G15",
        "marker": "REVIEWED_A2_SPAN_5",
        "start": 6933,
        "end": 7005,
        "sha256": "e7928a0f99a1da5fe1e803998deea039b11f5d411e1c0bc0a19e2b670d1a8fbe"
      },
      {
        "label": "MI-G18",
        "marker": "REVIEWED_A2_SPAN_6",
        "start": 7086,
        "end": 7160,
        "sha256": "402b877b7c8b245107a8ce012250da0d48234e370be28476220fdd15042c5604"
      },
      {
        "label": "MI-G19",
        "marker": "REVIEWED_A2_SPAN_7",
        "start": 7161,
        "end": 7234,
        "sha256": "cb55b358a2defac3774002ab3ea0f334735c4b5c4b519fce80734af24c11e009"
      },
      {
        "label": "MI-G21",
        "marker": "REVIEWED_A2_SPAN_8",
        "start": 7262,
        "end": 7330,
        "sha256": "dd18ba2ef65f6da4eb7ac9e44ef0bd053962d3926d54b2bbd980c7d105828897"
      },
      {
        "label": "respiratory-r10-kp06 explicit Core exception",
        "marker": "REVIEWED_A2_SPAN_13",
        "start": 11030,
        "end": 11248,
        "sha256": "125c3c0c2656d07fc8c4a7346c6ce7d93d1ae0c4e036aa78f1748bb287ab4fea"
      },
      {
        "label": "respiratory-r10-kp18 explicit Core exception",
        "marker": "REVIEWED_A2_SPAN_14",
        "start": 16069,
        "end": 16323,
        "sha256": "4438010570890cab25b3d495001feb9cd0996e0b3f816e2a284efd33392a38ea"
      },
      {
        "label": "§4D 稳定性前置",
        "marker": "REVIEWED_A2_SPAN_9",
        "start": 19606,
        "end": 20009,
        "sha256": "668741f766ceb62b0b4dc59cf8d625b04e8dd6b76b4397128efd81169180a8f9"
      },
      {
        "label": "Exit6 经批准补积液区域条件",
        "marker": "REVIEWED_A2_SPAN_11",
        "start": 22619,
        "end": 22676,
        "sha256": "6168c8be3ee50941e4ef952c357ff63210ff97d4cd08699a9d2312e05b5a588a"
      },
      {
        "label": "Exit模型回建",
        "marker": "REVIEWED_A2_SPAN_12",
        "start": 23141,
        "end": 23223,
        "sha256": "31ba3af899c1f5f0f51ffe506a48cb7b24ebac5c256037d59c75d189650c8481"
      }
    ]
  },
  "respiratory-r11": {
    "originalCanonicalGitBlob": "dc7c8e10205e9c9eef7f11b1a15ac4f98d49aaaa",
    "originalPackagingSha256": "5a277376df76b1c837b75eccdd07fb07eb9f5f5393b7ea47687b796d5920431e",
    "reviewedCurrentSourceSha256": "eea5130db506f8bb0618f32583601be2f1d0eb269d682c08b4e596669dd4ce5e",
    "originalProtectedSourceSha256": "ad22faafcdc1702957e917939927817d8d9e8134fc4601c50d89e7d96b1f7270",
    "reviewedSpans": [
      {
        "label": "文件性质模型总述",
        "marker": "REVIEWED_A2_SPAN_0",
        "start": 266,
        "end": 373,
        "sha256": "9574cfbacb602e317be1cecb6d1638431f3291e714dfd4d44a293e75ea5cb519"
      },
      {
        "label": "中心问题",
        "marker": "REVIEWED_A2_SPAN_1",
        "start": 1064,
        "end": 1144,
        "sha256": "3601f8576d590630a9b98eaeb774da05d8bc2ea99df249683168aa242e92605f"
      },
      {
        "label": "§0同一模型",
        "marker": "REVIEWED_A2_SPAN_2",
        "start": 1148,
        "end": 1685,
        "sha256": "ef60bc3f56534f9e8f48b0b45455ac35bf536659238d6c7b7e8c700e014c7db0"
      },
      {
        "label": "第一轮模型回建",
        "marker": "REVIEWED_A2_SPAN_3",
        "start": 1798,
        "end": 1858,
        "sha256": "4a8915da1f65adec084671dc180ec72170bd44b642d366d84c264473c3f07554"
      },
      {
        "label": "第一轮模型概括",
        "marker": "REVIEWED_A2_SPAN_4",
        "start": 1982,
        "end": 2079,
        "sha256": "2b13ae5f39e1692899f1655ff44726d82429126e6ccd8fdf94af811b78584053"
      },
      {
        "label": "§2 Framework",
        "marker": "REVIEWED_A2_SPAN_5",
        "start": 2086,
        "end": 2958,
        "sha256": "167e69c5e575b3d05468f5ea59023e46db28266a6dbc4f2667e0c98ec1f63359"
      },
      {
        "label": "§1A 自然模型",
        "marker": "REVIEWED_A2_SPAN_6",
        "start": 2958,
        "end": 6892,
        "sha256": "4c65871eab52d585e7aa8eeb1ec5bc53756e1ce0c3a96e13abf69b991acea5ef"
      },
      {
        "label": "MI-G14",
        "marker": "REVIEWED_A2_SPAN_7",
        "start": 7511,
        "end": 7617,
        "sha256": "98d1b27642e98f60dabec4afd8a3c86f38f3038d1ea9c48e48b7e1f78c3ece96"
      },
      {
        "label": "MI-G15",
        "marker": "REVIEWED_A2_SPAN_8",
        "start": 7618,
        "end": 7725,
        "sha256": "30eb9e0a81414f3340590ae759dc656cd4b84f7a516fad3228e8608ae811d7fb"
      },
      {
        "label": "respiratory-r11-kp17 explicit Core exception",
        "marker": "REVIEWED_A2_SPAN_13",
        "start": 16843,
        "end": 17288,
        "sha256": "3bca246360525d155c61c13aee87bcb356a91113086082833c77e5da9ed9312b"
      },
      {
        "label": "§4B 并行受累证据",
        "marker": "REVIEWED_A2_SPAN_9",
        "start": 20490,
        "end": 20664,
        "sha256": "3bbd0969be63439f754f53925ed8c0c16ddc5e7cd5e9bd768064b1a6b8a3e24a"
      },
      {
        "label": "§4D 阴性边界",
        "marker": "REVIEWED_A2_SPAN_10",
        "start": 20854,
        "end": 20925,
        "sha256": "3108ad02ba04ac090d289b79fe9df8ab945401c9d3da916765fc7dfdc16c96a7"
      },
      {
        "label": "Exit22",
        "marker": "REVIEWED_A2_SPAN_11",
        "start": 24072,
        "end": 24151,
        "sha256": "a8bc9eba190b688becf2b2e1fbac5f61367402a93d12e2a668bcebacda080201"
      },
      {
        "label": "Exit模型回建",
        "marker": "REVIEWED_A2_SPAN_12",
        "start": 24153,
        "end": 24250,
        "sha256": "1417b6160cf3ee64f001e76da094deb94806d2c2a9fe5e0fda14ce55d193245d"
      }
    ]
  },
  "respiratory-r12": {
    "originalCanonicalGitBlob": "d84b136358035e7a5ff3b3a8c6291cec5103c62b",
    "originalPackagingSha256": "328ce2c9027a250d462289ecc2930fa5365efe3a3727dc04f1f1d6ac45ccccc1",
    "reviewedCurrentSourceSha256": "1cefb8bf07253b96173ad79b7a929c266a54b9c19ec9e72487a9a973538b8008",
    "originalProtectedSourceSha256": "4ef626ae33271c0d99fbc383bee2cc93b17b4d5e46db0de41c6631b2b1b3e49d",
    "reviewedSpans": [
      {
        "label": "文件性质模型总述",
        "marker": "REVIEWED_A2_SPAN_0",
        "start": 238,
        "end": 351,
        "sha256": "f86117fb63cd8467d2da550f9e7fe1d4c2e6bf732ec9ef82cac0d942406a8e6c"
      },
      {
        "label": "中心问题",
        "marker": "REVIEWED_A2_SPAN_1",
        "start": 934,
        "end": 1020,
        "sha256": "f7cf9342a19d495e13f7ffbe4094512eb3487735d11a86c50a9ec66d6a9367b1"
      },
      {
        "label": "§0同一模型",
        "marker": "REVIEWED_A2_SPAN_2",
        "start": 1024,
        "end": 1742,
        "sha256": "58ac6c0aab00ad1027ab4aa998a9bf671f297cf5229c60a7785eb6b206c96e13"
      },
      {
        "label": "§1 Framework; §1 Framework两损伤后的共同后果层级",
        "marker": "REVIEWED_A2_SPAN_3",
        "start": 1742,
        "end": 2855,
        "sha256": "29cb11be308687535df565896da43510bf17807cd4987ac37d1121dd1b6d6629"
      },
      {
        "label": "§1A 自然模型; 独立交叉：右心支显式负荷与储备条件（仅自然模型）",
        "marker": "REVIEWED_A2_SPAN_4",
        "start": 2855,
        "end": 6994,
        "sha256": "328b769f10a0efeea4d100e14bc6e400dc6cc60a147c72458e2ad3b06a151f7a"
      },
      {
        "label": "MI-G6",
        "marker": "REVIEWED_A2_SPAN_5",
        "start": 7247,
        "end": 7333,
        "sha256": "e9b31d71198ba4a777b57423d80b3aadd2fa381dd106d0cf48975e341bdf994b"
      },
      {
        "label": "MI-G12",
        "marker": "REVIEWED_A2_SPAN_6",
        "start": 7546,
        "end": 7612,
        "sha256": "efcd37d8af26a8f1117e4d09e01c9f22a62ced590b57d3f44a0823c9b9af8e92"
      },
      {
        "label": "respiratory-r12-kp18 explicit Core exception",
        "marker": "REVIEWED_A2_SPAN_10",
        "start": 15509,
        "end": 16365,
        "sha256": "50be61aa0b44899294fd370f9b932060c23302c2631148a197f769249d066f08"
      },
      {
        "label": "Exit9",
        "marker": "REVIEWED_A2_SPAN_7",
        "start": 22424,
        "end": 22482,
        "sha256": "1c46369b0ad244555a80ed3f360766d1c6195f805238155b2c995fdeba1b0a78"
      },
      {
        "label": "Exit12",
        "marker": "REVIEWED_A2_SPAN_8",
        "start": 22557,
        "end": 22616,
        "sha256": "65a62a1abbb73de2bec057e6ef56d9f83d184e56ae07cb0003b3e29704a76e57"
      },
      {
        "label": "Exit22",
        "marker": "REVIEWED_A2_SPAN_9",
        "start": 22922,
        "end": 22985,
        "sha256": "c9d727d5825c66b8c06d416299e6264a69b968f801f4a459acd8b0d2fd39c6d1"
      }
    ]
  }
};

const a2ReviewedCoreWitnessChanges = [
  {
    "id": "a2-r08-lg03-precision",
    "refIndex": 1,
    "kpId": "respiratory-r08-kp08",
    "before": "e9c78cc0ab38ced51753ac50fc464615650a9e4100f9786811950cde03a2bc28",
    "after": "f96c9fa32769888a67fc4f0a18d5373687eca8fd80221bb40c72ce9dfbe48cbf"
  },
  {
    "id": "a2-r10-kp16-precision",
    "refIndex": 1,
    "kpId": "respiratory-r10-kp18",
    "before": "5d133c0cabd102293f797bb20e9bef58c3aebd954e421716fa53a7713e03e4a8",
    "after": "4438010570890cab25b3d495001feb9cd0996e0b3f816e2a284efd33392a38ea"
  },
  {
    "id": "a2-r10-kp19-precision",
    "refIndex": 3,
    "kpId": "respiratory-r10-kp18",
    "before": "5d133c0cabd102293f797bb20e9bef58c3aebd954e421716fa53a7713e03e4a8",
    "after": "4438010570890cab25b3d495001feb9cd0996e0b3f816e2a284efd33392a38ea"
  }
];

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
  },
  {
    "path": "blocks/respiratory-r04/first_pass_focus",
    "before": "把哮喘理解为炎症/高反应底物上的可变气流阻塞，并把‘发作—证据—缓解—长期控制’串起来。",
    "after": "把炎症与神经调节参与的高反应气道、触发后的可变阻塞和观察证据接入同一模型，持续评估当前危险，分清急性处理与长期控制反馈。"
  },
  {
    "path": "blocks/respiratory-r04/recall_spine",
    "before": "慢性炎症 → 高反应 → 可变阻塞 → 可逆/变异证据 → 缓解+控制 → 危重通气",
    "after": "从入口评当前危险；炎症/上皮损伤与神经调节参与高反应气道，触发后痉挛/水肿/黏液造成可变阻塞；症状与肺功能读取结果；急性缓解、抗炎和支持按失效环节并行，稳定时评控制与未来风险。"
  },
  {
    "path": "blocks/respiratory-r05/first_pass_focus",
    "before": "先定位感染发生的空间和获得环境，再用病原线索、严重度与证据决定病原模型和处理方向。",
    "after": "获得环境与入口提供病原先验；按病变空间解释体征和气体交换后果，合读病原证据与严重度，并从入口持续识别危重情况。"
  },
  {
    "path": "blocks/respiratory-r05/recall_spine",
    "before": "获得环境 → 病变空间 → 病原线索/证据 → 严重度 → 并发去向",
    "after": "感染进入相应肺部空间 → 炎症、充填或组织损伤；获得环境/宿主、病变空间与病原证据并读；严重度从入口持续评估 → 对应抗感染、支持及并发症处理。"
  },
  {
    "path": "blocks/respiratory-r06/first_pass_focus",
    "before": "把支扩和肺脓肿都放回‘结构异常—分泌物/感染—引流失败’这条链，重点学定位、危险点和处理。",
    "after": "把支气管结构破坏后的潴痰—感染—再损伤反馈，与肺实质化脓坏死形成脓腔的不同入口并行比较，按来源、清除/引流和咯血危险选择处理重点。"
  },
  {
    "path": "blocks/respiratory-r06/recall_spine",
    "before": "结构层级 → 支扩三股力/痰液循环 → 肺脓肿三入口 → 抗感染+引流+危险处理",
    "after": "支气管壁破坏 → 清除下降/潴痰 → 感染 → 再损伤；肺脓肿由误吸、血源或继发入口进入实质化脓坏死/脓腔分支；清痰、感染加重与危险咯血按当前情境处理。"
  },
  {
    "path": "blocks/respiratory-r07/first_pass_focus",
    "before": "从结核菌—细胞免疫—肉芽肿/干酪坏死出发，理解原发/继发/HIV宿主状态怎样决定临床类型、传播和治疗。",
    "after": "感染与宿主细胞免疫共同影响结核的局限、坏死和播散；以原发/继发/HIV背景理解疾病谱，分别判断活动、传染和治疗条件。"
  },
  {
    "path": "blocks/respiratory-r07/recall_spine",
    "before": "感染免疫 → 肉芽肿/干酪 → 原发/继发/HIV → 六型/播散 → 活动/传染 → 化疗",
    "after": "结核感染与宿主免疫相互作用 → 局限/肉芽肿与坏死/空洞等可并存结果；原发/继发/HIV背景和不同播散途径解释疾病谱；影像、免疫检测、菌学分别提供证据 → 按活动、传染、药敏及宿主条件处理。"
  },
  {
    "path": "blocks/respiratory-r07/logic_groups/respiratory-r07-lg06/closure",
    "before": "面对治疗场景时，能先守住联合、规律、足量、全程等原则，再处理具体方案差异。",
    "after": "面对治疗场景时，能先守住联合、规律、适量、全程等原则，再处理具体方案差异。"
  },
  {
    "path": "blocks/respiratory-r08/recall_spine",
    "before": "限制/弥散低氧 → 临床入口 → HRCT/BALF/组织 → 疾病分流",
    "after": "肺实质不同分布与结构损伤 → 弹性负荷、弥散及气血匹配并行变化；症状、肺功能与影像读取结果 → 按宿主/暴露及相应证据分流；支持与病因处理回到对应环节。"
  },
  {
    "path": "blocks/respiratory-r09/recall_spine",
    "before": "PVR慢升→肥厚；急阻塞→扩张/休克；证据→抗凝/溶栓",
    "after": "肺血管阻力慢性升高 → 肺动脉压力/右室后负荷改变 → 代偿重构，失代偿时右心衰；PE急性阻塞按负荷可致右室扩张/灌注不足；依据稳定性、可获得的诊断证据和出血风险/禁忌，决定抗凝与紧急再灌注的适用性及配合时机。"
  },
  {
    "path": "blocks/respiratory-r10/first_pass_focus",
    "before": "把胸腔里的液体/气体/血液和胸壁失稳都放回‘压力—肺扩张—纵隔—循环’坐标，再决定引流和急救。",
    "after": "把胸膜腔占位/压力和胸壁损伤作为不同入口，区分肺扩张受限、回心受阻与出血失容量；持续评估呼吸和循环危险，选择对应取证、减压、引流或手术。"
  },
  {
    "path": "blocks/respiratory-r10/recall_spine",
    "before": "内容物 → 压力/纵隔 → 胸壁稳定 → 血流动力学 → 急救动作",
    "after": "胸膜液/气占位或压力升高 → 肺扩张与回心受影响；血胸另可失容量，胸壁损伤另可破坏通气力学；先评气道/呼吸/循环危险，危急减压、止血或支持与必要取证并行；稳定后完善病因分流。"
  },
  {
    "path": "blocks/respiratory-r11/recall_spine",
    "before": "位置 → 组织 → 扩展 → 证据 → TNM/可切除性 → 治疗；纵隔先分区",
    "after": "位置与组织学共同解释局部、远处和副癌表现；按问题选择影像与取材 → 组织、分期及分子证据；范围、技术可切除性与功能耐受共同决定治疗；纵隔保留独立空间定位。"
  },
  {
    "path": "blocks/respiratory-r11/logic_groups/respiratory-r11-lg03/closure",
    "before": "能把副癌表现和直接肿瘤压迫/转移区分；遇到‘最常见’单选时答小细胞癌，同时不误解为只有小细胞癌可导致。",
    "after": "能把副癌表现和直接肿瘤压迫/转移区分；遇到 2026 N129 原题的‘最常见’单选时答小细胞癌，同时不误解为只有小细胞癌可导致。"
  },
  {
    "path": "blocks/respiratory-r11/logic_groups/respiratory-r11-lg04/goal",
    "before": "把筛查、影像、取材、PET 和基因检测按‘发现—定性—分期—分子分层’排序。",
    "after": "区分筛查、影像、取材、PET 和基因检测所回答的发现、组织确诊、分期与靶点问题，按当前场景选择检查，不预设每例必经同一顺序。"
  },
  {
    "path": "blocks/respiratory-r11/logic_groups/respiratory-r11-lg05/closure",
    "before": "能从组织学和分期先判断是否可能手术，再进入靶向/放化疗等治疗层级。",
    "after": "能合读组织学、分期、技术可切除性和功能耐受，判断手术适合性，并按相应条件选择靶向、放化疗等方案。"
  },
  {
    "path": "blocks/respiratory-r12/recall_spine",
    "before": "氧合失败 vs 通气失败 → 证据 → 支持 → 防治疗伤害",
    "after": "先评生命危险；氧合与通气失败可并存，ARDS是屏障损伤子支；血气/影像按定义与采样条件取证；支持回作用于有效通气、分流和肺泡开闭，同时兼顾肺损伤及回心/循环。"
  },
  {
    "path": "blocks/respiratory-r12/logic_groups/respiratory-r12-lg02/closure",
    "before": "给出血气、影像和心脏证据时，能完成 ARDS 严重度与心源性肺水肿的关键分流。",
    "after": "合读血气、影像与心脏证据判断是否满足既有 ARDS 定义，再在相应时相和呼吸支持条件下分级；区分并允许与心源性肺水肿并存。"
  },
  {
    "path": "blocks/respiratory-r12/logic_groups/respiratory-r12-lg04/closure",
    "before": "看到 PaO₂/PaCO₂ 时能先判Ⅰ型还是Ⅱ型，再决定氧疗/通气支持方向，避免机械套规则。",
    "after": "先核采样/供氧情境与呼衰条件，再按实际血气辨别Ⅰ/Ⅱ型及可能并存机制，按当前危险选择氧疗/通气支持，避免机械套规则。"
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
  },
  {
    "id": "a2-r05-lg01-precision",
    "before": "2c96d6ea1624ceb1cb5e5552598c212854f613b03a855a0960078eab0836bb51",
    "after": "60464f79f07b1b52af6ac3a22ee27c2f2e79060b5f4d8d9d6673939048a115ac"
  },
  {
    "id": "a2-r05-lg03-precision",
    "before": "8251b079070ee243ca6e463a017a1b64483ea7f01e0afcc158fe76c8829001a4",
    "after": "bfabb44818d692f55d568b72b6de8a479c4b25d7d1c41f3f1f93cdede09df67a"
  },
  {
    "id": "a2-r06-lg02-precision",
    "before": "ee4dbc04970b6a16a0b22a1691b9eb753bbf99d89c98bb20d732831dda7f59b0",
    "after": "4d70b27d68ab88e28502b868beec6044f36c043c0077857ab8b738e575539164"
  },
  {
    "id": "a2-r06-lg03-precision",
    "before": "b0873a9d0db68f52a564f3a173e34b204deb0ba4dcad2d7e000e14e014c557e4",
    "after": "cf93d0099a36bb1f2c13fa90f03ac171fc471faf8b1ea24a9c1715cd2415c81b"
  },
  {
    "id": "a2-r08-lg03-precision",
    "before": "36cf7ff6aceedf8f217a5954be6adb2e7e7244e6ed6e68e0b428f2313b51408e",
    "after": "a2fa024c3c7d53603172293fe08e0e2475594f115491b8819e073f12f6cd52ce"
  },
  {
    "id": "a2-r09-lg05-precision",
    "before": "ed7bdb316e78487744922df98e4145b6125c4f929118bd99820303a0cfd69373",
    "after": "6027efe47b16f236241aca21dd44f143daa0eeb8ccbe544dcb3a2481298e930d"
  },
  {
    "id": "a2-r10-kp02-precision",
    "before": "14d2d1d7ce9786fa15a6b0fe6ea65ba6f6cc50cbdaa230e6f5e26590797dd747",
    "after": "0ffd48068d61c22c0e8f681ca2d1570d920fd7ada67af2c52e0f15a0cb023e29"
  },
  {
    "id": "a2-r10-kp04-precision",
    "before": "315aaa289a5377e532e14b60ac35e1fe6407c196dde30496040c58a17773072e",
    "after": "f1edc5ee8f75cd03c2f54552bf5edf82b20a73c5508b2ae6bd209206e9fe2113"
  },
  {
    "id": "a2-r10-kp08-precision",
    "before": "62a755aad0f2906cdefd4b176f492051e7ccdb1bf3ef79d577020372f44255e8",
    "after": "bc7cc1391892f97ee0f947b16e5575a2198c95347552a8a4653f2787cf3c39bd"
  },
  {
    "id": "a2-r10-kp16-precision",
    "before": "33f91bb4933579ebaeaae317c23795baaafb7d46179f85f7a1125a7bc8c49ced",
    "after": "e0a9de3e9e43a87a4e412c0012e6f61bd744c409c59c736a3b6c32159189736c"
  },
  {
    "id": "a2-r10-kp19-precision",
    "before": "cfe881cc74701649f506f31761d5724c53719ccee800257e2afac77c38329e13",
    "after": "e082686a3dc7aa21044885568571488a97871f681d49884e14aa26c8c326d75d"
  },
  {
    "id": "a2-r11-kp21-precision",
    "before": "5f77f723e264a70a2e7f8a91b5ce2124cb4c6477681a891a079c675a3dc937c0",
    "after": "66b9b0099aa8b8b3666f565c0feef305f876a2ab64dc53a649961753d5d48c7b"
  },
  {
    "id": "a2-r11-kp22-precision",
    "before": "09ee6b5334ce1c3ad61e0cf3b68b271e887c27d8c21b2f48fd68e4d15d5a38b1",
    "after": "c3441157ed7dca77ccb9f401b0d0fb72737115c0d01ab3e5443afd17116f7737"
  },
  {
    "id": "a2-r11-lg05-precision",
    "before": "e1cae7dd74b5a26f82347eb80491e5596f6d95dfe0c071e3f3281e979c4b534c",
    "after": "8569ee4e98c31b4205c1f1d8b3864dff1f1e1fd97f8d40164df1c1702346876f"
  },
  {
    "id": "a2-r12-kp08-precision",
    "before": "b140c867cafae85ebe8198984cf328f29ccd7a906c60284ed7d024817623151f",
    "after": "0d7112dc9cd9ef0a93ee976c96a233936e41a2fdafbfbd6f0998e78b54e0d051"
  },
  {
    "id": "a2-r12-kp09-precision",
    "before": "20331726f5e6f07477a26968effc20342a86dc8d602346bdcd1074bc406e98c5",
    "after": "8cfdf7fe5aa48962d5139418e9565278b0137c433257a5605ff128351196ed28"
  },
  {
    "id": "a2-r12-kp12-precision",
    "before": "67f97c86e2059fd8543f58ffc310aeb4eecabe4d01651c3c2a7e8b99588a0e42",
    "after": "3169335cfd2319eaf7b9f68adcfff19949db97b934b4cf5ebb946bc790780b8a"
  },
  {
    "id": "a2-r12-kp13-precision",
    "before": "73eb65894c6b114b856c8e9dd6422113a4824525f658dba30467a5815811ed19",
    "after": "daeb381ef32a85110c660d0249b373ceaa8959843a2960159eb4bdf31526d64b"
  },
  {
    "id": "a2-r12-kp16-precision",
    "before": "8b1d057bf9a43fc2a1ebf06586f288c939e6ac382ef2ce23a5c506bdb84babe6",
    "after": "53c0cfb706bfbfe3e73bcd35586843ae42c55c2af2ac1b0145c914ceb575bc97"
  },
  {
    "id": "a2-r12-kp17-precision",
    "before": "afbd7b5249d455f98406d545763dee0d1cc8f277b59881c8537025604f6810ce",
    "after": "d778635831c1f50c3d6af5197db20ac93bb6b99addaa758f8fee6604a4419688"
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
  ],
  "respiratory-r05": [
    {
      "path": "revisionWitness/groups/respiratory-r05-lg01",
      "before": "d86251049d12f9eafcc931c004dd84bb6380ee68e02e329aa028ce3d933f7b77",
      "after": "2e1ebc93fa54b747880b5b49ee59ce3aa6dcce77d90cfbc3d0d2bf8491329c8c"
    },
    {
      "path": "revisionWitness/groups/respiratory-r05-lg03",
      "before": "be6db0760b662294c02f96e88301db734d03d27405fdefbb6e2b98fdd1ad4536",
      "after": "8dd719a08a82c993583e0f7e29279f21eadab00ace080a2bb6cdc9cc8e421fad"
    },
    {
      "path": "revisionWitness/block",
      "before": "d15bfecdbefe115e0dbf93471b3085b652a8416cdd90cc5871a927033caac88b",
      "after": "921994db1007883d10f7989c7babdf227510a298f7dbf4d8430b80b6b9d2bb5e"
    },
    {
      "path": "precisionCards/0/semanticRevision",
      "before": "d86251049d12f9eafcc931c004dd84bb6380ee68e02e329aa028ce3d933f7b77",
      "after": "2e1ebc93fa54b747880b5b49ee59ce3aa6dcce77d90cfbc3d0d2bf8491329c8c"
    },
    {
      "path": "precisionCards/1/semanticRevision",
      "before": "be6db0760b662294c02f96e88301db734d03d27405fdefbb6e2b98fdd1ad4536",
      "after": "8dd719a08a82c993583e0f7e29279f21eadab00ace080a2bb6cdc9cc8e421fad"
    }
  ],
  "respiratory-r06": [
    {
      "path": "revisionWitness/groups/respiratory-r06-lg02",
      "before": "42d45153a9426f5e53b5807ef27e01aaee5add16eeb1eaae718bc8d070177401",
      "after": "4a660947e7c20c5b08f2b30baaa82a17f8a00f5ca2c0fee733ae05b4a9f31089"
    },
    {
      "path": "revisionWitness/groups/respiratory-r06-lg03",
      "before": "b040b8074a174aeba29e810bc283cb62a8d6dda1d781414ac5eb23d296928c9d",
      "after": "9098ae31da0da8d5752ebc47a8c1de1612a268e140206e707eddf85b02a8d0c3"
    },
    {
      "path": "revisionWitness/block",
      "before": "1957a2805840014272f0fa35a665088dbe2d3522ad521a3687142daf58a3d055",
      "after": "2ea1555a36db495b85a44613b30835c5c8b2cd58344903846451687bc4983ab8"
    },
    {
      "path": "precisionCards/0/semanticRevision",
      "before": "42d45153a9426f5e53b5807ef27e01aaee5add16eeb1eaae718bc8d070177401",
      "after": "4a660947e7c20c5b08f2b30baaa82a17f8a00f5ca2c0fee733ae05b4a9f31089"
    },
    {
      "path": "precisionCards/1/semanticRevision",
      "before": "b040b8074a174aeba29e810bc283cb62a8d6dda1d781414ac5eb23d296928c9d",
      "after": "9098ae31da0da8d5752ebc47a8c1de1612a268e140206e707eddf85b02a8d0c3"
    }
  ],
  "respiratory-r08": [
    {
      "path": "revisionWitness/kps/respiratory-r08-kp08",
      "before": "ffc34ed7abc21faee9bfa2239b73acf588da77ba860e2436a0e7eecc6fcd4abb",
      "after": "05abc4f79da8759dbe4e5a6038b4f0cde6074855d1137ea61473eee575f733ae"
    },
    {
      "path": "revisionWitness/groups/respiratory-r08-lg03",
      "before": "9efb3746d5c15bf50d457a5fe6675f81ca8b4f7071451e9e1f260caa5a3903c0",
      "after": "64d136e0b87cc54a527c3146f4977b2f0b9ab0bf6016475e967c5b599ecfcc02"
    },
    {
      "path": "revisionWitness/block",
      "before": "aaa2f312376b7a58021457f92aab6ea1ed3088d85f4f660ca41a7f8d7e675115",
      "after": "a48349d5e094b0561824d160c8ebcdfd56cd2030d37d5f7b37d6626d3ded7b6f"
    },
    {
      "path": "precisionCards/0/semanticRevision",
      "before": "9efb3746d5c15bf50d457a5fe6675f81ca8b4f7071451e9e1f260caa5a3903c0",
      "after": "64d136e0b87cc54a527c3146f4977b2f0b9ab0bf6016475e967c5b599ecfcc02"
    }
  ],
  "respiratory-r09": [
    {
      "path": "revisionWitness/groups/respiratory-r09-lg05",
      "before": "85b47b2de5302ef76d56eeaa3a3501da35572090a26008cf22b2efc1fbc0e514",
      "after": "d54c6f3a15b83b00ffb76017d4df255d5da3faa8c23db95e1b041348516f213d"
    },
    {
      "path": "revisionWitness/block",
      "before": "5ed4b31f078f53c2c12c0bfa8d7bb21f0ce3622d45bccd86b7fb155eea5e9ca9",
      "after": "4326c8b8eed714e28004848c3b49a060e2813b6545b21446fa9cde38c1ad021b"
    },
    {
      "path": "precisionCards/0/semanticRevision",
      "before": "85b47b2de5302ef76d56eeaa3a3501da35572090a26008cf22b2efc1fbc0e514",
      "after": "d54c6f3a15b83b00ffb76017d4df255d5da3faa8c23db95e1b041348516f213d"
    }
  ],
  "respiratory-r10": [
    {
      "path": "revisionWitness/kps/respiratory-r10-kp02",
      "before": "fc956efcc1cd4ddca36c26b10ac7b0e369b36c7d5dd4a386061283faaaba56f2",
      "after": "9bdf61dc20597ed7abf13d849a90e91df0eaec312ef8a4ee3d9408ae02dda11a"
    },
    {
      "path": "revisionWitness/kps/respiratory-r10-kp04",
      "before": "f9ee9950b29630340e6a6b582457fe329c0edd9bbd0002128276992159edd1ac",
      "after": "ebc6c5be0cc7ade2b1db4ba5ac2c8c8ca765b9e0e325f95a27684cd32c70d0e3"
    },
    {
      "path": "revisionWitness/kps/respiratory-r10-kp06",
      "before": "72f1fb1a02afb41e3a5c4ef08537764353a8a51f312938da6264d923756ef06c",
      "after": "7868d47c8ab5d29f9d02447af9626ec38d224253b22985dc9f608ce8ff40ca38"
    },
    {
      "path": "revisionWitness/kps/respiratory-r10-kp08",
      "before": "a89e12581d87aaf4010964dce10d7dfbc7fc58b0568b7c006426b8c4890c57b6",
      "after": "a07eef98c3698abd6853e7083230c63edca15bf5b34940a244eadc43fa92dbb5"
    },
    {
      "path": "revisionWitness/kps/respiratory-r10-kp16",
      "before": "09099a85ccc72e0be28b72141c95923ddec6a80a425fc15dc7447f8a3e41a00e",
      "after": "4d83c01bb0a05c195c987de826ee86c977031f13172d67a80038b6548ffea5b6"
    },
    {
      "path": "revisionWitness/kps/respiratory-r10-kp18",
      "before": "99ec494fecfc61d37f9821b335672eeae34ed8785d4ca453850545f16f6fefd2",
      "after": "5f467abc2d0b93769bb1d438a55067f109a4715eeefcc09e71c29da33408c3bd"
    },
    {
      "path": "revisionWitness/kps/respiratory-r10-kp19",
      "before": "ad110419f89e13150f8ae3f49fc539605f0940ece118337d67ffaf9f921cdc79",
      "after": "5698ca3b418b794b96f94d2bfc3b00e78cea34817ce2ae94f2a3ca1d72cd462f"
    },
    {
      "path": "revisionWitness/block",
      "before": "4d6811d7e4cd782000981b4617d9095511bc1ca46122c72ac9a69a296e78a228",
      "after": "54e47f1d09e15a3402f140a8ebfba976313f67f260c2f2396bb8d925f815f24e"
    },
    {
      "path": "precisionCards/0/semanticRevision",
      "before": "fc956efcc1cd4ddca36c26b10ac7b0e369b36c7d5dd4a386061283faaaba56f2",
      "after": "9bdf61dc20597ed7abf13d849a90e91df0eaec312ef8a4ee3d9408ae02dda11a"
    },
    {
      "path": "precisionCards/1/semanticRevision",
      "before": "f9ee9950b29630340e6a6b582457fe329c0edd9bbd0002128276992159edd1ac",
      "after": "ebc6c5be0cc7ade2b1db4ba5ac2c8c8ca765b9e0e325f95a27684cd32c70d0e3"
    },
    {
      "path": "precisionCards/2/semanticRevision",
      "before": "a89e12581d87aaf4010964dce10d7dfbc7fc58b0568b7c006426b8c4890c57b6",
      "after": "a07eef98c3698abd6853e7083230c63edca15bf5b34940a244eadc43fa92dbb5"
    },
    {
      "path": "precisionCards/3/semanticRevision",
      "before": "09099a85ccc72e0be28b72141c95923ddec6a80a425fc15dc7447f8a3e41a00e",
      "after": "4d83c01bb0a05c195c987de826ee86c977031f13172d67a80038b6548ffea5b6"
    },
    {
      "path": "precisionCards/4/semanticRevision",
      "before": "ad110419f89e13150f8ae3f49fc539605f0940ece118337d67ffaf9f921cdc79",
      "after": "5698ca3b418b794b96f94d2bfc3b00e78cea34817ce2ae94f2a3ca1d72cd462f"
    }
  ],
  "respiratory-r11": [
    {
      "path": "revisionWitness/kps/respiratory-r11-kp17",
      "before": "d983be1817d1dd4ba135de0adda3374749f4951317ceac1f76866cb5692c3a36",
      "after": "46e9e12b7202887ab89bbbcfc4a3a0d146da48bff3f1ad6f1f840b98ff929e7a"
    },
    {
      "path": "revisionWitness/kps/respiratory-r11-kp21",
      "before": "5078ef8b28939f256fc0c8d84cb032a91e07d837440660c06d80dfd48ecb66d9",
      "after": "db9b0741550b82a793447db271eaaa80fc09c26712589b73a460992fe098272b"
    },
    {
      "path": "revisionWitness/kps/respiratory-r11-kp22",
      "before": "a683ac8a56b28eef55d5b272fc535ea347e091c385d97cb1f30c488796731846",
      "after": "18a57b59bb78f562938d6a1ed4cee244d20126b161404c54966b04234bc832aa"
    },
    {
      "path": "revisionWitness/groups/respiratory-r11-lg03",
      "before": "0745474a46a26787b07b0d2258519a87188d8897e854802c441c3bd0f04c657f",
      "after": "a8f22b1fa090a895ce85a4ce54db8dbd0f6acb70f41745d79b14f0697a55c54b"
    },
    {
      "path": "revisionWitness/groups/respiratory-r11-lg04",
      "before": "c3033a77b6c5e0959ae9484a9d3275a23cdf23a3a5792a37c75c9014cf93f8c7",
      "after": "ae38dc28832378f86a409f8f6b29c37e1bcad22f63a04d036c4a1a2fe78a4f53"
    },
    {
      "path": "revisionWitness/groups/respiratory-r11-lg05",
      "before": "22540e678925b68e746579cc5ac45abfc3ed4f2562896b47ba8ffda208d75d0c",
      "after": "49c506c550bbcd707c437752b1007c6b552dc1bd3d94c158969856a913707011"
    },
    {
      "path": "revisionWitness/block",
      "before": "3531a83be54472c3dd1ecf013572cbfacaabefe22c2f5836f321e3412bf1c75e",
      "after": "048ea755f25fe919aa1816c93e8a83a3f330e9c6d4ba94cc512024cd19a9fc25"
    },
    {
      "path": "precisionCards/0/semanticRevision",
      "before": "5078ef8b28939f256fc0c8d84cb032a91e07d837440660c06d80dfd48ecb66d9",
      "after": "db9b0741550b82a793447db271eaaa80fc09c26712589b73a460992fe098272b"
    },
    {
      "path": "precisionCards/1/semanticRevision",
      "before": "a683ac8a56b28eef55d5b272fc535ea347e091c385d97cb1f30c488796731846",
      "after": "18a57b59bb78f562938d6a1ed4cee244d20126b161404c54966b04234bc832aa"
    },
    {
      "path": "precisionCards/2/semanticRevision",
      "before": "22540e678925b68e746579cc5ac45abfc3ed4f2562896b47ba8ffda208d75d0c",
      "after": "49c506c550bbcd707c437752b1007c6b552dc1bd3d94c158969856a913707011"
    }
  ],
  "respiratory-r12": [
    {
      "path": "revisionWitness/kps/respiratory-r12-kp08",
      "before": "68f7f872aeee9bdd101cc00901f8f6c90e82c63c96c521feb967053261e4ef97",
      "after": "1a21bcc3912a79496cd34b4039dcf2e315032503155e3244d01ea91acd905609"
    },
    {
      "path": "revisionWitness/kps/respiratory-r12-kp09",
      "before": "414335cdc84062066114a42be52ff36f956b7445d00cc2545372ab2fbd2203bb",
      "after": "5f8f913e68995011b390bc485abbaf713c05f5e0124f95981a0e88abdae0ef35"
    },
    {
      "path": "revisionWitness/kps/respiratory-r12-kp12",
      "before": "aa78029a12cf905cd37796666b5c861347c30a9199a0a61514a86d2bc7bffd37",
      "after": "ba3cbb696e5c19744aa88d8bcf2d85015ead47f8018a07355e51aa6852227203"
    },
    {
      "path": "revisionWitness/kps/respiratory-r12-kp13",
      "before": "b41e633407a80fc6a3bfb925f4e67c6793261ded7aebf984b197df119870dfa4",
      "after": "22065e94cb537e56dad1664c68bd39207b406a2e8c5f6d116281151ca6259494"
    },
    {
      "path": "revisionWitness/kps/respiratory-r12-kp16",
      "before": "85ba7fa9d7379a3d182ed934a814847866139f5e01bba33b2da03ca7ac7aa721",
      "after": "2ccbfa49e1575aff98443d7e445388a83d0f64e193f462f4c73d64bf149097fe"
    },
    {
      "path": "revisionWitness/kps/respiratory-r12-kp17",
      "before": "6b4a9c52cc77e9896e3cf62a5f71a214bb3b24e855c666d82aff60f577327eff",
      "after": "1d692a26756ccdc8f4eb7808179fd9b6eb980dfa46064bf2b6b48dd8828f836d"
    },
    {
      "path": "revisionWitness/kps/respiratory-r12-kp18",
      "before": "f0a8fcd4448a7d3499418a983c0c7e483f3c130e63594ad0fd9094ed8e95ccc3",
      "after": "c044e4d744e74247e391ed1ae6265532dca401799341512ec801e03393564217"
    },
    {
      "path": "revisionWitness/groups/respiratory-r12-lg02",
      "before": "b3fa43b638c22b936918dcad79436deffcb850062ef79354648ec0712a6f5b3d",
      "after": "55995c7753ab405ced67fa04a2ac66fce23b479672c586615596448916b034e0"
    },
    {
      "path": "revisionWitness/groups/respiratory-r12-lg04",
      "before": "92fd8c18e075cbc9e2a9a2a40453f0f2503b96f9d1e25513913a0e22aa881a36",
      "after": "5be960c2e4a3885384f5ea74bce3271ea8075a50b5a4de86aec85481549d9c80"
    },
    {
      "path": "revisionWitness/block",
      "before": "d953368ad84f42085d572f0be4bbcf41e4b9122e53a456f8078f6ca92f8bbef4",
      "after": "5674ca3570df11cb77ec11dbfc87afb15a15bf5cd5b7d1977241546f8865af27"
    },
    {
      "path": "precisionCards/0/semanticRevision",
      "before": "68f7f872aeee9bdd101cc00901f8f6c90e82c63c96c521feb967053261e4ef97",
      "after": "1a21bcc3912a79496cd34b4039dcf2e315032503155e3244d01ea91acd905609"
    },
    {
      "path": "precisionCards/1/semanticRevision",
      "before": "414335cdc84062066114a42be52ff36f956b7445d00cc2545372ab2fbd2203bb",
      "after": "5f8f913e68995011b390bc485abbaf713c05f5e0124f95981a0e88abdae0ef35"
    },
    {
      "path": "precisionCards/2/semanticRevision",
      "before": "aa78029a12cf905cd37796666b5c861347c30a9199a0a61514a86d2bc7bffd37",
      "after": "ba3cbb696e5c19744aa88d8bcf2d85015ead47f8018a07355e51aa6852227203"
    },
    {
      "path": "precisionCards/3/semanticRevision",
      "before": "b41e633407a80fc6a3bfb925f4e67c6793261ded7aebf984b197df119870dfa4",
      "after": "22065e94cb537e56dad1664c68bd39207b406a2e8c5f6d116281151ca6259494"
    },
    {
      "path": "precisionCards/4/semanticRevision",
      "before": "85ba7fa9d7379a3d182ed934a814847866139f5e01bba33b2da03ca7ac7aa721",
      "after": "2ccbfa49e1575aff98443d7e445388a83d0f64e193f462f4c73d64bf149097fe"
    },
    {
      "path": "precisionCards/5/semanticRevision",
      "before": "6b4a9c52cc77e9896e3cf62a5f71a214bb3b24e855c666d82aff60f577327eff",
      "after": "1d692a26756ccdc8f4eb7808179fd9b6eb980dfa46064bf2b6b48dd8828f836d"
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
  },
  "respiratory-r04": {
    "originalKpRecordsSha256": "68949d74790478b3648bd3cfd98c189b0a1970e98b0f3b0adc0a14905d21ead2",
    "originalPreentrySha256": "ad5256afd0d4a20715fcbae66f76186fb1f852eeba06beadb7783b73ac98f8c9",
    "originalStablePreentrySha256": "99469ed3e4811bd0b56f8cd379b4414bbe4c79deda7c53eb1077a648623a7e23",
    "originalFrameworkMeta": {
      "present": false,
      "ownerPath": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block4_支气管哮喘_可逆性气流受限_学习阅读版_v1_最终执行版.md",
      "anchor": null,
      "items": [],
      "markdown": ""
    },
    "kpChanges": [],
    "nonFrameworkChanges": []
  },
  "respiratory-r05": {
    "originalKpRecordsSha256": "019befdff70e913b91c2b96251f3609b085e0e52158d46f65e2d58782b79d80f",
    "originalPreentrySha256": "6919adde2b38743b9e04f944bff4c69abfb644e215befb41316948f04407a53d",
    "originalStablePreentrySha256": "e2caf8e084b5ed7d5e49d21a5fd7ed39d6b742f2a22bdbe941eaed4018744b7c",
    "originalFrameworkMeta": {
      "present": false,
      "ownerPath": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block5_肺炎_病变空间病原体与严重度_学习阅读版_v1_最终执行版.md",
      "anchor": null,
      "items": [],
      "markdown": ""
    },
    "kpChanges": [],
    "nonFrameworkChanges": []
  },
  "respiratory-r06": {
    "originalKpRecordsSha256": "a50e9d612462e0440eea7617e4d908d4461bd753bf5923fbb036c5644637f983",
    "originalPreentrySha256": "372f7613aaf140706028051c9ab103d7e210d9c0b5d39c55b14b79ff84395050",
    "originalStablePreentrySha256": "971dd46d3508c5f3f25c6808d05e8f4d4528c588f6e3ae36e2fd6b637343d05e",
    "originalFrameworkMeta": {
      "present": false,
      "ownerPath": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block6_支气管扩张与肺脓肿_结构破坏脓腔与引流_学习阅读版_v1_最终执行版.md",
      "anchor": null,
      "items": [],
      "markdown": ""
    },
    "kpChanges": [],
    "nonFrameworkChanges": [
      {
        "path": "memoryRouting/miG/4",
        "before": "阻塞是支扩的结果，不是最主要发病基础；",
        "after": "阻塞可为支扩诱因，也可由扩张后痰液潴留产生；核心病理基础仍是管壁支撑结构破坏；"
      },
      {
        "path": "memoryRouting/miG/12",
        "before": "肺脓肿治疗必须达到影像空洞消失 / 明显吸收后才停药；",
        "after": "肺脓肿停药须综合临床、炎症与影像反应，不能只看退热、痰臭消失或固定周数；"
      }
    ]
  },
  "respiratory-r07": {
    "originalKpRecordsSha256": "696ac3c295ef25eb726164887f92205fa01d71480ed0390d027774efef5f1890",
    "originalPreentrySha256": "c591d6a0f065244b2cf1cb739ab3d1521f4c31f860f6c139590cfc1b68df8a42",
    "originalStablePreentrySha256": "f40021f15917a525e309a24641ce8fa359ffca1d3f638959ca195950ccfaf59f",
    "originalFrameworkMeta": {
      "present": false,
      "ownerPath": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block7_肺结核_肉芽肿空洞播散与化疗_学习阅读版_v1_最终执行版.md",
      "anchor": null,
      "items": [],
      "markdown": ""
    },
    "kpChanges": [],
    "nonFrameworkChanges": [
      {
        "path": "memoryRouting/miG/10",
        "before": "慢性纤维空洞型：开放、排菌强、上叶纤维化、肺门抬高、垂柳征、肺心病；",
        "after": "慢性纤维空洞型的典型病理开放形态、上叶纤维化、肺门抬高、垂柳征与肺心病；实际排菌/传染性仍据病原和治疗状态判断；"
      },
      {
        "path": "memoryRouting/miG/12",
        "before": "影像活动性证据：渗出、任何空洞、播散；修复证据：钙化、纤维条索；",
        "after": "影像中渗出、播散及新旧变化可提示活动，钙化/纤维条索可提示修复；任何空洞不独立证明活动，钙化亦不独立保证全部病灶静止；"
      },
      {
        "path": "memoryRouting/miG/14",
        "before": "痰涂片决定当前 Study 的传染性，痰培养是确诊金标准并支持活动性；",
        "after": "涂片提供排菌量/传染风险证据之一，培养结合鉴定，分子检测可提供病原及耐药证据；活动与传染分开合读，涂阴不保证不传播；"
      },
      {
        "path": "memoryRouting/miG/18",
        "before": "初治 2HRZE/4HR；复治涂阳先药敏；RR/MDR首选短程9–12个月；",
        "after": "药敏初治肺TB课程方案2HRZE/4HR；复治先药敏；RR/MDR按适用条件选择，课程9–12/18–20个月与KP23所列WHO版本分开，不能视为统一首选；"
      }
    ]
  },
  "respiratory-r08": {
    "originalKpRecordsSha256": "2a90d613767f89fb0b77a31bf07dda5c4744f22ccdc7f5d163e9c150005fa1d1",
    "originalPreentrySha256": "d9e062f3ccbbb41c5bea2e98187fb81ae58d208dc3c89ab7c7773b82f91d905c",
    "originalStablePreentrySha256": "0e895bf7bf34c56e31cdf239172d128003b84bd8cc61d7ba1c0ebed38cde7fc9",
    "originalFrameworkMeta": {
      "present": false,
      "ownerPath": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block8_间质性肺疾病与硅肺_限制弥散纤维化与硅结节_学习阅读版_v1_最终执行版.md",
      "anchor": null,
      "items": [],
      "markdown": ""
    },
    "kpChanges": [
      {
        "path": "7/detailMarkdown",
        "before": "### 1｜治疗\n\n- 多数患者无需治疗；\n- 症状严重者：糖皮质激素；\n- 当前 Study 疗程：6–24个月。\n\n### 2｜四期\n\n| 分期 | 影像身份 |\n|---|---|\n| I | 双肺门淋巴结肿大 |\n| II | 双肺门淋巴结肿大 + 肺部浸润影 |\n| III | 仅肺部浸润影 |\n| IV | 蜂窝肺、肺纤维化、肺气肿 |\n\n（易混：III 期肺门淋巴结消失，不表示疾病一定好转；病变已由中心向肺内扩展。）\n\n---",
        "after": "### 1｜治疗\n\n- 多数患者无需治疗；\n- 症状严重者：糖皮质激素；\n- 当前 Study 疗程：6–24个月。\n\n### 2｜四期\n\n| 分期 | 影像身份 |\n|---|---|\n| I | 双肺门淋巴结肿大 |\n| II | 双肺门淋巴结肿大 + 肺部浸润影 |\n| III | 仅肺部浸润影 |\n| IV | 蜂窝肺、肺纤维化、肺气肿 |\n\n（易混：III 期仅见肺部浸润，不表示病情一定好转。I–IV 是影像分布/形态分类，不要求患者逐期进展；讲义“由中心向外周”的说法保留为教学记忆路径，不能作为所有患者的固定病程。此边界依据 [TSANZ 官方 Sarcoidosis State of the Art Paper，正文 P15](https://thoracic.org.au/wp-content/uploads/2024/09/TSANZ-SarcoidosisPaper-2018-web-v3.pdf) 的影像分期说明；四期课程表和治疗范围不变。）\n\n---"
      }
    ],
    "nonFrameworkChanges": [
      {
        "path": "memoryRouting/miG/6",
        "before": "IPF：BALF中性粒 / 嗜酸粒↑；HRCT不清时外科肺活检；肺移植最有效；",
        "after": "IPF：BALF中性粒/嗜酸粒↑是支持接口；HRCT不确定先多学科讨论与取样风险评估，非自动外科肺活检；肺移植最有效；"
      },
      {
        "path": "memoryRouting/miG/8",
        "before": "结节病分期 I–IV 的“肺门 → 肺内浸润 → 纤维化”方向；",
        "after": "结节病I–IV分别恢复肺门结、肺内浸润和纤维化的影像组合，不要求逐期进展；III期仅肺内浸润不能独立判好转；"
      }
    ]
  },
  "respiratory-r09": {
    "originalKpRecordsSha256": "33286d6e5b645f53f6380349a3e9a2ee22b6a91efc9d4e6f97ca9f2979950a8c",
    "originalPreentrySha256": "d613abbcbf3a8ab2c22088a4596117af1b69d672e1969b83b5bdda4d485a85df",
    "originalStablePreentrySha256": "1a46d9eea73f9ab906987fd460fa78fc5f019f8cf26124ac5073eee99e1aebe0",
    "originalFrameworkMeta": {
      "present": false,
      "ownerPath": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block9_肺动脉高压肺心病与急性肺血栓栓塞_慢性阻力急性阻塞与右心负荷_学习阅读版_v1_最终执行版.md",
      "anchor": null,
      "items": [],
      "markdown": ""
    },
    "kpChanges": [],
    "nonFrameworkChanges": []
  },
  "respiratory-r10": {
    "originalKpRecordsSha256": "e9140ca5a9e889385ec85927f99e3ae1736c5058c99a1b7ca4badb43fa3f33a5",
    "originalPreentrySha256": "16bb35ce14c8a5abb3e028684e639d3b6834a90efdcfd58b11f5562bda6597fc",
    "originalStablePreentrySha256": "459a58f9580d063340456cab33b6d868039c8703f4e4dfd51ce371042df6e886",
    "originalFrameworkMeta": {
      "present": false,
      "ownerPath": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block10_胸膜空间与胸部损伤_积液气胸血胸与胸壁失稳_学习阅读版_v1_最终执行版.md",
      "anchor": null,
      "items": [],
      "markdown": ""
    },
    "kpChanges": [
      {
        "path": "5/detailMarkdown",
        "before": "### 1｜向健侧\n\n- 大量胸腔积液；\n- 大量气胸。\n\n### 2｜向患侧\n\n- 慢性纤维空洞型肺结核；\n- 慢性肺脓肿；\n- 慢性脓胸；\n- 肺不张；\n- 明显胸膜粘连 / 增厚。\n\n### 3｜多不移位\n\n- 病变较轻；\n- COPD、哮喘；\n- 大叶性肺炎实变；\n- 肺泡性肺水肿。\n\n> 明显纵隔移位意味着液体量较大，此时胸膜两层已分开，因此通常不与胸膜摩擦音共存。\n\n---",
        "after": "### 1｜向健侧\n\n- 大量胸腔积液；\n- 大量气胸。\n\n### 2｜向患侧\n\n- 慢性纤维空洞型肺结核；\n- 慢性肺脓肿；\n- 慢性脓胸；\n- 肺不张；\n- 明显胸膜粘连 / 增厚。\n\n### 3｜多不移位\n\n- 病变较轻；\n- COPD、哮喘；\n- 大叶性肺炎实变；\n- 肺泡性肺水肿。\n\n> 因大量胸腔积液把纵隔推向健侧时，积液覆盖区域的脏、壁两层胸膜已分开，该区域通常听不到胸膜摩擦音；这不适用于所有原因的纵隔移位。\n\n---"
      },
      {
        "path": "17/detailMarkdown",
        "before": "- 别称：高压性气胸；\n- 破口：活瓣；\n- 胸膜腔内压：高于大气压；\n- 三类气胸中威胁最大。\n\n```text\n气体只进不出\n→ 胸膜腔压力持续升高\n→ 患肺受压、通气下降\n→ 腔静脉回流↓\n→ 前负荷、SV、CO↓\n→ 心动过速、低血压、休克\n```\n\n还可：\n\n- 纵隔气肿；\n- 皮下气肿；\n- 呼吸循环障碍。\n\n急救：\n\n> **立即胸膜腔穿刺减压 / 抽气。**\n\n（易混：张力性气胸是高压持续向一侧推移，不是开放性气胸的左右纵隔摆动。）\n\n---",
        "after": "- 别称：高压性气胸；\n- 破口：活瓣；\n- 胸膜腔内压：高于大气压；\n- 三类气胸中威胁最大。\n\n```text\n气体只进不出\n→ 胸膜腔压力持续升高\n├─ 患肺受压、通气下降\n└─ 高压阻碍腔静脉回流\n   → 回心血量、前负荷下降，SV、CO可下降\n   → 可出现心动过速、低血压、休克\n```\n\n还可：\n\n- 纵隔气肿；\n- 皮下气肿；\n- 呼吸循环障碍。\n\n急救：\n\n> **立即胸膜腔穿刺减压 / 抽气。**\n\n（易混：张力性气胸是高压持续向一侧推移，不是开放性气胸的左右纵隔摆动。）\n\n---"
      }
    ],
    "nonFrameworkChanges": [
      {
        "path": "memoryRouting/miG/6",
        "before": "胸膜摩擦音只在积液少时容易听到，大量积液与明显纵隔移位时通常不共存；",
        "after": "胸膜摩擦音可出现在仍接触的炎症胸膜区域；大量积液覆盖并分开两层的区域通常减弱 / 消失，不能推成任何纵隔移位或全胸均无摩擦音；"
      },
      {
        "path": "memoryRouting/miG/14",
        "before": "闭合性：破口闭、胸膜压<大气压；<20%观察，否则穿刺抽气；",
        "after": "闭合性指破口闭合；压力低于大气压和20%分支是课程概括，不能排除张力。观察 / 抽气还须结合症状、低氧、循环、大小和背景，详见KP16；"
      },
      {
        "path": "memoryRouting/miG/17",
        "before": "气胸引流：锁骨中线第2肋间；胸水引流：腋中—腋后线第6–7肋间；",
        "after": "课程气 / 液引流位置分别为锁骨中线第2肋间、腋中—腋后线第6–7肋间；须区分急救针刺与胸管，并结合安全三角 / 超声等定位，详见KP19；"
      },
      {
        "path": "memoryRouting/miG/18",
        "before": "插管深呼气后屏气；拔管深吸气后屏气；",
        "after": "插管深呼气后屏气、拔管深吸气后屏气是课程配对；实际呼吸配合与Valsalva等按具体操作，拔管须看完整组合，堵管不等于可拔，详见KP19；"
      },
      {
        "path": "memoryRouting/miG/20",
        "before": "多根多处肋骨骨折 = 连枷胸 / 胸壁软化，出现反常呼吸；",
        "after": "多根多处骨折可形成连枷段；影像连枷段与临床反常运动须分开，课程与现有定义带版本，支持取决于肺挫伤、疲劳和呼吸状态，详见KP21；"
      }
    ]
  },
  "respiratory-r11": {
    "originalKpRecordsSha256": "d1a3c6411383fd4074ad07f06902c0565e5f3994ba2615c2ba34fbe08e6818df",
    "originalPreentrySha256": "d70bf5604d2a56c0a27df5ff1f5ae94b3d18408849bf4c277e69cf074b5f37c4",
    "originalStablePreentrySha256": "154e8bd3135041f200264ef3d52911a421300e0a6552f39da4cc7d2869fc22ae",
    "originalFrameworkMeta": {
      "present": false,
      "ownerPath": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block11_肺癌与纵隔_位置组织学分期与纵隔定位_学习阅读版_v1_最终执行版.md",
      "anchor": null,
      "items": [],
      "markdown": ""
    },
    "kpChanges": [
      {
        "path": "16/detailMarkdown",
        "before": "### 1｜肿块边缘\n\n肺癌结节或肿块可见：\n\n- 分叶；\n- 毛刺；\n- 胸膜凹陷 / 边缘凹凸不平接口。\n\n当前 Lecture 将其与肿瘤内部亚克隆生长不均匀联系。\n\n### 2｜癌性空洞\n\n```text\n肿瘤坏死\n→ 坏死物排出\n→ 空洞形成\n→ 肿块本身分叶 / 毛刺\n→ 空洞壁凹凸不平\n```\n\n### 3｜空洞反向定位\n\n| 疾病 | 当前 Study 入口 |\n|---|---|\n| 吸入性肺脓肿 | 边缘不清浸润影 + 液平 |\n| 支扩 | 薄壁囊腔 |\n| 慢性肺脓肿 | 厚壁空洞 + 脓痰 |\n| 浸润性结核 | 薄壁空洞 |\n| 干酪性肺炎 | 虫蚀样无壁空洞 |\n| 慢性纤维空洞型 TB | 厚壁 + 卫星灶 / 上旧下新 |\n| 肺癌 | 凹凸不平的癌性空洞 |\n| 大叶性肺炎 | 当前 Study 强调无坏死空洞 |\n\n### 4｜倒 S 征\n\n见 KP10：右上叶中央型肺癌 + 肺不张。\n\n---",
        "after": "### 1｜肿块边缘\n\n肺癌结节或肿块可见：\n\n- 分叶；\n- 毛刺；\n- 胸膜凹陷 / 边缘凹凸不平接口。\n\n当前 Lecture 将其与肿瘤内部亚克隆生长不均匀联系。\n\n### 2｜癌性空洞\n\n```text\n肿瘤坏死 → 坏死物排出 → 空洞形成\n同时考虑：肿块本身已有分叶 / 毛刺等形态\n→ 当前Lecture结合两者解释空洞壁凹凸不平\n```\n\n### 3｜空洞反向定位\n\n| 疾病 | 当前 Study 入口 |\n|---|---|\n| 吸入性肺脓肿 | 边缘不清浸润影 + 液平 |\n| 支扩 | 薄壁囊腔 |\n| 慢性肺脓肿 | 厚壁空洞 + 脓痰 |\n| 浸润性结核 | 薄壁空洞 |\n| 干酪性肺炎 | 虫蚀样无壁空洞 |\n| 慢性纤维空洞型 TB | 厚壁 + 卫星灶 / 上旧下新 |\n| 肺癌 | 凹凸不平的癌性空洞 |\n| 大叶性肺炎 | 当前 Study 强调无坏死空洞 |\n\n### 4｜倒 S 征\n\n见 KP10：右上叶中央型肺癌 + 肺不张。\n\n---"
      }
    ],
    "nonFrameworkChanges": [
      {
        "path": "memoryRouting/miG/13",
        "before": "低剂量 CT 筛查；支气管镜活检为金标准；PET/CT用于早期灶、转移、分期和疗效；",
        "after": "低剂量CT用于筛查，异常灶先定位再按可达性取材；支镜活检是课程金标准，周围 / Pancoast等可选经胸壁路径。PET/CT辅助范围 / 分期和疗效，不能以浓聚替代组织确诊，详见KP16 / KP18；"
      },
      {
        "path": "memoryRouting/miG/14",
        "before": "小细胞癌首选化疗；I、II期 NSCLC首选手术；T4 / N3 / M1当前 Study 不手术；",
        "after": "小细胞课程以化疗为主，少数极早期手术有条件；I、II期NSCLC可切且耐受者评估手术。T4 / N3 / M1课程快捷口径须与Core条件合读，T4并非一律不可切，晚期还看分子 / 免疫条件，详见KP20；"
      }
    ]
  },
  "respiratory-r12": {
    "originalKpRecordsSha256": "6002c00323d818b7918f71ab42d68f19ba4fa3afe765e7ea515e1fdb7db553cb",
    "originalPreentrySha256": "fdfa10b4e0781f4dc304e2690e82a3b8e96b44adb6b48ceeaefb448d8ff1bfd8",
    "originalStablePreentrySha256": "c4d82c37bf67dd75b29f4219ac7ed434d68455e37439cb10c3a7a570b519ed00",
    "originalFrameworkMeta": {
      "present": false,
      "ownerPath": "content/xizong/knowledge/systems/a2-respiratory/blocks/Block12_ARDS与呼吸衰竭_屏障损伤氧合失败与通气失败_学习阅读版_v1_最终执行版.md",
      "anchor": null,
      "items": [],
      "markdown": ""
    },
    "kpChanges": [
      {
        "path": "17/detailMarkdown",
        "before": "### 1｜药物\n\n- 急性呼衰：多沙普仑；\n- 慢性呼衰：阿米三嗪。\n\n### 2｜适合\n\n以呼吸中枢抑制为主的通气障碍，例如脑干出血、镇静催眠剂中毒接口。\n\n### 3｜使用前提\n\n```text\n中枢能被兴奋\n+ 传出神经完整\n+ 呼吸肌能收缩\n+ 气道通畅\n```\n\n### 4｜不适合 / 禁慎用\n\n- 换气障碍：兴奋呼吸肌不能修复呼吸膜；\n- 神经传导障碍、呼吸肌完全病变：禁用；\n- 脑缺氧、脑水肿未纠正且频繁抽搐：慎用。\n\n（边界：COPD核心有小气道阻塞，呼吸兴奋剂作用弱且可能增加呼吸功，当前 Study认为机械通气更有效；其过量主要只是加强已经疲劳的呼吸肌运动，**不作为造成碱中毒的典型原因**。）\n\n---",
        "after": "### 1｜药物\n\n当前 Study 的药物配对，保留为讲义口径，不等于临床通用适应证：\n\n- 急性呼衰：多沙普仑；\n- 慢性呼衰：阿米三嗪。\n\n### 2｜适合\n\n讲义以呼吸中枢抑制为主的通气障碍作为适合的机制类别，并举“脑干出血、镇静催眠剂中毒”为例。该机制分类不能自动转成具体药物适应证；其中“脑干出血”作为原Source例子保留，不能据此判断多沙普仑可用，其具体禁忌见下方Source冲突。\n\n### 3｜使用前提\n\n```text\n中枢能被兴奋\n+ 传出神经完整\n+ 呼吸肌能收缩\n+ 气道通畅\n```\n\n### 4｜不适合 / 禁慎用\n\n以下为讲义对呼吸兴奋剂的分类概括：\n\n- 换气障碍：兴奋呼吸肌不能修复呼吸膜；\n- 神经传导障碍、呼吸肌完全病变：禁用；\n- 脑缺氧、脑水肿未纠正且频繁抽搐：慎用。\n\n> **具体药物边界 / Source冲突**：DailyMed的多沙普仑官方说明书将脑血管事件、脑水肿，以及癫痫或其他惊厥性疾病列为禁忌，不能仅套用上方讲义的“慎用”。因此，中枢抑制的病因示例不能证明多沙普仑适用，尤其不能从“脑干出血”推出可用该药。这是多沙普仑的药物边界，不据此重写整类兴奋剂的适应证。\n>\n> 来源：[DailyMed，DOXAPRAM HYDROCHLORIDE / DOPRAM Injection，CONTRAINDICATIONS](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=954859c0-a121-34d6-e053-2a95a90a1e19)（美国药品标签，页面更新2025-01-08）。原讲义P58的药物配对、脑干出血例子与慎用说法在上文显式保留；此处不扩写剂量或完整ICU用药方案。\n\n（边界：COPD核心有小气道阻塞，呼吸兴奋剂作用弱且可能增加呼吸功，当前 Study认为机械通气更有效；其过量主要只是加强已经疲劳的呼吸肌运动，**不作为造成碱中毒的典型原因**。）\n\n---"
      }
    ],
    "nonFrameworkChanges": [
      {
        "path": "memoryRouting/miG/5",
        "before": "PaO₂ / FiO₂≤300是当前 Study必要氧合条件；200 / 100分轻中重。",
        "after": "PaO₂ / FiO₂≤300是课程必要氧合条件，200 / 100分档；Berlin版本还须相应正压、时间、双肺影和水肿来源条件，不能凭比值单独确诊，详见KP08。"
      },
      {
        "path": "memoryRouting/miG/11",
        "before": "慢性Ⅱ型COPD强调低浓度氧；严重急性哮喘虽是Ⅱ型，不套用同一低氧逻辑。",
        "after": "慢性COPD高碳酸风险控制给氧并复血气；严重急性哮喘发生通气衰竭时可为Ⅱ型，不能机械套用同一COPD氧疗方案，详见KP17。"
      }
    ]
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
  const additional = a2AdditionalSourceReviews[blockId];
  if (additional) {
    if (originalCanonicalGitBlob) assert.equal(originalCanonicalGitBlob, additional.originalCanonicalGitBlob);
    assert.equal(a2TestSha(source), additional.reviewedCurrentSourceSha256, blockId + ': exact independently reviewed current source');
    let comparison = source;
    const ranges = [...additional.reviewedSpans].sort((a, b) => b.start - a.start);
    for (const [i, range] of ranges.entries()) {
      assert.ok(range.start >= 0 && range.end > range.start);
      if (i) assert.ok(range.end <= ranges[i - 1].start, blockId + ': disjoint explicitly reviewed spans');
      assert.equal(a2TestSha(source.slice(range.start, range.end)), range.sha256, blockId + ': reviewed ' + range.label);
      comparison = comparison.slice(0, range.start) + range.marker + comparison.slice(range.end);
    }
    assert.equal(a2TestSha(comparison), additional.originalProtectedSourceSha256,
      blockId + ': every original byte outside the exact model and named Core/consistency exceptions');
    return true;
  }
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
  const coreGroups = new Map();
  for (const change of a2ReviewedCoreWitnessChanges) {
    const rows = index.precision_index.filter(row => row.id === change.id);
    assert.equal(rows.length, 1, change.id + ': same independently admitted identity');
    const ref = rows[0].prepared_memory_ref.core_refs[change.refIndex];
    assert.equal(ref.kp_id, change.kpId);
    assert.equal(ref.kp_core_sha256, change.after, change.id + ': substantively re-reviewed current Core witness');
    assert.notEqual(change.after, change.before, 'Core exception is not semantic equivalence');
    const key = JSON.stringify([change.before, change.after]);
    const group = coreGroups.get(key) || { ...change, count: 0 };
    group.count += 1;
    coreGroups.set(key, group);
  }
  // KP18 is required by two original R10 admissions. Validate both exact owners
  // above, then reverse only the expected number of shared fingerprint values.
  for (const change of coreGroups.values()) {
    const after = JSON.stringify(change.after);
    assert.equal(historical.split(after).length - 1, change.count, 'only explicitly reviewed Core references');
    historical = historical.split(after).join(JSON.stringify(change.before));
  }
  return historical;
}

export function assertPreparedDescriptorAfterModelReview(descriptor, source, originalDigest) {
  if (!descriptor) { assert.equal(a2TestDigest(null), originalDigest); return; }
  const comparison = descriptorAtFrozenPackaging(descriptor, source);
  const a3Changes = a3ReviewedDescriptorChanges[descriptor.blockId];
  const changes = a2ReviewedDescriptorChanges[descriptor.blockId] || a3Changes;
  if (changes) {
    assert.equal(descriptor.systemId, a3Changes ? 'urinary' : 'respiratory');
    assert.equal(descriptor.canonicalId, a3Changes ? 'A3' : 'A2');
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
    const reviewed = a2ReviewedSources[descriptor.blockId] || a2AdditionalSourceReviews[descriptor.blockId]
      || a3ReviewedSources[descriptor.blockId];
    if (reviewed) {
      if (a3Changes) assertReviewedA3Source(source, descriptor.blockId);
      else assertReviewedA2Source(source, descriptor.blockId);
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
  const originalKpComparison = structuredClone(block.kpRecords);
  for (const change of reviewed.kpChanges || []) {
    const keys = change.path.split('/');
    assert.equal(keys.length, 2);
    assert.equal(keys[1], 'detailMarkdown', 'only the five named Core fields were substantively reviewed');
    const actual = keys.reduce((owner, key) => owner?.[key], block.kpRecords);
    assert.equal(actual, change.after, block.blockId + ': exact reviewed Core exception');
    assert.notEqual(change.after, change.before);
    originalKpComparison[Number(keys[0])].detailMarkdown = change.before;
  }
  assert.equal(a2TestSha(JSON.stringify(originalKpComparison)), reviewed.originalKpRecordsSha256,
    block.blockId + ': complete original native KP records outside explicit Core exceptions');
  // This existing preentry consumer has no Framework recovery for these A2
  // Blocks in old or current output. Canonical model-frame consumption is
  // verified separately; this comparison does not claim to restore that consumer.
  assert.deepEqual(current.framework, reviewed.originalFrameworkMeta);
  const comparison = structuredClone(current);
  for (const change of reviewed.nonFrameworkChanges) {
    const keys = change.path.split('/');
    const actual = keys.reduce((owner, key) => owner?.[key], current);
    assert.equal(actual, change.after, block.blockId + ': actual reviewed Memory Routing value');
    const parent = keys.slice(0, -1).reduce((owner, key) => owner[key], comparison);
    parent[keys.at(-1)] = change.before;
  }
  // Both unrelated original A3 and B raw/preentry baselines were reproduced
  // from their original 4ad/09ce inputs before extracting the exact review deltas.
  assert.equal(a2TestSha(JSON.stringify(comparison)), reviewed.originalPreentrySha256);
  assert.equal(a2TestDigest(comparison), reviewed.originalStablePreentrySha256);
  return true;
}

// A3 B1–B5 staged review (2026-10-08). All five original source owners,
// complete native records, old preentry outputs and all 28 prepared descriptors
// first reproduced the unchanged independent A3/B goldens. Only 19 named source
// spans, 11 Learning fields and nine existing owner witnesses changed. KP14's
// nine subheadings restore the already-authored original body to its own Core;
// no medical prose or prepared Core reference was rewritten.
// These assertions operate on comparison copies only. Current semantic revisions,
// runtime inputs, answers, admission, Truth and learner history stay real.
const a3ReviewedSources = {
  "urinary-b01": {
    "originalCanonicalGitBlob": "d165e2bde176d68976d886c1ff7aa18a089e2ce7",
    "originalPackagingSha256": "6c255e6869a568b0fe4527ad0a9b1a77f25b5e47db8f470feee6362d29009dd9",
    "reviewedCurrentSourceSha256": "4c9da6f949d2e7de07e1ebdab53372ff3c4b173b7a02f57dde846247ca809008",
    "originalProtectedSourceSha256": "ad6d660ce26fdacffbec40a722d1b2a52c1d870f98b0d9a7b133285d6a6bf6ba",
    "reviewedSpans": [
      {
        "label": "b01-top",
        "marker": "REVIEWED_A3_STAGE1_SPAN_0",
        "start": 979,
        "end": 4921,
        "sha256": "8aca22975a4b11b6ca8672472e2947269ebb2820bc73fc2126c78489bbaaee02"
      },
      {
        "label": "b01-spine",
        "marker": "REVIEWED_A3_STAGE1_SPAN_1",
        "start": 18121,
        "end": 18486,
        "sha256": "3a7f233b85a6209728f9f2e43a1aa79a5d1257f4b8db8d203a22f48d9389547c"
      },
      {
        "label": "b01-handoff",
        "marker": "REVIEWED_A3_STAGE1_SPAN_2",
        "start": 21215,
        "end": 21512,
        "sha256": "ed5a748b943e69b070c075a5036c9d98157aac12fbc6b6510ebf12eadc2173c2"
      }
    ]
  },
  "urinary-b02": {
    "originalCanonicalGitBlob": "981804ff17dd56c470924d3d0edbf64f600e2398",
    "originalPackagingSha256": "8e91d7c344aef5de322fc9ecb45b0039a7782c5b882bb8d55ff671479a68605c",
    "reviewedCurrentSourceSha256": "0f39e0fa081053039d2be29257fda8f3aadf8786fa5959c2b476bc8578dbf671",
    "originalProtectedSourceSha256": "bebd4e97017f147435342397690e441d4024c1d478560a0c3e7d70d7645c342e",
    "reviewedSpans": [
      {
        "label": "b02-top",
        "marker": "REVIEWED_A3_STAGE1_SPAN_0",
        "start": 1014,
        "end": 4664,
        "sha256": "7542665ac8b788535bb337b1c36f4f641a6d77f3da481766e95dbfdd6771ca61"
      },
      {
        "label": "B2 KP14 original five subsections restored to native Core by correct child heading levels",
        "marker": "REVIEWED_A3_STAGE1_SPAN_6",
        "start": 14514,
        "end": 15724,
        "sha256": "b0381a8c0aa7d15aef47ba70aca7e0fd42827a4ef2185f9e87d53fabd3750f67"
      },
      {
        "label": "b02-equilibrium-comparison",
        "marker": "REVIEWED_A3_STAGE1_SPAN_1",
        "start": 15999,
        "end": 16143,
        "sha256": "8f0872c6cb0baa5ba3f99a8f4e4d3fa3af341b169a6e35fa3f69480b37319394"
      },
      {
        "label": "b02-spine",
        "marker": "REVIEWED_A3_STAGE1_SPAN_2",
        "start": 16297,
        "end": 16551,
        "sha256": "9a530bd3dc7e4cd2c35cad22a17cb77402fa156263390fe15b0e2c4b76f54e30"
      },
      {
        "label": "non-model-02",
        "marker": "REVIEWED_A3_STAGE1_SPAN_3",
        "start": 16826,
        "end": 16869,
        "sha256": "b2b62dd0b0622ab72f92737845be81a5106d25fa085198ce12be7d336391fa06"
      },
      {
        "label": "non-model-01",
        "marker": "REVIEWED_A3_STAGE1_SPAN_4",
        "start": 17050,
        "end": 17092,
        "sha256": "2b086774cfff0f69e784a63d9a4ef4294b6ff38f2f120897cc58cfcbf68430b5"
      },
      {
        "label": "b02-handoff",
        "marker": "REVIEWED_A3_STAGE1_SPAN_5",
        "start": 18833,
        "end": 19114,
        "sha256": "e4fc5d2ef69c2ac29762fe668b676c5bbcf1cfe8f5a50a058b9e633c3468abc0"
      }
    ]
  },
  "urinary-b03": {
    "originalCanonicalGitBlob": "01d60be7d956cef3f74ad9cbf6018085f60980bb",
    "originalPackagingSha256": "39fe16ffdeb029b441b53e2aaf31c31e51b87ee5563d3a5e8e09d49ef212849b",
    "reviewedCurrentSourceSha256": "f0e667471fd08093fe068414f28423f5b6bf2162c93735892f003f0cf31aa614",
    "originalProtectedSourceSha256": "bd16c7940f7db971db2e0d0d548d8cf3f5f216a7109980820ec4b39ac47bb2bb",
    "reviewedSpans": [
      {
        "label": "b03-top",
        "marker": "REVIEWED_A3_STAGE1_SPAN_0",
        "start": 1297,
        "end": 6107,
        "sha256": "c48c99a3ac36d51e9984827966dd8e6b89b31db4dde99507c12e4bb939c9a31e"
      },
      {
        "label": "b03-reconstruct-intro",
        "marker": "REVIEWED_A3_STAGE1_SPAN_1",
        "start": 17273,
        "end": 17294,
        "sha256": "4490f1bbd37298f13d66dfa9be6aaf29c78a6d4d2da0052252ecd25ad775ee22"
      }
    ]
  },
  "urinary-b04": {
    "originalCanonicalGitBlob": "1822e21a6feefe73b7c4ecd93a5d36dc249604d1",
    "originalPackagingSha256": "78f5fe953d94a197959cdfb2464200efd9ea2af93b9b7988027bdde6a50f07e1",
    "reviewedCurrentSourceSha256": "0c18ca9d4efdc7d6a17cebc5fdd3481cfb20662733915e2d450b67dceb9ed516",
    "originalProtectedSourceSha256": "f1b76fa7d40d7c8d642811a195715d234d69a9ad305fdf825394676b954e834b",
    "reviewedSpans": [
      {
        "label": "b04-top",
        "marker": "REVIEWED_A3_STAGE1_SPAN_0",
        "start": 1325,
        "end": 6118,
        "sha256": "c3d822e444784ae4e4e79eb22ccf0794c13dfbfcabc8beca3833a062ae3ed119"
      },
      {
        "label": "b04-reconstruct-intro",
        "marker": "REVIEWED_A3_STAGE1_SPAN_1",
        "start": 16701,
        "end": 16728,
        "sha256": "11a3dd7bbdcb9478ea2e70829912feee7ee7720d54ba1418f43332203f505620"
      },
      {
        "label": "b04-reconstruct-severity",
        "marker": "REVIEWED_A3_STAGE1_SPAN_2",
        "start": 16770,
        "end": 16812,
        "sha256": "9619baddab688aa5b696c92949b3ec8b889de9a4635af3e9e328b5043264af93"
      },
      {
        "label": "non-model-03",
        "marker": "REVIEWED_A3_STAGE1_SPAN_3",
        "start": 19526,
        "end": 19566,
        "sha256": "7eb05c380e94f36a01b32527ebc4b6750c674eb6df6ba4ed0953b271002b1b9f"
      }
    ]
  },
  "urinary-b05": {
    "originalCanonicalGitBlob": "676649c373408f24d34d096c5ec2afcc51867af6",
    "originalPackagingSha256": "2039d5e60b4e04ec74bdcfc882e500e7f5442d58f63be7ffdfdc0359af5a1912",
    "reviewedCurrentSourceSha256": "da6f1e581217c84d34c55d9c1cf04e6834fb4cc116780b12b5598a03f2a9c874",
    "originalProtectedSourceSha256": "9373a7dcadcfb9b5c325bad37455bfc6843af70fa48305afc662c0236c3fdf92",
    "reviewedSpans": [
      {
        "label": "b05-top",
        "marker": "REVIEWED_A3_STAGE1_SPAN_0",
        "start": 1776,
        "end": 7419,
        "sha256": "c984c4383c2d27f78d278e067b44f7de07b1455b46fc3089b22056d2e4655fe5"
      },
      {
        "label": "b05-reconstruct-intro",
        "marker": "REVIEWED_A3_STAGE1_SPAN_1",
        "start": 20819,
        "end": 20845,
        "sha256": "a20bb9c7bab900632e3c2d1fe8b58ebfefa9f3d313e9b4ffb08261a86cd53429"
      },
      {
        "label": "b05-reconstruct-parallel",
        "marker": "REVIEWED_A3_STAGE1_SPAN_2",
        "start": 21103,
        "end": 21137,
        "sha256": "342e146d31e8d3f0e2b6eb6577a61c5dcd4e2a9f2af0c43e2b64b2c289b119a3"
      }
    ]
  }
};

const a3ReviewedLearningChanges = [
  {
    "path": "blocks/urinary-b01/recall_spine",
    "before": "任务/空间 → 内分泌/球旁器 → 肾单位血管 → 清除率 → 自身调节/TGF → 排尿",
    "after": "血路继续回血；滤液沿小管形成终尿，重吸收/分泌跨接两流；灌注与致密斑 NaCl 反馈调入球/肾素，内分泌并行输出；血液与尿液测量反推处理，终尿接排尿反射。"
  },
  {
    "path": "blocks/urinary-b01/logic_groups/urinary-b01-lg01/goal",
    "before": "先建立血液→滤过→小管处理→终尿总方向。",
    "after": "建立继续回血的血路与沿小管成尿的管液路线，并把滤过、重吸收、分泌放在两流之间。"
  },
  {
    "path": "blocks/urinary-b01/logic_groups/urinary-b01-lg04/closure",
    "before": "能由清除率关系判断净重吸收/分泌并区分主要流量指标。",
    "after": "在自由滤过、无肾内生成代谢且测量可靠的条件下，用 C 与 GFR 判断净重吸收/分泌，并区分主要流量指标。"
  },
  {
    "path": "blocks/urinary-b02/recall_spine",
    "before": "屏障选择性 → 有效滤过压 → RPF/Kf → 阻力修饰 → 滤得少vs筛网漏",
    "after": "屏障选择性与滤出体积并行；入/出球、囊压及胶体压改 Starling 合力，RPF 改沿程蛋白浓缩，Kf 改壁能力；若净滤过压到零才有平衡点；尿成分/GFR 证据回定位，允许多轴同变。"
  },
  {
    "path": "blocks/urinary-b02/logic_groups/urinary-b02-lg02/goal",
    "before": "沿Starling力、滤过平衡、RPF与Kf建立滤多少模型。",
    "after": "沿 Starling 力、RPF 对沿程压力的影响与 Kf 建立滤多少模型；仅达到净滤过压为零时讨论滤过平衡。"
  },
  {
    "path": "blocks/urinary-b02/logic_groups/urinary-b02-lg04/goal",
    "before": "把多个变量压成第一故障层。",
    "after": "用同一模型定位压力、流量、Kf 与选择性，允许病例同时改变多个变量。"
  },
  {
    "path": "blocks/urinary-b03/recall_spine",
    "before": "膜方向/球管平衡 → 近端回收 → 排酸 → 集合管Na-K-H → 利尿剂靶点",
    "after": "管腔—上皮—间质/血侧固定膜方向；管液沿近端→袢→远曲→集合管，各段回收/分泌；球管平衡随条件调近端回收，管球反馈另返滤过端；药物回到各段靶点并改变下游盐水/K/H，K-H 按情境推断。"
  },
  {
    "path": "blocks/urinary-b04/recall_spine",
    "before": "容量/灌注 → RAAS/ADH/ANP肾端 → 梯度建立/维持 → 管液电影 → 浓缩失败/多尿",
    "after": "管液沿袢降支失水、升支/远曲失盐；NaCl/尿素建梯度，直小血管保梯度，ADH/AQP2 沿可用梯度回水；交感、RAAS、ADH、ANP 各读输入并行反馈；终尿证据回查梯度、水门与溶质负荷。"
  },
  {
    "path": "blocks/urinary-b04/logic_groups/urinary-b04-lg04/closure",
    "before": "能讲出先浓后稀、最终由ADH决定的完整电影。",
    "after": "能沿管液讲出先浓后稀，并在髓质梯度可用且集合管水通路相应改变时，解释 ADH 怎样改变最终尿渗。"
  },
  {
    "path": "blocks/urinary-b05/recall_spine",
    "before": "五变量/脱水 → 高钾 → 低钾/补钾 → B3 K-H → Ca → 四层酸碱 → expected compensation → AG/delta",
    "after": "同一病例并行判断容量/张力、Na、K/Ca 与酸碱并持续处理危险；水钠相对变化决定水移，K 总量/分布和离子 Ca 改变膜效应；处置回作用于变量；血气→expected、代酸→AG/白蛋白、HAGMA→delta 用于诊断，K-H 调用 B3。"
  },
  {
    "path": "blocks/urinary-b05/logic_groups/urinary-b05-lg02/closure",
    "before": "能解释为什么先保心以及每种措施改变哪一层。",
    "after": "能按心脏危险评估保心需要，并区分稳定心肌、转 K 入细胞与真正排 K 的任务及各自条件。"
  }
];

const a3ReviewedOwnerChanges = [
  {
    "id": "a3-b01-lg04-precision",
    "before": "74f4b323b9aceb10da28436afe5314950316d7c4a8cc3484c9326ff6d8fef3ac",
    "after": "8a9258d5eb1219ab8d395fff70a602a022b661a5e25c858c8e79479a0a1d25a8"
  },
  {
    "id": "a3-b01-kp14-precision",
    "before": "f30ffc38462590a3983158ef9a4b8623b0006258a596089837635ae626586aba",
    "after": "e8467a0e4658225b6df7b32a7dd5611a982017c05d5a4241a08afee67e5abae9"
  },
  {
    "id": "a3-b02-kp04-precision",
    "before": "55cbb42a8079f54e022722a77f90af5dae33e635de6007333c67d00b0b11a5ca",
    "after": "a337b6952d9f7697037a28ea3d379a0032c278f63f87470874d188c47938ff0e"
  },
  {
    "id": "a3-b03-lg05-precision",
    "before": "67e1464b93195dfb74f9e6e418221732e96cb35cb2c192620bfe7cd5a892a7f2",
    "after": "882e806372aae58988dca52d166ccc4fabdadd80749d66718d6f5fa71a4cae8f"
  },
  {
    "id": "a3-b04-lg03-precision",
    "before": "0d0130507056c7d561f5cb505b5f9105fc94d28bc0fc067277e147f861db905b",
    "after": "2d7971f06b3cc5efb0c04666971d392b05c54f1ffd5c959560ede3d9a1dffc06"
  },
  {
    "id": "a3-b04-kp05-precision",
    "before": "a834b456b6199f4ed69a37cb3dc242ee3aca7b5504fde9e7fdeec35910925787",
    "after": "10c5752ca51274119fe15020e8270ba5cac911d748be064350da266853241bef"
  },
  {
    "id": "a3-b05-lg06-precision",
    "before": "fb4929d0e9354e79677bbe8c632a5556d1b9ff1c7f79c889df538d154ea63fc8",
    "after": "cd4ab127287d541b8c3fd01177657672f244ada4e3b7c166e560109aac85d71c"
  },
  {
    "id": "a3-b05-kp13-precision",
    "before": "3f23a8fbc3de1c052823fc86ccf1fed1c6ca47a98b47356c4adcd1451a67f722",
    "after": "9ece9d56aab277664fadfe1f60704a46bfa74382f1437aed7e3459b719732d4e"
  },
  {
    "id": "a3-b11-lg04-precision",
    "before": "e9f7fc38f924ece1a9795449634c4a2bf779a1029d28e322d2b6ed0315e81715",
    "after": "76d0fa004f95feef469873c02215373bdc7140364c3f62e328997259eac745e3"
  }
];

const a3ReviewedGroupChanges = {
  "urinary-b01": [
    {
      "path": "0/goal",
      "before": "先建立血液→滤过→小管处理→终尿总方向。",
      "after": "建立继续回血的血路与沿小管成尿的管液路线，并把滤过、重吸收、分泌放在两流之间。"
    },
    {
      "path": "3/closure",
      "before": "能由清除率关系判断净重吸收/分泌并区分主要流量指标。",
      "after": "在自由滤过、无肾内生成代谢且测量可靠的条件下，用 C 与 GFR 判断净重吸收/分泌，并区分主要流量指标。"
    }
  ],
  "urinary-b02": [
    {
      "path": "1/goal",
      "before": "沿Starling力、滤过平衡、RPF与Kf建立滤多少模型。",
      "after": "沿 Starling 力、RPF 对沿程压力的影响与 Kf 建立滤多少模型；仅达到净滤过压为零时讨论滤过平衡。"
    },
    {
      "path": "3/goal",
      "before": "把多个变量压成第一故障层。",
      "after": "用同一模型定位压力、流量、Kf 与选择性，允许病例同时改变多个变量。"
    }
  ],
  "urinary-b04": [
    {
      "path": "3/closure",
      "before": "能讲出先浓后稀、最终由ADH决定的完整电影。",
      "after": "能沿管液讲出先浓后稀，并在髓质梯度可用且集合管水通路相应改变时，解释 ADH 怎样改变最终尿渗。"
    }
  ],
  "urinary-b05": [
    {
      "path": "1/closure",
      "before": "能解释为什么先保心以及每种措施改变哪一层。",
      "after": "能按心脏危险评估保心需要，并区分稳定心肌、转 K 入细胞与真正排 K 的任务及各自条件。"
    }
  ]
};

const a3ReviewedDescriptorChanges = {
  "urinary-b01": [
    {
      "path": "revisionWitness/kps/urinary-b01-kp14",
      "before": "36ab5d37d74b68dfe4cf61226d1dc5878c7d781b436433a18eb9907e5683c6f7",
      "after": "353c07b4a284fad04fe9b6571f6e839304c5d4fe846046c2d4c3068dae7cd849"
    },
    {
      "path": "revisionWitness/groups/urinary-b01-lg01",
      "before": "f549188ff9dbf6078587f04530104ad2e5059880f7d4642169384441153b7963",
      "after": "5d4d764e94befd795c8bb6eb7fc88d3ffedd15caf1866c42a0be319c9f1abfbf"
    },
    {
      "path": "revisionWitness/groups/urinary-b01-lg04",
      "before": "9fc0d97913889a438382eb1357234e6b47fe81c5e63131749a2e387646a59a01",
      "after": "f09905304fb335d78a9fcb89fc932ee9b85ed02fef0cebafa5651221bd9e3a0d"
    },
    {
      "path": "revisionWitness/block",
      "before": "91e594269db47b5403f54e9860663eb2044495f21e60f4844a0020b152d0ff66",
      "after": "00cfc91cca355770f9f1711fd720911db757fab446aff6b1db06d29fbbf788f4"
    },
    {
      "path": "precisionCards/0/semanticRevision",
      "before": "9fc0d97913889a438382eb1357234e6b47fe81c5e63131749a2e387646a59a01",
      "after": "f09905304fb335d78a9fcb89fc932ee9b85ed02fef0cebafa5651221bd9e3a0d"
    },
    {
      "path": "precisionCards/1/semanticRevision",
      "before": "36ab5d37d74b68dfe4cf61226d1dc5878c7d781b436433a18eb9907e5683c6f7",
      "after": "353c07b4a284fad04fe9b6571f6e839304c5d4fe846046c2d4c3068dae7cd849"
    }
  ],
  "urinary-b02": [
    {
      "path": "revisionWitness/kps/urinary-b02-kp04",
      "before": "4c5ba84bad8b4fe026ae7897137dbd3158994e31fa1c3981bcbdcf3ba9283eda",
      "after": "ca43bedd8af24d389e3f8e4cda5e389024c8c94d4fa3a3aa8aafec554ad3e5ee"
    },
    {
      "path": "revisionWitness/kps/urinary-b02-kp14",
      "before": "03caf9cd3dcc157e0b2b3af75d45e041735c8b64dd07d542f2bd3a0758076db8",
      "after": "066daa47706d54175b56f5e1eebb7456eebcc60133dc3f60e2df1ae8611542f4"
    },
    {
      "path": "revisionWitness/groups/urinary-b02-lg02",
      "before": "83d51452cd07888db779a6bc9c7f160d2c1bc9716734a1f37d51f5b40bf5c7cd",
      "after": "8db28bc176942716d76d70e53468823b45e31ecf3c068d786fd5fdfa09b765cc"
    },
    {
      "path": "revisionWitness/groups/urinary-b02-lg04",
      "before": "8a17d06e6657a57b8a9539d1bf5294c17e667ad428dbb4c78ee56857e1e93fbc",
      "after": "828d2653f54a87087a72c990f60eacdf318eeb3a1c4a7d6df40e29abf1f88009"
    },
    {
      "path": "revisionWitness/block",
      "before": "af5d17d2c072bad26cba6b38ef381a35a3a3f5747cf7c850d9a2abb722af96f2",
      "after": "6c41f9d380af0ea3a35b987e3868ef94918b6a4ce3a9d3b149726a3047bf8b53"
    },
    {
      "path": "precisionCards/0/semanticRevision",
      "before": "4c5ba84bad8b4fe026ae7897137dbd3158994e31fa1c3981bcbdcf3ba9283eda",
      "after": "ca43bedd8af24d389e3f8e4cda5e389024c8c94d4fa3a3aa8aafec554ad3e5ee"
    }
  ],
  "urinary-b03": [
    {
      "path": "revisionWitness/groups/urinary-b03-lg05",
      "before": "44f1f04e139dae1a1b4458099661215d441083a62bc66a8d8aa612dc638f732e",
      "after": "f5911a3c246236b4292b1540bb4210d3df1768caffa74febac909154226323ef"
    },
    {
      "path": "revisionWitness/block",
      "before": "d15543b0cefe37e896befacd5528f1472ec8ca083a6320cdb72bc6425844702c",
      "after": "b22d2483c6d91fa91b6774cfb75a33f39875541d97399f2af38b3cdd6ef323dd"
    },
    {
      "path": "precisionCards/0/semanticRevision",
      "before": "44f1f04e139dae1a1b4458099661215d441083a62bc66a8d8aa612dc638f732e",
      "after": "f5911a3c246236b4292b1540bb4210d3df1768caffa74febac909154226323ef"
    }
  ],
  "urinary-b04": [
    {
      "path": "revisionWitness/kps/urinary-b04-kp05",
      "before": "9b39b0510162e17346b91ef75e505c94cb68f2341c168b59e971de3a1df07de3",
      "after": "674db8f90c481e6d9aa75bbc018f78278f902cbed208c451a0ddbd0fe674b646"
    },
    {
      "path": "revisionWitness/groups/urinary-b04-lg03",
      "before": "adb3a655b16f3024c4d6ccd1aa42ee36134d036ddd129b5195c69e42a9ff2f2c",
      "after": "da32c837a87a3049e22b4c1f7ba937fa358da654c3775b320eecf94d27d12054"
    },
    {
      "path": "revisionWitness/groups/urinary-b04-lg04",
      "before": "9e17a6e0f0d6f5ab09bb795b23ff40510926fac79bd4102d220ee4c381abd185",
      "after": "7ad64bba6254e5ac4d28a4e9b640d06f9f296a9b0f1a6573607534b8e762617e"
    },
    {
      "path": "revisionWitness/block",
      "before": "052599a3c7fc0672aa51d3faf9b3d8808268b2ff47f8904c770e8f96874e6236",
      "after": "171c94b906c50efde0b57053ebae29eab2df5e6ede60526f9297f851847f51b6"
    },
    {
      "path": "precisionCards/0/semanticRevision",
      "before": "adb3a655b16f3024c4d6ccd1aa42ee36134d036ddd129b5195c69e42a9ff2f2c",
      "after": "da32c837a87a3049e22b4c1f7ba937fa358da654c3775b320eecf94d27d12054"
    },
    {
      "path": "precisionCards/1/semanticRevision",
      "before": "9b39b0510162e17346b91ef75e505c94cb68f2341c168b59e971de3a1df07de3",
      "after": "674db8f90c481e6d9aa75bbc018f78278f902cbed208c451a0ddbd0fe674b646"
    }
  ],
  "urinary-b05": [
    {
      "path": "revisionWitness/kps/urinary-b05-kp13",
      "before": "b7f258a20cbb351935d3c53d8748228f448fb7a6d5a3a0b6fd4a26f76f8d8cef",
      "after": "ab3c3441a42ff2fb7d14675f8b2552754529d9f762137c3357481ac2281309eb"
    },
    {
      "path": "revisionWitness/groups/urinary-b05-lg02",
      "before": "914e996b5c3ff79f65b10249a4de6f1106ab077ec8a487dbbb77fcc2316be58f",
      "after": "45132fb42c16b9630360e052018480e8d9c646a0d5b2c45f17c3b710a465f4bf"
    },
    {
      "path": "revisionWitness/groups/urinary-b05-lg06",
      "before": "64b3347e56656fb6a18566279fdffbc1da9f7515bfa86da012af0647a554d05b",
      "after": "3ffa34808585b94963a5d2e376886aa4c8721467dce220b4805bf0794fb01562"
    },
    {
      "path": "revisionWitness/block",
      "before": "5e888c33fd293d2720cf8072f2af0391addb86146bf569e4d5d817176198bbc4",
      "after": "072832a4f8652d0e874f96add5e7052d3b67ecb94148c1ab58461075a42ef3ff"
    },
    {
      "path": "precisionCards/0/semanticRevision",
      "before": "64b3347e56656fb6a18566279fdffbc1da9f7515bfa86da012af0647a554d05b",
      "after": "3ffa34808585b94963a5d2e376886aa4c8721467dce220b4805bf0794fb01562"
    },
    {
      "path": "precisionCards/1/semanticRevision",
      "before": "b7f258a20cbb351935d3c53d8748228f448fb7a6d5a3a0b6fd4a26f76f8d8cef",
      "after": "ab3c3441a42ff2fb7d14675f8b2552754529d9f762137c3357481ac2281309eb"
    }
  ],
  "urinary-b11": [
    {
      "path": "revisionWitness/groups/urinary-b11-lg04",
      "before": "95ca24b1b6935fb632aac4b6ac0491675514b6824f82f846d29a5cc404a36b66",
      "after": "b116e3e0764d486f1254bb7af6d128e57297686e54d4f955538836c04c8bb91c"
    },
    {
      "path": "precisionCards/0/semanticRevision",
      "before": "95ca24b1b6935fb632aac4b6ac0491675514b6824f82f846d29a5cc404a36b66",
      "after": "b116e3e0764d486f1254bb7af6d128e57297686e54d4f955538836c04c8bb91c"
    }
  ]
};

const a3ReviewedPreentry = {
  "urinary-b01": {
    "originalKpRecordsSha256": "912da9aea20c80e9027082434952bd3d5c827aff47578cdb90da80ccd070caa3",
    "originalNonFrameworkSha256": "d30da7097b07bac5d97c19be7e69eb48de1bdaf2c894abb72591afb19bdb603e",
    "originalNonFrameworkStableSha256": "1af6743be41dec0461bcdf1f1cee000dd41b4fa05e5398fd343061f7040cf53c",
    "originalFrameworkMeta": {
      "present": true,
      "ownerPath": "content/xizong/knowledge/systems/a3-urinary/blocks/泌尿系统_Block1_肾脏总地图_清除率_肾血流与内分泌_学习阅读版_v1_最终执行版.md",
      "anchor": "1｜总 Framework",
      "items": [],
      "markdown": ""
    },
    "reviewedFrameworkItemsSha256": "bcf57e9064ffc0862bf46159864fd78671d630945902191bcdbd589cf4ac58bc",
    "kpChanges": [],
    "nonFrameworkChanges": []
  },
  "urinary-b02": {
    "originalKpRecordsSha256": "d8099f196cd77b674cde19f452ac428a1d33cadf0271c95ffc33e91b34660065",
    "originalNonFrameworkSha256": "c667f5f335c6c17105c8e88186bbf66c2ed1b9e2a22a7a032712b5175cabaf23",
    "originalNonFrameworkStableSha256": "f67863de8492984b6c5f6e250491ba892b1a5239464980f85e2b1fde8011d65f",
    "originalFrameworkMeta": {
      "present": true,
      "ownerPath": "content/xizong/knowledge/systems/a3-urinary/blocks/泌尿系统_Block2_肾小球滤过屏障与GFR_学习阅读版_v1_最终执行版.md",
      "anchor": "1｜总 Framework",
      "items": [],
      "markdown": ""
    },
    "reviewedFrameworkItemsSha256": "851e7ecc3064a69acfc725c78b59a31dc895ea9afe7037253735573e76f253c6",
    "kpChanges": [
      {
        "path": "13/detailMarkdown",
        "before": "> **讲义回看 →** 全 Block；Block 1 肾血流、RAAS、NSAID与 ACEI / ARB 接口。",
        "after": "> **讲义回看 →** 全 Block；Block 1 肾血流、RAAS、NSAID与 ACEI / ARB 接口。  \n\n### 1｜两大入口\n\n#### A. 尿液成分异常\n\n```text\n蛋白尿 / 血尿\n→ 先问滤过屏障选择性是否受损\n→ 大小 / 结构、经典电荷、足细胞 / 裂隙膜\n```\n\n#### B. 原尿量下降\n\n```text\nGFR↓ / 少尿\n→ 先问：\n毛细血管压？\n囊内压？\n血浆胶渗压？\nRPF？\nKf？\n```\n\n### 2｜五类典型场景\n\n| 场景 | 第一故障层 | 主链 |\n|---|---|---|\n| 蛋白尿 | 屏障选择性 | 大小 / 结构、经典电荷或足细胞 / 裂隙膜异常 → 蛋白限制下降 |\n| 大失血 / 休克 | 灌注 + RPF + 交感 | 毛细血管压↓、RPF↓、Kf↓、重吸收↑ |\n| 尿路结石 / 肿瘤压迫 | 囊内压 | 上游压力↑ → 有效滤过压↓ → GFR↓ |\n| 肾小球肾炎 | Kf + 屏障 | 增生 / 腔闭塞使Kf↓；同时可有成分漏出 |\n| 双肾动脉狭窄 | 入球前灌注 | 依赖AngⅡ收缩出球维持GFR |\n\n### 3｜两类药物接口\n\n#### NSAID\n\n```text\nNSAID\n→ 抑制PGE₂ / PGI₂\n→ 丢失入球小动脉舒张保护\n→ 肾血流与GFR下降接口\n```\n\n尤其在失血、心衰等低有效循环血量状态更危险。完整药物性 AKI 后置 B7。\n\n#### ACEI / ARB\n\n```text\n阻断AngⅡ\n→ 出球小动脉舒张\n→ 肾小球内压↓\n→ GFR↓\n```\n\n双肾动脉狭窄时尤其可能诱发肾衰。\n\n### 4｜早期糖尿病的 Study 边界\n\n本节真题页同时保留两层提示：\n\n- 早期糖尿病肾病可出现高滤过接口；\n- 普通糖尿病早期多尿首先从“滤过葡萄糖增多 → 小管液溶质高 → 渗透性利尿”切入，不能把尿多机械等同于 GFR 增高。\n\n因此第一轮只记：\n\n> **糖尿病多尿主要是小管渗透性利尿模型；若题干明确指向早期糖尿病肾病，再考虑高滤过。**\n\n### 5｜六步病例算法\n\n```text\n第一步：问题是尿成分异常，还是GFR / 尿量异常？\n        ↓\n第二步：若成分异常，先定位大小 / 结构、经典电荷或足细胞 / 裂隙膜\n        ↓\n第三步：若GFR异常，写出有效滤过压公式\n        ↓\n第四步：再检查RPF与滤过平衡点\n        ↓\n第五步：再检查Kf与系膜 / 毛细血管面积\n        ↓\n第六步：最后把交感、RAAS、药物和尿路梗阻放回对应层\n```\n\n---"
      }
    ],
    "nonFrameworkChanges": [
      {
        "path": "memoryRouting/miG/11",
        "before": "RPF通过蛋白浓缩速度移动平衡点；",
        "after": "RPF改变沿程蛋白浓缩与净滤过压；在达到滤过平衡的课程模型中再判断平衡点移动；"
      },
      {
        "path": "memoryRouting/miD/2",
        "before": "与体表面积相关的四个指标；",
        "after": "GFR、心指数、基础代谢率的体表面积口径与肺比顺应性按肺容积/FRC校正的区别；"
      }
    ]
  },
  "urinary-b03": {
    "originalKpRecordsSha256": "bc9363093d0518e22611bf30bb5938dd49463d6a70cd4119bc0cb16b3cf40be4",
    "originalNonFrameworkSha256": "9226c7ad50f9222af262ac5f22eda9a8c5798012ece2ce1c2040c804a07cbf3e",
    "originalNonFrameworkStableSha256": "2c1b81af62349192e366350539fefd4f076768104b5a5bfa997dcddc92bcb50e",
    "originalFrameworkMeta": {
      "present": true,
      "ownerPath": "content/xizong/knowledge/systems/a3-urinary/blocks/泌尿系统_Block3_分段小管转运与利尿剂_学习阅读版_v1_最终执行版.md",
      "anchor": "1｜总 Framework",
      "items": [],
      "markdown": ""
    },
    "reviewedFrameworkItemsSha256": "efcccdaa308b1e57cd791657b190e1348ee5c66873a785e0ae8b524300c8b378",
    "kpChanges": [],
    "nonFrameworkChanges": []
  },
  "urinary-b04": {
    "originalKpRecordsSha256": "f57099399bdbc6f00c9ff5d651ac88836da93b05f91893b92974db26818efac2",
    "originalNonFrameworkSha256": "b6470436aa658eb367746d2c62027b2375a6b11a0c29e18e1c3085091ca4a1ae",
    "originalNonFrameworkStableSha256": "3020bce28a678bf0611618c90f18131b46275dfa9f0e8efe50da521dd9e04b45",
    "originalFrameworkMeta": {
      "present": true,
      "ownerPath": "content/xizong/knowledge/systems/a3-urinary/blocks/泌尿系统_Block4_容量激素与尿液浓缩稀释_学习阅读版_v1_最终执行版.md",
      "anchor": "1｜总 Framework",
      "items": [],
      "markdown": ""
    },
    "reviewedFrameworkItemsSha256": "f43ccdc699568dc7f3290447355405f31ca8577f7c35f63abba0879769ab4602",
    "kpChanges": [],
    "nonFrameworkChanges": []
  },
  "urinary-b05": {
    "originalKpRecordsSha256": "748384cc9523544d9d7cc812b830508cb76c8d34e37a4c4de638c61550aea048",
    "originalNonFrameworkSha256": "8d72edda1f078f1c708f7ad1afcf1bea9c4b2786d7041ace14542bd272662413",
    "originalNonFrameworkStableSha256": "92e9e46e83aa40e9816dbdcf16e06aa34f5302f6eaf97aada36b48e92829bea8",
    "originalFrameworkMeta": {
      "present": true,
      "ownerPath": "content/xizong/knowledge/systems/a3-urinary/blocks/泌尿系统_Block5_水钠钾钙与酸碱整合_学习阅读版_v1_最终执行版.md",
      "anchor": "1｜总 Framework",
      "items": [],
      "markdown": ""
    },
    "reviewedFrameworkItemsSha256": "39c9c64838d19904a930449beebdb08611f3e3a1af412614b2a4e28f49b5d0d1",
    "kpChanges": [],
    "nonFrameworkChanges": []
  }
};

function a3ReplaceOnce(text, before, after) {
  assert.equal(text.split(before).length - 1, 1, 'unique explicitly reviewed A3 value');
  return text.replace(before, after);
}

function a3BeforeExactChanges(value, changes, label) {
  const comparison = structuredClone(value);
  for (const change of changes || []) {
    const keys = change.path.split('/');
    const actual = keys.reduce((owner, key) => owner?.[key], value);
    assert.equal(actual, change.after, label + '/' + change.path + ': exact reviewed current value');
    assert.notEqual(change.after, change.before);
    const parent = keys.slice(0, -1).reduce((owner, key) => owner[key], comparison);
    parent[keys.at(-1)] = change.before;
  }
  return comparison;
}

export function assertReviewedA3Source(source, blockId, originalCanonicalGitBlob = null) {
  const reviewed = a3ReviewedSources[blockId];
  if (!reviewed) return false;
  if (originalCanonicalGitBlob) assert.equal(originalCanonicalGitBlob, reviewed.originalCanonicalGitBlob);
  assert.equal(a2TestSha(source), reviewed.reviewedCurrentSourceSha256, blockId + ': reviewed complete current source');
  let comparison = source;
  const ranges = [...reviewed.reviewedSpans].sort((a, b) => b.start - a.start);
  for (const [i, range] of ranges.entries()) {
    assert.ok(range.start >= 0 && range.end > range.start);
    if (i) assert.ok(range.end <= ranges[i - 1].start, blockId + ': disjoint named review spans');
    assert.equal(a2TestSha(source.slice(range.start, range.end)), range.sha256, blockId + ': reviewed ' + range.label);
    comparison = comparison.slice(0, range.start) + range.marker + comparison.slice(range.end);
  }
  assert.equal(a2TestSha(comparison), reviewed.originalProtectedSourceSha256,
    blockId + ': all original bytes outside the named model, consistency and heading-recovery spans');
  return true;
}

export function a3LearningBeforeModelReview(source) {
  const learning = JSON.parse(source);
  let historical = source;
  for (const change of a3ReviewedLearningChanges) {
    assert.equal(change.path.split('/').reduce((owner, key) => owner?.[key], learning), change.after,
      change.path + ': current reviewed Learning meaning');
    assert.notEqual(change.after, change.before);
    historical = a3ReplaceOnce(historical, JSON.stringify(change.after), JSON.stringify(change.before));
  }
  return historical;
}

export function a3CuesBeforeOwnerReview(source) {
  const index = JSON.parse(source);
  let historical = source;
  for (const change of a3ReviewedOwnerChanges) {
    const rows = index.precision_index.filter(row => row.id === change.id);
    assert.equal(rows.length, 1, change.id + ': original existing admission');
    assert.equal(rows[0].prepared_memory_ref.owner_sha256, change.after, change.id + ': actual reviewed owner witness');
    assert.notEqual(change.after, change.before);
    historical = a3ReplaceOnce(historical, JSON.stringify(change.after), JSON.stringify(change.before));
  }
  return historical;
}

export function a3GroupsBeforeModelReview(block) {
  return a3BeforeExactChanges(block.logicGroups, a3ReviewedGroupChanges[block.blockId], block.blockId + ': groups');
}

export function a3PreentryBeforeModelReview(current, blockId) {
  return a3BeforeExactChanges(current, a3ReviewedPreentry[blockId]?.nonFrameworkChanges, blockId + ': Memory Routing');
}

export function assertReviewedA3Preentry(block, current, source) {
  const reviewed = block.systemId === 'urinary' && a3ReviewedPreentry[block.blockId];
  if (!reviewed) return false;
  assertReviewedA3Source(source, block.blockId);
  const records = a3BeforeExactChanges(block.kpRecords, reviewed.kpChanges, block.blockId + ': native Core');
  for (const change of reviewed.kpChanges) {
    assert.equal(block.blockId, 'urinary-b02');
    assert.equal(change.path, '13/detailMarkdown');
    assert.equal(block.kpRecords[13].kpId, 'urinary-b02-kp14');
  }
  assert.equal(a2TestSha(JSON.stringify(records)), reviewed.originalKpRecordsSha256,
    block.blockId + ': all original native records except exact original-body reading recovery');
  const { framework, ...other } = a3PreentryBeforeModelReview(current, block.blockId);
  assert.equal(a2TestSha(JSON.stringify(other)), reviewed.originalNonFrameworkSha256);
  assert.equal(a2TestDigest(other), reviewed.originalNonFrameworkStableSha256);
  assert.deepEqual({ ...framework, items: [], markdown: '' }, reviewed.originalFrameworkMeta);
  assert.equal(a2TestSha(JSON.stringify(framework.items)), reviewed.reviewedFrameworkItemsSha256);
  // Independent Markdown heading ownership checks the complete authored
  // Framework, including B5's nested natural model, with no regex truncation.
  let offset = 0;
  const headings = [];
  for (const token of marked.lexer(source, { gfm: true })) {
    const start = source.indexOf(token.raw, offset);
    assert.ok(start >= offset, 'independent Markdown token belongs to exact source');
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
