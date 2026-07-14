import type { PageAnalysis } from '@scrapestudio/extraction-core';

import type { FetchedPage } from './api';

export interface WorkspaceRun {
  analysis: PageAnalysis;
  features: { smartDetection: boolean };
  limits: { maxHtmlBytes: number; maxRows: number } | undefined;
  page: FetchedPage;
  requestId: string | undefined;
  source: 'api' | 'demo';
}
