"""Materialize the tested, read-only Projection consumer and presentation refinement.
No content, source authority, evidence reducer, or private learner state is written.
"""
from pathlib import Path
import base64, hashlib, subprocess, shutil, zlib
root = Path(__file__).parent
encoded = ''.join((root / f'part{i}.txt').read_text() for i in range(2))
# Correct three known transcription errors in this text-only transport. The
# decoded unified patch must still match its original complete SHA-256 below.
encoded = encoded.replace('IOzitItItp', 'IOzitItp').replace('onFNIc', 'onF/NIc').replace('mrSmSmrLLZ', 'mrSmrLLZ')
patch = zlib.decompress(base64.b64decode(encoded, validate=True))
assert hashlib.sha256(patch).hexdigest() == 'efe9fe9081396c2ee3677b01fd888ec17b0326a4f1f31cea73686bfbd40f610d', 'Corrupt presentation patch'
allowed = {
 'static-web/src/lib/politicsCompiledPresentation.mjs',
 'static-web/src/components/PoliticsProjectionValue.astro',
 'static-web/src/components/PoliticsCompiledGeometry.astro',
 'static-web/src/components/PoliticsChapterRuntime.astro',
 'static-web/src/pages/politics/[subject]/[chapter].astro',
 'static-web/src/styles/politics-presentation.css',
 'static-web/src/styles/xizong-presentation.css',
 'static-web/scripts/audit-politics-xi-projection.mjs',
 'static-web/scripts/audit-politics-ethics-projection.mjs',
 'static-web/scripts/test-politics-functional-journey.mjs',
 'static-web/scripts/test-politics-compiled-presentation.mjs',
}
paths = {line.split(' b/', 1)[1] for line in patch.decode().splitlines() if line.startswith('diff --git ')}
assert paths == allowed, ('Unexpected write set', paths)
subprocess.run(['git', 'apply', '--check', '-'], input=patch, check=True)
subprocess.run(['git', 'apply', '-'], input=patch, check=True)
shutil.rmtree(root)
Path('.github/workflows/visual-projection-materialize.yml').unlink()
