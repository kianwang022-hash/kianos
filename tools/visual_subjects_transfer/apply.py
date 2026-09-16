"""One-shot transport for the locally built Politics/Xizong presentation patch.
Patch SHA and allowed paths are checked before application. No content/evidence
owners are written. Transport deletes itself after materialization.
"""
from pathlib import Path
import base64, hashlib, subprocess, shutil, zlib
root = Path(__file__).parent
patch = zlib.decompress(base64.b64decode(''.join((root / f'part{i}.txt').read_text() for i in range(4))))
assert hashlib.sha256(patch).hexdigest() == 'e34d2dae2c537ee6716067aded12d88f1f3338051055f3a6a23e88af90b015cd', 'Corrupt transport'
allowed = {
 'static-web/scripts/capture-visual-stage-two.mjs',
 'static-web/src/components/PoliticsChapterPresentation.astro',
 'static-web/src/components/PoliticsChapterRuntime.astro',
 'static-web/src/pages/politics/[subject]/[chapter].astro',
 'static-web/src/pages/politics/index.astro',
 'static-web/src/pages/xizong/index.astro',
 'static-web/src/styles/politics-presentation.css',
 'static-web/src/styles/xizong-presentation.css',
}
paths = {line.split(' b/', 1)[1] for line in patch.decode().splitlines() if line.startswith('diff --git ')}
assert paths == allowed, ('Unexpected write set', paths)
base = Path('static-web/src/layouts/Base.astro')
s = base.read_text()
edits = [
 ("import '../styles/lexical-presentation.css';", "import '../styles/lexical-presentation.css';\nimport '../styles/politics-presentation.css';\nimport '../styles/xizong-presentation.css';"),
 ("const isHub = ['', 'english', 'vocabulary'].includes(localPath);", "const isHub = ['', 'english', 'vocabulary', 'politics', 'xizong'].includes(localPath);"),
 ("const stageOne = isEnglishRoute || active === 'lexical' || localPath === '';", "const stageOne = isEnglishRoute || ['lexical', 'politics', 'xizong'].includes(active) || localPath === '';"),
]
for before, after in edits:
 assert s.count(before) == 1, ('Concurrent Base composition changed', before)
 s = s.replace(before, after)
subprocess.run(['git','apply','--check','-'], input=patch, check=True)
subprocess.run(['git','apply','-'], input=patch, check=True)
base.write_text(s)
# Preserve any concurrently added stage-one composition import and every
# existing runtime script; only the three explicit shell edits above apply.
shutil.rmtree(root)
Path('.github/workflows/visual-subjects-materialize.yml').unlink()
