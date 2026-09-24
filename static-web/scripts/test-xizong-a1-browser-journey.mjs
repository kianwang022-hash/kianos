import fs from 'node:fs';
import path from 'node:path';

// A1 Runtime acceptance delegates to the shared Current golden Block journey.
// Git history preserves the retired per-Logic-Group Source-bounce journey;
// Current keeps one executable Source-contact → Recall → Completion path.
await import('./test-xizong-golden-journey.mjs');

const sourcePath = path.resolve(process.cwd(), '.qa/xizong-golden-journey.json');
const outputPath = path.resolve(process.cwd(), '.qa/xizong-a1-browser-runtime.json');
if (!fs.existsSync(sourcePath)) throw new Error('A1_RUNTIME_GOLDEN_REPORT_MISSING');

const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
if (source?.status !== 'PASS' || source?.representative !== 'circulation/b02') {
  throw new Error(`A1_RUNTIME_GOLDEN_REPORT_INVALID:${source?.status || 'unknown'}:${source?.representative || 'unknown'}`);
}

const report = {
  schema: 'kianos.xizong.a1.browser_runtime.v2',
  status: 'PASS',
  scope: 'A1/circulation',
  representative: source.representative,
  proof_owner: 'static-web/scripts/test-xizong-golden-journey.mjs',
  source_contact_mode: source.source_contact_mode || '',
  logic_groups: source.logic_groups ?? null,
  total_kp: source.total_kp ?? null,
  checks: Array.isArray(source.checks) ? source.checks : [],
  completed_at: new Date().toISOString()
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`A1_BROWSER_RUNTIME_PASS | representative=${report.representative} | checks=${report.checks.length}`);
