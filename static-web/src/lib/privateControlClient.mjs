import {
  buildPrivateControlReceipt,
  privateControlCommandSignature,
  validatePrivateControlCommand
} from './privateControlCommand.mjs';
import {
  applyPrivateControlCommand,
  readPrivateControlRuntimeState
} from './privateControlRuntime.mjs';
import { studyDayAt } from './studyTimer.mjs';

export const PRIVATE_CONTROL_ENDPOINT = '/__kianos-private/control';

const readHoldoutYears = (storage) => {
  try {
    const value = JSON.parse(storage?.getItem?.('kianos:xizong:full-paper-holdout-years:v1') || '[]');
    return Array.isArray(value) ? value.map(Number).filter(Number.isFinite) : [];
  } catch {
    return [];
  }
};

async function postReceipt(fetchImpl, endpoint, receipt) {
  const response = await fetchImpl(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(receipt)
  });
  if (!response.ok) throw new Error('PRIVATE_CONTROL_RECEIPT_POST_FAILED:' + response.status);
  return response.json().catch(() => ({}));
}

export async function consumePrivateControlOnce(storage, {
  fetchImpl = globalThis.fetch,
  endpoint = PRIVATE_CONTROL_ENDPOINT,
  now = Date.now()
} = {}) {
  if (!storage?.getItem || !storage?.setItem) {
    return { status: 'unavailable', receipt: null, error: 'storage unavailable' };
  }
  if (typeof fetchImpl !== 'function') {
    return { status: 'unavailable', receipt: null, error: 'fetch unavailable' };
  }

  let response;
  try {
    response = await fetchImpl(endpoint + '?t=' + now, { method:'GET', cache:'no-store' });
  } catch (error) {
    return { status:'unavailable', receipt:null, error:error instanceof Error ? error.message : String(error) };
  }
  if (response.status === 404) return { status:'missing', receipt:null, error:null };
  if (!response.ok) return { status:'unavailable', receipt:null, error:'HTTP ' + response.status };

  const body = await response.json().catch(() => null);
  if (!body?.command) return { status:'missing', receipt:null, error:null };

  let command;
  try {
    command = validatePrivateControlCommand(body.command);
  } catch (error) {
    return { status:'invalid', receipt:null, error:error instanceof Error ? error.message : String(error) };
  }

  const expectedDay = studyDayAt(now);
  const signature = privateControlCommandSignature(command);
  let alreadyLocal = false;
  try {
    const runtime = readPrivateControlRuntimeState(storage);
    alreadyLocal = runtime.receipts.some((row) =>
      row?.command_id === command.command_id && row?.command_signature === signature
    );
  } catch (error) {
    return {
      status:'invalid_local_control_state',
      receipt:null,
      error:error instanceof Error ? error.message : String(error)
    };
  }

  let receipt;
  try {
    receipt = applyPrivateControlCommand(storage, command, {
      expectedDay,
      now,
      holdoutYears: readHoldoutYears(storage)
    });
  } catch (error) {
    receipt = buildPrivateControlReceipt(command, {
      status:'ERROR',
      detail:error instanceof Error ? error.message : String(error),
      appliedAt:now
    });
  }

  // A bridge receipt is transport acknowledgement only. Local learner evidence is
  // already committed (or rolled back) by the typed dispatcher before this point.
  try {
    await postReceipt(fetchImpl, endpoint, receipt);
  } catch (error) {
    return {
      status:'receipt_unavailable',
      receipt,
      error:error instanceof Error ? error.message : String(error)
    };
  }

  try {
    if (typeof globalThis.CustomEvent === 'function') {
      globalThis.dispatchEvent?.(new CustomEvent('kianos:private-control-consumed', {
        detail: {
          command_id: receipt.command_id,
          target: receipt.target,
          status: receipt.status,
          command_signature: signature,
          fresh: !alreadyLocal
        }
      }));
    }
  } catch {}

  return { status:alreadyLocal ? 'already_consumed' : 'consumed', receipt, error:null };
}

export function initPrivateControlClient(storage, {
  intervalMs = 2500,
  fetchImpl = globalThis.fetch,
  endpoint = PRIVATE_CONTROL_ENDPOINT,
  now = () => Date.now()
} = {}) {
  if (!['127.0.0.1','localhost'].includes(globalThis.location?.hostname || '')) {
    return { stop() {}, poll() {} };
  }

  let stopped = false;
  let timer = null;
  let inFlight = null;

  const poll = async () => {
    if (stopped) return null;
    if (inFlight) return inFlight;
    inFlight = consumePrivateControlOnce(storage, {
      fetchImpl,
      endpoint,
      now: now()
    }).finally(() => { inFlight = null; });
    return inFlight;
  };

  const schedule = () => {
    if (stopped || timer) return;
    timer = setTimeout(async () => {
      timer = null;
      await poll();
      schedule();
    }, intervalMs);
  };

  void poll();
  schedule();

  const foreground = () => {
    if (globalThis.document?.visibilityState === 'visible') void poll();
  };
  globalThis.addEventListener?.('focus', foreground);
  globalThis.document?.addEventListener?.('visibilitychange', foreground);

  return {
    poll,
    stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
      globalThis.removeEventListener?.('focus', foreground);
      globalThis.document?.removeEventListener?.('visibilitychange', foreground);
    }
  };
}
