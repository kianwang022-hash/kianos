from pathlib import Path
R=Path.cwd();p=R/'static-web/src/components/ObjectiveTransferClaims.astro';s=p.read_text()
def rep(a,b,n=1):
 global s
 assert s.count(a)>=n,a[:100];s=s.replace(a,b,n)
rep('<script>\n','''<script>
  import { assertEnglishReturnBinding, sameEnglishReturn } from '../lib/englishTaskEvidence.mjs';
  import { lexicalEventFromObjectiveThread, assertCurrentLexicalTarget } from '../lib/lexicalEnglishEvidence.mjs';
  import { LEXICAL_LEDGER_STORAGE_KEY, appendEvidenceEvent, emptyLexicalLedger, normalizeLexicalLedger, compileRepairTargets } from '../lib/lexicalEvidence.mjs';
''')
rep('if (!(host instanceof HTMLElement)) return;', "if (!(host instanceof HTMLElement)) return;\n    if (new URLSearchParams(location.search).has('exam_session')) return;")
a=s.index('    const persistPair =');b=s.index('    const applyReturn =',a)
s=s[:a]+'''    // Validate the whole return before any mutation. Rollback handles synchronous
    // storage failures, not OS/browser crashes: durable transactions stay shared.
    const persistPair = (nextStore, nextReview, extra = []) => {
      const writes=[[STORE_KEY,JSON.stringify(normalizeStore(nextStore))],[reviewKey,JSON.stringify(nextReview)],...extra];
      const old=writes.map(([key])=>[key,localStorage.getItem(key)]);
      try { for(const [key,value]of writes)localStorage.setItem(key,value);return true; }
      catch { try{for(const [key,value]of old)value===null?localStorage.removeItem(key):localStorage.setItem(key,value);}catch{}return false; }
    };

'''+s[b:]
rep('    const applyReturn = () => {','    const applyReturn = async () => {')
rep('      const handoff = readHandoff();','''      assertEnglishReturnBinding(payload,attempt);
      const previousRaw=localStorage.getItem(reviewKey);
      const previous=previousRaw?JSON.parse(previousRaw):null;
      if(previous?.attemptSubmittedAt===attempt.submittedAt && sameEnglishReturn(previous.returnPayload,payload)) {
        if(status)status.textContent='这份返回已经应用；没有重复写入。';return;
      }
      for(const key of ['threads','newClaims','claimUpdates'])if(!Array.isArray(payload[key]))throw new Error('ENGLISH_RETURN_ARRAY_REQUIRED:'+key);
      const currentItems=new Set(Object.keys(attempt.results||{}));
      const threadIds=new Set();
      for(const thread of payload.threads){
        if(!thread||!VALID_ROUTES.has(thread.route)||!VALID_SCOPES.has(thread.scope)||!thread.threadId||threadIds.has(thread.threadId)||!Array.isArray(thread.itemIds)||!thread.itemIds.length||thread.itemIds.some(id=>!currentItems.has(id))||!String(thread.summary||'').trim())throw new Error('ENGLISH_RETURN_THREAD_INVALID');
        if(thread.repairCompleted===true&&!String(thread.repairEvidence||'').trim())throw new Error('ENGLISH_RETURN_REPAIR_EVIDENCE_REQUIRED');
        threadIds.add(thread.threadId);
      }
      const beforeStore=localStorage.getItem(STORE_KEY);
      const beforeLedger=localStorage.getItem(LEXICAL_LEDGER_STORAGE_KEY);
      let ledger=normalizeLexicalLedger(beforeLedger?JSON.parse(beforeLedger):emptyLexicalLedger());
      const changedWords=new Map();
      for(const [index,thread]of payload.threads.entries()){
        if(thread.route!=='lexical')continue;
        const prepared=lexicalEventFromObjectiveThread({task,objectId,attemptSubmittedAt:attempt.submittedAt,thread,threadIndex:index});
        if(prepared.status!=='READY')throw new Error(prepared.status);
        const event=prepared.event;
        const response=await fetch(`${import.meta.env.BASE_URL}vocabulary/targets/${event.ordinal}.json`,{cache:'no-store'});
        if(!response.ok)throw new Error('LEXICAL_CURRENT_TARGET_UNAVAILABLE');
        const current=await response.json();assertCurrentLexicalTarget(event,current);
        // Positive transfer needs already-recorded private attempt provenance.
        const quality=attempt.evidence_quality||{};
        if(event.outcome==='CORRECT'){
          if(quality.assistance!=='unassisted')delete event.assistance;
          if(!['fresh','unseen'].includes(quality.context_novelty))delete event.context_novelty;
        }
        const result=appendEvidenceEvent(ledger,event);
        if(!['APPENDED','DUPLICATE_IGNORED'].includes(result.status))throw new Error('LEXICAL_EVIDENCE_'+result.status);
        ledger=result.ledger;changedWords.set(event.word_id,event);
      }
      if(readAttempt().submittedAt!==attempt.submittedAt||localStorage.getItem(STORE_KEY)!==beforeStore||localStorage.getItem(LEXICAL_LEDGER_STORAGE_KEY)!==beforeLedger||localStorage.getItem(reviewKey)!==previousRaw)throw new Error('ENGLISH_RETURN_CONCURRENT_CHANGE');
      const lexicalWrites=[];
      if(changedWords.size){
        lexicalWrites.push([LEXICAL_LEDGER_STORAGE_KEY,JSON.stringify(ledger)]);
        const targets=compileRepairTargets(ledger);
        for(const [wordId,event]of changedWords){
          const key='kianos-vocabulary-astro-v2:'+wordId,raw=localStorage.getItem(key);
          const cache=raw?JSON.parse(raw):{revealed:false,repairTargets:{},meta:{word_id:wordId,ordinal:event.ordinal,word:event.word}};
          cache.repairTargets=Object.fromEntries(targets.filter(t=>t.word_id===wordId).map(t=>[t.target_id||`${t.target_kind}:${t.target_locator||''}`,{...t,label:t.target_id||t.target_locator,source:'evidence_reducer',outcome:'ADDED'}]));
          lexicalWrites.push([key,JSON.stringify(cache)]);
        }
      }
      const handoff = readHandoff();
      if(handoff)assertEnglishReturnBinding(handoff,attempt);''')
rep('      const store = readStore();',"      const store = normalizeStore(beforeStore?JSON.parse(beforeStore):{});")
rep("        const freshObject = String(claim?.sourceObjectId || '') !== objectId;", "        const freshObject = String(claim?.sourceObjectId || '') !== objectId;\n        const qualifiedFresh=freshObject && attempt?.evidence_quality?.assistance==='unassisted' && ['fresh','unseen'].includes(attempt?.evidence_quality?.context_novelty) && update.sameDemand===true && !(attempt.history||[]).length;")
rep("claim.status !== 'TRANSFER_PENDING' || !freshObject || !evidence", "claim.status !== 'TRANSFER_PENDING' || !qualifiedFresh || !evidence")
rep('      const activeClaims = claims.filter',"      if(skipped)throw new Error('ENGLISH_RETURN_REJECTED_WHOLE_BUNDLE:'+skipped);\n      const activeClaims = claims.filter")
rep('        importedAt,\n        acceptedUpdates,','        importedAt,\n        attemptSubmittedAt:attempt.submittedAt,\n        returnPayload:payload,\n        acceptedUpdates,')
rep('      if (!persistPair({ version: 1, claims }, nextReview))', '      if (!persistPair({ version: 1, claims }, nextReview,lexicalWrites))')
rep("      root.dispatchEvent(new CustomEvent('kianos:objective-transfer-updated', { bubbles: true }));", "      if(changedWords.size)window.dispatchEvent(new CustomEvent('kianos:lexical-evidence-changed'));\n      root.dispatchEvent(new CustomEvent('kianos:objective-transfer-updated', { bubbles: true }));")
rep("    node.querySelector('[data-transfer-apply]')?.addEventListener('click', applyReturn);", "    node.querySelector('[data-transfer-apply]')?.addEventListener('click', () => applyReturn().catch(error=>{const status=node.querySelector('[data-transfer-status]');if(status)status.textContent='返回未应用，原始记录保留：'+error.message;}));")
rep('          const existing = claims[duplicateIndex];\n          if (existing.status', "          const existing = claims[duplicateIndex];\n          if (existing.task !== task || existing.sourceObjectId !== objectId || existing.sourceThreadId !== sourceThreadId || normalizedStatement(existing.statement)!==normalizedStatement(statement)) throw new Error('ENGLISH_CLAIM_IDENTITY_CONFLICT');\n          if (existing.status")
p.write_text(s)
(R/'static-web/src/components/VocabularyEnglishEvidenceBridge.astro').write_text('''---
// ObjectiveTransferClaims preflights Current lexical identities and applies its
// evidence in the same validated return transaction. No second event writer.
---
<span data-vocab-english-evidence-bridge hidden></span>
''')
