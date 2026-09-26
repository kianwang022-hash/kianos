import fs from 'node:fs';
import path from 'node:path';
if(process.platform!=='darwin')throw new Error('STEWARD_MAC_VISUAL_REQUIRES_DARWIN');
process.env.STEWARD_QA_OUT='.qa/steward-final';
await import('./test-steward-ui-browser.mjs');
// Derived compatibility names for the existing Mac gate artifact consumer.
fs.copyFileSync(path.join(process.env.STEWARD_QA_OUT,'Today.png'),'.qa/steward-mac.png');
fs.copyFileSync(path.join(process.env.STEWARD_QA_OUT,'report.json'),'.qa/steward-mac-visual.json');
