import { analyzeRepeatedStructures } from '@scrapestudio/extraction-core';

import type {
  RepeatedDetectionWorkerRequest,
  RepeatedDetectionWorkerResponse,
} from './worker-protocol';

type WorkerScope = {
  onmessage: ((event: MessageEvent<RepeatedDetectionWorkerRequest>) => void) | null;
  postMessage: (message: RepeatedDetectionWorkerResponse) => void;
};

const workerScope = globalThis as unknown as WorkerScope;

workerScope.onmessage = (event) => {
  const request = event.data;
  if (request.type !== 'analyze') return;
  try {
    workerScope.postMessage({
      analysis: analyzeRepeatedStructures(request.snapshot),
      id: request.id,
      ok: true,
    });
  } catch {
    workerScope.postMessage({ id: request.id, ok: false });
  }
};
