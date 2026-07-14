import type {
  RepeatedStructureAnalysis,
  RepeatedStructureSnapshot,
} from '@scrapestudio/extraction-core';

export interface RepeatedDetectionWorkerRequest {
  id: number;
  snapshot: RepeatedStructureSnapshot;
  type: 'analyze';
}

export type RepeatedDetectionWorkerResponse =
  { analysis: RepeatedStructureAnalysis; id: number; ok: true } | { id: number; ok: false };
