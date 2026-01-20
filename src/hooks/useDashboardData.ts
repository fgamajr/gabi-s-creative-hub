import { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  StatsResponse, 
  JobsResponse, 
  EnrichedJob, 
  PipelineStageData, 
  SourceCoverage,
  ErrorEntry,
  HistoricalMetrics,
  TimeSeriesPoint,
  PipelineStageId
} from '@/types/dashboard';
import { PIPELINE_STAGES } from '@/lib/pipeline-config';

// Mock data for development
const MOCK_STATS: StatsResponse = {
  sources: [
    { id: 'tcu_acordaos', description: 'Acórdãos do TCU', source_type: 'csv_http', enabled: true, document_count: 497566 },
    { id: 'tcu_decisoes', description: 'Decisões Normativas', source_type: 'csv_http', enabled: true, document_count: 12340 },
    { id: 'tcu_sumulas', description: 'Súmulas do TCU', source_type: 'csv_http', enabled: false, document_count: 287 }
  ],
  total_documents: 510193,
  elasticsearch_available: true
};

const MOCK_JOBS: JobsResponse = {
  sync_jobs: [
    { source: 'tcu_acordaos', year: 2024, status: 'synced', updated_at: '2025-01-19T10:30:00', documents_processed: 45230, documents_total: 45230 },
    { source: 'tcu_acordaos', year: 2023, status: 'synced', updated_at: '2025-01-19T10:28:00', documents_processed: 52100, documents_total: 52100 },
    { source: 'tcu_acordaos', year: 2022, status: 'syncing', updated_at: '2025-01-19T10:25:00', documents_processed: 38500, documents_total: 48000, retry_count: 0 },
    { source: 'tcu_acordaos', year: 2021, status: 'synced', updated_at: '2025-01-19T10:22:00', documents_processed: 44200, documents_total: 44200 },
    { source: 'tcu_acordaos', year: 2020, status: 'failed', updated_at: '2025-01-19T10:20:00', documents_processed: 12000, documents_total: 42000, error_message: 'Connection timeout after 30s', retry_count: 3 },
    { source: 'tcu_decisoes', year: 2024, status: 'synced', updated_at: '2025-01-19T09:45:00', documents_processed: 3200, documents_total: 3200 },
    { source: 'tcu_decisoes', year: 2023, status: 'pending', updated_at: null, documents_processed: 0, documents_total: 2800 },
    { source: 'tcu_decisoes', year: 2022, status: 'failed', updated_at: '2025-01-18T14:30:00', documents_processed: 500, documents_total: 2500, error_message: 'CSV parsing error at row 521', retry_count: 2 },
  ],
  elastic_indexes: { tcu_acordaos: 497566, tcu_decisoes: 12340 },
  total_elastic_docs: 509906
};

function generateMockHistory(period: '24h' | '7d' | '30d'): HistoricalMetrics {
  const now = Date.now();
  const points = period === '24h' ? 24 : period === '7d' ? 7 : 30;
  const interval = period === '24h' ? 3600000 : 86400000;
  
  const generatePoints = (base: number, variance: number): TimeSeriesPoint[] => 
    Array.from({ length: points }, (_, i) => ({
      timestamp: new Date(now - (points - i) * interval).toISOString(),
      value: Math.floor(base + (Math.random() - 0.5) * variance)
    }));

  return {
    documentsProcessed: generatePoints(15000, 8000),
    errorsOverTime: generatePoints(3, 5),
    throughputOverTime: generatePoints(250, 100),
    period
  };
}

const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:8000'
  : '';

export function useDashboardData() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [jobs, setJobs] = useState<JobsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const [historyPeriod, setHistoryPeriod] = useState<'24h' | '7d' | '30d'>('7d');

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      
      const [statsRes, jobsRes] = await Promise.all([
        fetch(`${API_BASE}/stats`),
        fetch(`${API_BASE}/jobs`)
      ]);

      if (!statsRes.ok || !jobsRes.ok) throw new Error('Failed to fetch data');

      const statsData = await statsRes.json();
      const jobsData = await jobsRes.json();

      setStats(statsData);
      setJobs(jobsData);
      setLastUpdated(new Date());
      setUseMockData(false);
    } catch (err) {
      console.warn('API unavailable, using mock data:', err);
      setStats(MOCK_STATS);
      setJobs(MOCK_JOBS);
      setLastUpdated(new Date());
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Enriched jobs with pipeline context
  const enrichedJobs = useMemo((): EnrichedJob[] => {
    if (!jobs?.sync_jobs) return [];
    
    return jobs.sync_jobs.map(job => {
      let currentStage: PipelineStageId = 'harvest';
      let progress = 0;
      
      if (job.status === 'pending' || job.status === 'queued') {
        currentStage = 'harvest';
        progress = 0;
      } else if (job.status === 'syncing') {
        currentStage = 'sync';
        progress = job.documents_total 
          ? Math.round((job.documents_processed || 0) / job.documents_total * 100)
          : 50;
      } else if (job.status === 'synced') {
        currentStage = 'index';
        progress = 100;
      } else if (job.status === 'failed') {
        currentStage = 'sync';
        progress = job.documents_total 
          ? Math.round((job.documents_processed || 0) / job.documents_total * 100)
          : 0;
      }
      
      return {
        ...job,
        currentStage,
        progress,
        nextStage: progress === 100 ? undefined : 
          currentStage === 'harvest' ? 'sync' :
          currentStage === 'sync' ? 'ingest' :
          currentStage === 'ingest' ? 'index' : undefined
      };
    });
  }, [jobs]);

  // Pipeline stages data
  const pipelineData = useMemo((): PipelineStageData[] => {
    return PIPELINE_STAGES.map(stage => {
      const stageJobs = enrichedJobs.filter(j => {
        if (stage.id === 'harvest') return j.status === 'pending' || j.status === 'queued';
        if (stage.id === 'sync') return j.status === 'syncing' || (j.status === 'failed' && j.currentStage === 'sync');
        if (stage.id === 'ingest') return j.currentStage === 'ingest';
        if (stage.id === 'index') return j.status === 'synced';
        return false;
      });

      return {
        stage,
        totalJobs: enrichedJobs.length,
        completedJobs: stageJobs.filter(j => j.status === 'synced').length,
        failedJobs: stageJobs.filter(j => j.status === 'failed').length,
        inProgressJobs: stageJobs.filter(j => j.status === 'syncing').length,
        throughput: Math.floor(Math.random() * 500 + 100) // Mock throughput
      };
    });
  }, [enrichedJobs]);

  // Coverage by source
  const sourceCoverage = useMemo((): SourceCoverage[] => {
    if (!stats?.sources || !jobs?.sync_jobs) return [];
    
    return stats.sources.map(source => {
      const sourceJobs = jobs.sync_jobs.filter(j => j.source === source.id);
      const years = [...new Set(sourceJobs.map(j => j.year))].sort((a, b) => b - a);
      const syncedYears = sourceJobs.filter(j => j.status === 'synced').map(j => j.year);
      const errorYears = sourceJobs.filter(j => j.status === 'failed').map(j => j.year);
      const lastSync = sourceJobs
        .filter(j => j.updated_at)
        .sort((a, b) => new Date(b.updated_at!).getTime() - new Date(a.updated_at!).getTime())[0];
      
      const totalDocs = sourceJobs.reduce((sum, j) => sum + (j.documents_total || 0), 0);
      const syncedDocs = sourceJobs.reduce((sum, j) => sum + (j.documents_processed || 0), 0);
      
      return {
        sourceId: source.id,
        sourceName: source.description,
        yearsAvailable: years,
        yearsSynced: syncedYears,
        yearsWithErrors: errorYears,
        coveragePercent: years.length > 0 ? Math.round(syncedYears.length / years.length * 100) : 0,
        lastSyncDate: lastSync?.updated_at || null,
        totalDocuments: totalDocs,
        syncedDocuments: syncedDocs
      };
    });
  }, [stats, jobs]);

  // Errors
  const errors = useMemo((): ErrorEntry[] => {
    if (!jobs?.sync_jobs) return [];
    
    return jobs.sync_jobs
      .filter(j => j.status === 'failed' && j.error_message)
      .map((j, idx) => ({
        id: `err-${idx}`,
        source: j.source,
        year: j.year,
        stage: 'sync' as PipelineStageId,
        message: j.error_message!,
        timestamp: j.updated_at || new Date().toISOString(),
        retryCount: j.retry_count || 0,
        isResolved: false
      }));
  }, [jobs]);

  // Historical metrics
  const historicalMetrics = useMemo(() => generateMockHistory(historyPeriod), [historyPeriod]);

  return {
    stats,
    jobs,
    enrichedJobs,
    pipelineData,
    sourceCoverage,
    errors,
    historicalMetrics,
    historyPeriod,
    setHistoryPeriod,
    loading,
    error,
    lastUpdated,
    useMockData,
    refetch: fetchData
  };
}
