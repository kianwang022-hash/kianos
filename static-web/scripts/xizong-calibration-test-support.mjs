import assert from 'node:assert/strict';
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
