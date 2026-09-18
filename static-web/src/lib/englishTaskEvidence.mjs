// English task identity and provenance guards; NOT a persistence backend.
// All bytes remain in the existing task-owned private stores. Durable recovery
// outside the disposable Current mirror is owned by the shared platform.
export function englishTaskFingerprint(context) {
  return String(context?.sourceHashes?.renderedObject || context?.sourceHash || '');
}
export function englishTaskIdentity(context) { return String(context?.objectId || context?.id || ''); }
export function assertEnglishTaskEvidence(raw, context) {
  if (raw == null) return null;
  let value;
  try { value = JSON.parse(raw); } catch { throw new Error('ENGLISH_EVIDENCE_RECOVERY_REQUIRED: invalid JSON; original bytes retained'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('ENGLISH_EVIDENCE_RECOVERY_REQUIRED: invalid object; original bytes retained');
  const binding=value.evidence_binding;
  if (value.firstDraft && (value.version !== 1 || value.taskId !== englishTaskIdentity(context))) throw new Error('ENGLISH_EVIDENCE_SCHEMA_MISMATCH');
  if (value.firstSubmittedAt && value.firstAttempts && (value.version !== 2 || (context?.prompts || []).some(p=>!(p.id in value.firstAttempts)))) throw new Error('ENGLISH_EVIDENCE_SEGMENTS_CHANGED');
  if (binding && (binding.object_id !== englishTaskIdentity(context) || binding.content_revision !== englishTaskFingerprint(context))) {
    throw new Error('ENGLISH_EVIDENCE_CONTENT_CHANGED: saved attempt belongs to a different task revision; original bytes retained');
  }
  // Legacy records remain readable, but must not be retrospectively represented
  // as having been produced against today's source revision.
  return value;
}
export function bindEnglishTaskEvidence(value, context, priorRaw=null) {
  const prior=assertEnglishTaskEvidence(priorRaw,context);
  const next=structuredClone(value);
  const hasPriorOutput=prior && (prior.submitted || prior.firstSubmittedAt || prior.firstDraft || Object.values(prior.answers||{}).some(Boolean) || Object.values(prior.drafts||{}).some(Boolean) || prior.draftEssay);
  if (prior?.evidence_binding) next.evidence_binding=structuredClone(prior.evidence_binding);
  else if (hasPriorOutput) next.legacy_source_binding='UNVERIFIED';
  else if (englishTaskFingerprint(context) && englishTaskIdentity(context)) next.evidence_binding={
    object_id:englishTaskIdentity(context),content_revision:englishTaskFingerprint(context),
    // Context contains task material, not answers/reference or learner diagnosis.
    task_context:structuredClone(context)
  };
  return next;
}
export function guardEnglishTaskEvidence(root, storage, key, context) {
  try { assertEnglishTaskEvidence(storage.getItem(key),context); return true; }
  catch (error) {
    // Do not allow a blank/reset UI to overwrite unreadable or version-mismatched
    // evidence. A portable raw export remains available without changing it.
    root.inert=true;
    const panel=document.createElement('section');panel.setAttribute('role','alert');
    const text=document.createElement('p');text.textContent='这份学习记录需要恢复或核对内容版本，原始记录没有被覆盖。';
    const save=document.createElement('button');save.type='button';save.textContent='导出原始记录';
    save.addEventListener('click',()=>{const blob=new Blob([storage.getItem(key)||''],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='english-evidence-recovery.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
    panel.append(text,save);root.before(panel);root.dataset.evidenceRecovery='required';
    console.warn(String(error));return false;
  }
}
// Cross-mode material exposure is derived from existing evidence, never from
// Content's initial exposure_state, absence of a browser record, or a page count.
export function englishMaterialExposure(storage, objectId) {
  const observations=[];
  const add=(source,value,at)=>{if(value===objectId)observations.push({source,at:at||null});};
  for(let i=0;i<storage.length;i++){
    const key=storage.key(i);if(!key||!/^kianos-(reading-attempt|cloze-attempt|reading-b-attempt|translation-attempt|writing-runtime|english-exam)/.test(key))continue;
    let state;try{state=JSON.parse(storage.getItem(key)||'null');}catch{continue;}
    if(!state)continue;
    if(state.schema==='kianos.english.exam-session.v1'){
      for(const capture of Object.values(state.captures||{}))add(key,capture.object_id,capture.saved_at||capture.completed_at);
    } else if(key.includes('english-exam-task-v1:')) {
      if(key.endsWith(':'+objectId))add(key,objectId,state.startedAt||state.firstSubmittedAt||state.submittedAt||state.createdAt);
    } else if(key.endsWith(':'+objectId)) {
      if(state.startedAt||state.firstSubmittedAt||state.firstDraft||state.submitted||Object.values(state.answers||{}).some(Boolean)||Object.values(state.drafts||{}).some(Boolean))add(key,objectId,state.startedAt||state.firstSubmittedAt||state.submittedAt);
    }
  }
  return {object_id:objectId,state:observations.length?'EXPOSED':'UNKNOWN',observations};
}

export function englishReturnBinding(record, repair = false) {
  const attempt = String(record?.firstSubmittedAt || record?.submittedAt || '');
  if (!attempt) throw new Error('ENGLISH_RETURN_FIRST_ATTEMPT_REQUIRED');
  return {
    attemptSubmittedAt: attempt,
    contentRevision: record?.evidence_binding?.content_revision || null,
    ...(repair ? { regenerationSubmittedAt: record?.regenerationSubmittedAt || '' } : {})
  };
}
export function assertEnglishReturnBinding(payload, record, repair = false) {
  const expected=englishReturnBinding(record,repair);
  for (const [key,value] of Object.entries(expected)) {
    if (payload?.[key] !== value || (key==='regenerationSubmittedAt' && !value)) {
      throw new Error('ENGLISH_RETURN_STALE_EVIDENCE:'+key);
    }
  }
}
export function sameEnglishReturn(a,b) {
  const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
  return !!a && !!b && JSON.stringify(stable(a))===JSON.stringify(stable(b));
}
