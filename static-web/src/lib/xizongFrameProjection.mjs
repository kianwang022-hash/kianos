import { execFileSync } from 'node:child_process';
import path from 'node:path';
let cache;
export function loadXizongFrame(id) {
  if (!cache) {
    const root = process.env.KIANOS_REPO_ROOT || path.resolve(process.cwd(), '..');
    cache = JSON.parse(execFileSync('python3', [path.join(root, 'static-web/scripts/resolve-xizong-frame.py')], {maxBuffer: 32 * 1024 * 1024, encoding: 'utf8'}));
  }
  if (!cache.assets[id]) throw new Error(`XIZONG_FRAME_NOT_CURRENT:${id}`);
  return cache.assets[id];
}
export function xizongFrameView(frame, name) {
  const view = frame.views[name];
  if (!view) throw new Error(`XIZONG_FRAME_VIEW_MISSING:${name}`);
  const ids = new Set([...(view.object_ids || []), ...(view.block_object_ids || [])]);
  return frame.objects.filter(object => ids.has(object.object_id));
}
