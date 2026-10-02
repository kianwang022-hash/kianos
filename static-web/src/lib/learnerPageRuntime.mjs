// Loaded only by a learner-capable page. Importing browserLearnerWriter starts
// its existing recovery/lease lifecycle; never import this from pure UI helpers.
import { learnerWriterReady } from './browserLearnerWriter.mjs';
import { initStudyTimerRuntime } from './studyTimerClient.mjs';
import { initStudyTimerDock } from './studyTimerDockClient.mjs';
import { initPrivateCheckpointAutosave } from './privateCheckpointRuntime.mjs';
import { initPrivateControlRuntime } from './privateControlRuntime.mjs';

export async function initLearnerPageRuntime() {
  await learnerWriterReady;
  // Initial checkpoint recovery is complete, and this realm still owns the lease.
  if (document.documentElement.dataset.learnerWriter !== 'active') return;
  const timer = initStudyTimerRuntime();
  const dock = document.querySelector('[data-study-timer-dock]');
  if (dock instanceof HTMLElement) initStudyTimerDock(dock, timer);
  const backup = initPrivateCheckpointAutosave(localStorage);
  const control = initPrivateControlRuntime(localStorage);
  window.addEventListener('kianos:learner-writer-retired', () => {
    backup?.stop(); control?.stop(); timer?.destroy();
  }, {once:true});
}
