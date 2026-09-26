// Local full matrix uses the existing production CI entrypoint.
process.env.STEWARD_QA_OUT ||= '.qa/steward-final';
await import('./test-steward-ui-browser.mjs');
