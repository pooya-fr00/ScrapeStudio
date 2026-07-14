import {
  analyzeRepeatedStructures,
  buildRepeatedStructureSnapshot,
  type RepeatedStructureAnalysis,
  type RepeatedStructureSnapshot,
} from '@scrapestudio/extraction-core';
import { SMART_DETECTION_LIMITS } from '@scrapestudio/shared';

import type {
  RepeatedDetectionWorkerRequest,
  RepeatedDetectionWorkerResponse,
} from './worker-protocol';

export type SmartDetectionFallbackReason = 'timeout' | 'worker_error' | 'worker_unavailable';

export interface SmartDetectionResult extends RepeatedStructureAnalysis {
  execution: 'fallback' | 'worker';
  fallbackReason?: SmartDetectionFallbackReason;
}

export interface RepeatedDetectionWorker {
  onerror: ((event: ErrorEvent) => void) | null;
  onmessage: ((event: MessageEvent<RepeatedDetectionWorkerResponse>) => void) | null;
  postMessage: (request: RepeatedDetectionWorkerRequest) => void;
  terminate: () => void;
}

export interface SmartDetectionOptions {
  fallbackAnalyze?: (snapshot: RepeatedStructureSnapshot) => RepeatedStructureAnalysis;
  signal?: AbortSignal;
  timeoutMs?: number;
  workerFactory?: () => RepeatedDetectionWorker | undefined;
}

let nextRequestId = 1;

function createWorker(): RepeatedDetectionWorker | undefined {
  if (typeof Worker === 'undefined') return undefined;
  return new Worker(new URL('./repeated.worker.ts', import.meta.url), {
    name: 'scrapestudio-repeated-structure',
    type: 'module',
  });
}

function abortError(): DOMException {
  return new DOMException('Smart detection was cancelled.', 'AbortError');
}

async function fallbackResult(
  snapshot: RepeatedStructureSnapshot,
  reason: SmartDetectionFallbackReason,
  analyze: (snapshot: RepeatedStructureSnapshot) => RepeatedStructureAnalysis,
): Promise<SmartDetectionResult> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  return { ...analyze(snapshot), execution: 'fallback', fallbackReason: reason };
}

export async function detectRepeatedStructures(
  html: string,
  finalUrl: string,
  options: SmartDetectionOptions = {},
): Promise<SmartDetectionResult> {
  if (options.signal?.aborted) throw abortError();
  const snapshot = buildRepeatedStructureSnapshot(html, finalUrl);
  const fallbackAnalyze = options.fallbackAnalyze ?? analyzeRepeatedStructures;
  let worker: RepeatedDetectionWorker | undefined;
  try {
    worker = (options.workerFactory ?? createWorker)();
  } catch {
    return fallbackResult(snapshot, 'worker_error', fallbackAnalyze);
  }
  if (!worker) return fallbackResult(snapshot, 'worker_unavailable', fallbackAnalyze);

  const requestId = nextRequestId;
  nextRequestId += 1;
  const timeoutMs = Math.max(
    1,
    Math.min(options.timeoutMs ?? SMART_DETECTION_LIMITS.timeoutMs, 2_000),
  );

  return new Promise<SmartDetectionResult>((resolve, reject) => {
    let settled = false;
    const cleanup = () => {
      worker?.terminate();
      options.signal?.removeEventListener('abort', handleAbort);
      clearTimeout(timeout);
    };
    const complete = (result: SmartDetectionResult) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };
    const handleAbort = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(abortError());
    };
    const timeout = setTimeout(() => {
      complete({
        candidates: [],
        execution: 'fallback',
        fallbackReason: 'timeout',
        inspectedNodes: snapshot.nodes.length,
        snapshotTruncated: snapshot.truncated,
      });
    }, timeoutMs);

    options.signal?.addEventListener('abort', handleAbort, { once: true });
    worker.onerror = () => {
      if (settled) return;
      settled = true;
      cleanup();
      void fallbackResult(snapshot, 'worker_error', fallbackAnalyze).then(resolve, reject);
    };
    worker.onmessage = (event) => {
      if (event.data.id !== requestId) return;
      if (!event.data.ok) {
        if (settled) return;
        settled = true;
        cleanup();
        void fallbackResult(snapshot, 'worker_error', fallbackAnalyze).then(resolve, reject);
        return;
      }
      complete({ ...event.data.analysis, execution: 'worker' });
    };
    try {
      worker.postMessage({ id: requestId, snapshot, type: 'analyze' });
    } catch {
      settled = true;
      cleanup();
      void fallbackResult(snapshot, 'worker_error', fallbackAnalyze).then(resolve, reject);
    }
  });
}
