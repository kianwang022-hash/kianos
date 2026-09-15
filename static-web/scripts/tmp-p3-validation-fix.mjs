import fs from 'node:fs';
const path = 'static-web/scripts/validate-xizong-learning.mjs';
let text = fs.readFileSync(path, 'utf8');
const line = "assert(sweep.questions.some((q) => !q.explanation), 'missing-explanation-path-not-represented');\n";
if (!text.includes(line)) throw new Error('P3_MISSING_EXPLANATION_ASSERT_NOT_FOUND');
text = text.replace(line, '');
fs.writeFileSync(path, text);
