import { normalizeXizongMemoryState, releaseBlockMemory } from './xizongMemoryModel.mjs';
import { XIZONG_MEMORY_RELEASE_SCHEMA } from './xizongMemoryRelease.mjs';

// Refresh availability already admitted by Block Complete. This consumer never
// reads first-pass study/ratings or imports private annotations from a transport.
export function refreshReleasedXizongMemoryBlock(input, blockId, descriptor, at = null) {
  const state = normalizeXizongMemoryState(input);
  const previous = state.releasedBlocks[blockId];
  if (!previous) return state;
  const invalid = () => { throw new Error(`CURRENT_XIZONG_MEMORY_DESCRIPTOR_INVALID:${blockId}`); };
  if (descriptor?.schema !== XIZONG_MEMORY_RELEASE_SCHEMA || descriptor.blockId !== blockId
    || typeof descriptor.sourceHash !== 'string' || !descriptor.sourceHash
    || descriptor.revisionWitness?.schema !== 'kianos.xizong.content-revision-witness.v1'
    || !Array.isArray(descriptor.coreCards) || !descriptor.coreCards.length
    || !Array.isArray(descriptor.precisionCards)) invalid();
  const ids = new Set();
  for (const [family, cards] of [['core', descriptor.coreCards], ['precision', descriptor.precisionCards]]) {
    for (const card of cards) {
      if (!card || card.blockId !== blockId || typeof card.id !== 'string'
        || !card.id.startsWith(`${family}:`) || ids.has(card.id)
        || (family === 'core' && (!card.kpId || card.id !== `core:${card.kpId}`
          || typeof card.coreHtml !== 'string' || !card.coreHtml.trim()))
        || (state.cards[card.id] && state.cards[card.id].blockId !== blockId)) invalid();
      ids.add(card.id);
    }
  }
  if (previous.sourceHash === descriptor.sourceHash
    && JSON.stringify(previous.revisionWitness || null) === JSON.stringify(descriptor.revisionWitness || null)) return state;
  return releaseBlockMemory(state, {
    ...descriptor, attentionSignals: [], promptOverrides: {}, markedFragments: []
  }, at);
}
