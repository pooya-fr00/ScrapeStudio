import {
  analyzeRepeatedStructures,
  buildRepeatedStructureSnapshot,
} from '@scrapestudio/extraction-core';
import { describe, expect, it, vi } from 'vitest';

import { DEMO_HTML, DEMO_URL } from '../scrape/demo';
import { detectRepeatedStructures, type RepeatedDetectionWorker } from './detect';
import type {
  RepeatedDetectionWorkerRequest,
  RepeatedDetectionWorkerResponse,
} from './worker-protocol';

class RespondingWorker implements RepeatedDetectionWorker {
  onerror: ((event: ErrorEvent) => void) | null = null;
  onmessage: ((event: MessageEvent<RepeatedDetectionWorkerResponse>) => void) | null = null;
  readonly terminate = vi.fn();

  postMessage(request: RepeatedDetectionWorkerRequest) {
    const response: RepeatedDetectionWorkerResponse = {
      analysis: analyzeRepeatedStructures(request.snapshot),
      id: request.id,
      ok: true,
    };
    queueMicrotask(() => this.onmessage?.(new MessageEvent('message', { data: response })));
  }
}

class SilentWorker implements RepeatedDetectionWorker {
  onerror: ((event: ErrorEvent) => void) | null = null;
  onmessage: ((event: MessageEvent<RepeatedDetectionWorkerResponse>) => void) | null = null;
  readonly terminate = vi.fn();
  postMessage = vi.fn();
}

describe('smart detection worker boundary', () => {
  it('transfers a bounded snapshot to a worker and terminates it after completion', async () => {
    const worker = new RespondingWorker();
    const result = await detectRepeatedStructures(DEMO_HTML, DEMO_URL, {
      workerFactory: () => worker,
    });

    expect(result.execution).toBe('worker');
    expect(result.candidates[0]).toMatchObject({ itemCount: 12, selector: 'article.product-card' });
    expect(worker.terminate).toHaveBeenCalledOnce();
  });

  it('uses the bounded inline fallback when Worker is unavailable', async () => {
    const result = await detectRepeatedStructures(DEMO_HTML, DEMO_URL, {
      workerFactory: () => undefined,
    });

    expect(result.execution).toBe('fallback');
    expect(result.fallbackReason).toBe('worker_unavailable');
    expect(result.candidates[0]?.selector).toBe('article.product-card');
  });

  it('terminates a slow worker at the timeout without running heavy fallback work', async () => {
    const worker = new SilentWorker();
    const fallbackAnalyze = vi.fn(() =>
      analyzeRepeatedStructures(buildRepeatedStructureSnapshot(DEMO_HTML, DEMO_URL)),
    );
    const result = await detectRepeatedStructures(DEMO_HTML, DEMO_URL, {
      fallbackAnalyze,
      timeoutMs: 5,
      workerFactory: () => worker,
    });

    expect(result).toMatchObject({
      candidates: [],
      execution: 'fallback',
      fallbackReason: 'timeout',
    });
    expect(fallbackAnalyze).not.toHaveBeenCalled();
    expect(worker.terminate).toHaveBeenCalledOnce();
  });

  it('cancels and terminates in-flight analysis', async () => {
    const worker = new SilentWorker();
    const controller = new AbortController();
    const pending = detectRepeatedStructures(DEMO_HTML, DEMO_URL, {
      signal: controller.signal,
      workerFactory: () => worker,
    });
    controller.abort();

    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    expect(worker.terminate).toHaveBeenCalledOnce();
  });
});
