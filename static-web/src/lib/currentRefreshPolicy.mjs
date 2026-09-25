export const CURRENT_REFRESH_POLICY_SCHEMA = 'kianos.current-refresh-policy.v1';

export function createCurrentRefreshPolicy(documentSha = null) {
  const validSha = (value) => typeof value === 'string' && value.trim() ? value.trim() : null;
  let baselineSha = validSha(documentSha);
  const hasDocumentIdentity = baselineSha !== null;
  let pendingSha = null;

  return {
    schema: CURRENT_REFRESH_POLICY_SCHEMA,

    observe(value) {
      const sha = validSha(value);
      if (!sha) return { status: 'ignored', reload: false, baseline_sha: baselineSha, pending_sha: pendingSha };
      if (!hasDocumentIdentity) {
        pendingSha = sha;
        return { status: 'unknown-document', reload: false, baseline_sha: baselineSha, pending_sha: pendingSha };
      }
      if (sha === baselineSha) {
        return { status: pendingSha ? 'pending' : 'current', reload: false, baseline_sha: baselineSha, pending_sha: pendingSha };
      }
      pendingSha = sha;
      return { status: 'pending', reload: false, baseline_sha: baselineSha, pending_sha: pendingSha };
    },

    onForegroundReturn() {
      if (!hasDocumentIdentity || !pendingSha || pendingSha === baselineSha) {
        return { status: 'current', reload: false, baseline_sha: baselineSha, pending_sha: pendingSha };
      }
      return { status: 'reload', reload: true, baseline_sha: baselineSha, pending_sha: pendingSha };
    },

    snapshot() {
      return { baseline_sha: baselineSha, pending_sha: pendingSha };
    }
  };
}
