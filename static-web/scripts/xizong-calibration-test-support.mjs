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

export function descriptorAtFrozenPackaging(descriptor, source) {
  const result = structuredClone(descriptor);
  const sourceHash = createHash('sha256').update(beforePromptCalibration(source)).digest('hex');
  // Only these two transport fingerprints may differ. The original frozen
  // descriptor digest still checks every card field and semantic witness.
  result.sourceHash = sourceHash;
  result.revisionWitness.sourceHash = sourceHash;
  return result;
}
