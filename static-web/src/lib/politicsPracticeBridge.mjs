import { PRACTICE_KEYS } from './politicsPracticeClient.mjs';

export function installPoliticsPracticeBridge() {
  const node = document.querySelector('[data-practice-bridge-config]');
  if (!node) return;
  const { configs, base } = JSON.parse(node.textContent);
  node.remove();
  for (const config of configs) {
    const source = document.getElementById(config.source_anchor);
    if (!source || !config.expected_question_ids.length) continue;
    const link = document.createElement('a');
    link.dataset.practiceUnitEntry = config.unit_key;
    link.href = `${base}politics/practice/?unit=${encodeURIComponent(config.unit_key)}`;
    link.textContent = '在工作台做本单元配套题 →';
    link.style.cssText = 'display:block;margin-top:12px;font-size:15px;color:#246a55;font-weight:650';
    source.append(link);
  }
  const params = new URLSearchParams(location.search);
  if (!params.has('practiceSession') && !params.has('practiceQuestion')) return;
  const panel = document.querySelector('[data-practice-return]');
  panel.hidden = false;
  const link = panel.querySelector('[data-practice-exact-return]');
  try {
    const session = JSON.parse(localStorage.getItem(PRACTICE_KEYS.session) || 'null');
    const id = params.get('practiceQuestion');
    const config = configs.find((c) => c.expected_question_ids.includes(id));
    if (!config || session?.runtimeVersion !== 2 || params.get('practiceSession') !== session.id || session.ids?.[session.index] !== id || !['active', 'paused'].includes(session.status)) throw new Error('返回目标已过期；原题组未被替换，请回工作台核对。');
    link.href = `${base}politics/practice/?session=${encodeURIComponent(session.id)}&question=${encodeURIComponent(id)}`;
  } catch (e) {
    link.hidden = true;
    panel.querySelector('[data-practice-return-error]').textContent = e.message;
  }
}
