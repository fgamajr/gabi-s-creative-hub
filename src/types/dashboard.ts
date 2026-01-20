// Enhanced Dashboard Types for GABI-WORLD Pipeline Monitoring

export interface Source {
  id: string;
  description: string;
  source_type: string;
  enabled: boolean;
  document_count: number;
}

export interface StatsResponse {
  sources: Source[];
  total_documents: number;
  elasticsearch_available: boolean;
}

export type JobStatus = 'synced' | 'syncing' | 'pending' | 'failed' | 'queued';

export interface SyncJob {
  source: string;
  year: number;
  status: JobStatus;
  updated_at: string | null;
  error_message?: string;
  documents_processed?: number;
  documents_total?: number;
  retry_count?: number;
}

export interface JobsResponse {
  sync_jobs: SyncJob[];
  elastic_indexes: Record<string, number>;
  total_elastic_docs: number;
}

// Pipeline Stage Types
export type PipelineStageId = 'harvest' | 'sync' | 'ingest' | 'index';

export interface PipelineStageConfig {
  id: PipelineStageId;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface PipelineStageData {
  stage: PipelineStageConfig;
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  inProgressJobs: number;
  throughput: number; // docs per minute
}

// Job with pipeline context
export interface EnrichedJob extends SyncJob {
  currentStage: PipelineStageId;
  progress: number; // 0-100
  duration?: number; // milliseconds
  nextStage?: PipelineStageId;
}

// Coverage & Gaps
export interface SourceCoverage {
  sourceId: string;
  sourceName: string;
  yearsAvailable: number[];
  yearsSynced: number[];
  yearsWithErrors: number[];
  coveragePercent: number;
  lastSyncDate: string | null;
  totalDocuments: number;
  syncedDocuments: number;
}

// Error Tracking
export interface ErrorEntry {
  id: string;
  source: string;
  year: number;
  stage: PipelineStageId;
  message: string;
  timestamp: string;
  retryCount: number;
  isResolved: boolean;
}

// Historical Data Point
export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

export interface HistoricalMetrics {
  documentsProcessed: TimeSeriesPoint[];
  errorsOverTime: TimeSeriesPoint[];
  throughputOverTime: TimeSeriesPoint[];
  period: '24h' | '7d' | '30d';
}

// Navigation
export type NavigationPage = 'pipeline' | 'jobs' | 'coverage' | 'errors' | 'settings';

// Dashboard View Mode
export type ViewMode = 'overview' | 'detailed';
