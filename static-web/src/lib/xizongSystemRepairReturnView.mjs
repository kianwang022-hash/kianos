import { readXizongMemoryStorage } from './xizongMemoryModel.mjs';
import { validateXizongSystemWuReturn } from './xizongSystemWuReturn.mjs';

// Read-only presentation of a saved Return. Never replay it to recover links:
// current attempts may have advanced, and completed repairs must stay complete.
export function readXizongSystemRepairReturnView(storage, systemId) {
  let saved, packet;
  try {
    const raw = storage.getItem(`kianos:xizong:system-repair-return:${systemId}:v1`);
    if (raw === null) return { kind: 'none' };
    saved = JSON.parse(raw);
    packet = validateXizongSystemWuReturn(saved?.return_packet, systemId);
    if (saved.return_id !== packet.return_id) throw new Error('RETURN_IDENTITY');
  } catch {
    return { kind: 'unreadable' };
  }
  const rows = Object.fromEntries(packet.plan.map(row => [row.question_id, { state: 'UNCONFIRMED' }]));
  const result = { kind: 'saved', plan: packet.plan, rows };
  const receipt = saved.receipt;
  if (receipt?.return_id !== packet.return_id || receipt?.system_id !== systemId
      || receipt.status !== 'APPLIED' || !Array.isArray(receipt.repair_tasks)
      || !Array.isArray(saved.repair_task_ids) || !Array.isArray(saved.unmapped_question_ids)
      || !Array.isArray(receipt.unmapped_question_ids)) return result;
  const unmapped = new Set(receipt.unmapped_question_ids);
  for (const row of packet.plan) {
    if (unmapped.has(row.question_id) && saved.unmapped_question_ids.includes(row.question_id)) {
      rows[row.question_id] = { state: 'UNMAPPED' };
    }
  }
  let memory;
  try { memory = readXizongMemoryStorage(storage); } catch { return result; }
  // Task IDs are deterministic and may be reused by a later Return. The receipt
  // binds the original occurrence; sourceQuestionIds binds the original row.
  const tasks = memory.repairTasks.filter(task => task && typeof task === 'object');
  for (const row of packet.plan) {
    if (rows[row.question_id].state === 'UNMAPPED') continue;
    const matches = tasks.filter(task => task.systemId === systemId
      && Array.isArray(task.sourceQuestionIds) && task.sourceQuestionIds.includes(row.question_id)
      && saved.repair_task_ids.includes(task.id)
      && receipt.repair_tasks.some(proof => proof && proof.task_id === task.id
        && proof.created_at && proof.created_at === task.createdAt
        && proof.block_id === task.blockId && proof.kp_id === task.kpId
        && proof.origin === 'SYSTEM_WU_CHAT_RETURN' && proof.origin === task.origin
        && String(proof.diagnostic_axis || '') === String(task.diagnosticAxis || '')
        && String(task.diagnosticAxis || '') === String(row.diagnostic_axis || '')));
    if (matches.length !== 1) continue;
    const task = matches[0];
    if (task.status === 'DONE') rows[row.question_id] = { state: 'DONE', task };
    else if (task.status === 'ACTIVE' && typeof task.blockHref === 'string' && task.blockHref.trim()) {
      rows[row.question_id] = { state: 'ACTIVE', task };
    }
  }
  return result;
}
