export interface ExtractionCollection<T> {
  items: T[];
  returnedCount: number;
  totalCount: number;
  truncated: boolean;
}

export interface DetachedPage {
  baseUrl: URL;
  document: Document;
  finalUrl: URL;
}

export type LinkType =
  'internal' | 'external' | 'mailto' | 'tel' | 'download' | 'fragment' | 'invalid';

export interface ExtractedLink {
  rel: string[];
  target: string | null;
  text: string;
  title: string | null;
  type: LinkType;
  url: string | null;
}

export interface ExtractedImage {
  alt: string;
  height: number | null;
  loading: 'eager' | 'lazy' | null;
  sourceAttribute: 'data-src' | 'src' | 'srcset';
  title: string | null;
  url: string;
  width: number | null;
}

export interface ExtractedHeading {
  anchor: string | null;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  order: number;
  text: string;
}

export type JsonValue =
  boolean | null | number | string | JsonValue[] | { [key: string]: JsonValue };

export interface JsonLdBlock {
  raw: string;
  value: JsonValue | null;
  valid: boolean;
}

export interface FaviconCandidate {
  rel: string[];
  sizes: string | null;
  type: string | null;
  url: string;
}

export interface DocumentStatistics {
  headingCount: number;
  imageCount: number;
  linkCount: number;
  paragraphCount: number;
  tableCount: number;
  textLength: number;
  wordEstimate: number;
}

export interface ExtractedMetadata {
  canonicalUrl: string | null;
  description: string | null;
  documentLanguage: string | null;
  favicons: FaviconCandidate[];
  h1Count: number;
  jsonLd: ExtractionCollection<JsonLdBlock>;
  openGraph: Record<string, string[]>;
  robots: string | null;
  statistics: DocumentStatistics;
  title: string | null;
  twitter: Record<string, string[]>;
  viewport: string | null;
}

export interface ExtractedTable {
  columnCount: number;
  columns: string[];
  index: number;
  returnedRowCount: number;
  rowCount: number;
  rows: Array<Record<string, string>>;
  title: string | null;
  truncated: boolean;
}

export interface PageAnalysis {
  headings: ExtractionCollection<ExtractedHeading>;
  images: ExtractionCollection<ExtractedImage>;
  links: ExtractionCollection<ExtractedLink>;
  metadata: ExtractedMetadata;
  tables: ExtractionCollection<ExtractedTable>;
}
