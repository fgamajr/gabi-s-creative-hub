// Dashboard Types for GABI-WORLD

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

export interface SyncJob {
  source: string;
  year: number;
  status: 'synced' | 'syncing' | 'pending' | 'failed';
  updated_at: string | null;
}

export interface JobsResponse {
  sync_jobs: SyncJob[];
  elastic_indexes: Record<string, number>;
  total_elastic_docs: number;
}

export interface PipelineStage {
  id: 'harvest' | 'sync' | 'ingest' | 'index';
  label: string;
  description: string;
  icon: string;
  color: 'blue' | 'purple' | 'green' | 'yellow';
  value: string;
  subtitle: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
}

export type NavigationPage = 'overview' | 'jobs' | 'documents' | 'settings';
