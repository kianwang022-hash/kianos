export const CURRENT_REFRESH_POLICY_SCHEMA = 'kianos.current-refresh-policy.v1';

export function createCurrentRefreshPolicy() {
  let baselineSha = null;
  let pendingSha = null;

  const validSha = (value) => typeof value === 'string' && value.trim() ? value.trim() : null;

  return {
    schema: CURRENT_REFRESH_POLICY_SCHEMA,

    observe(value) {
      const sha = validSha(value);
      if (!sha) return { status: 'ignored', reload: false, baseline_sha: baselineSha, pending_sha: pendingSha };
      if (baselineSha === null) {
        baselineSha = sha;
        return { status: 'baseline', reload: false, baseline_sha: baselineSha, pending_sha: pendingSha };
      }
      if (sha === baselineSha) {
        return { status: pendingSha ? 'pending' : 'current', reload: false, baseline_sha: baselineSha, pending_sha: pendingSha };
      }
      pendingSha = sha;
      return { status: 'pending', reload: false, baseline_sha: baselineSha, pending_sha: pendingSha };
    },

    onForegroundReturn() {
      if (!pendingSha || pendingSha === baselineSha) {
        return { status: 'current', reload: false, baseline_sha: baselineSha, pending_sha: pendingSha };
      }
      return { status: 'reload', reload: true, baseline_sha: baselineSha, pending_sha: pendingSha };
    },

    snapshot() {
      return { baseline_sha: baselineSha, pending_sha: pendingSha };
    }
  };
}
