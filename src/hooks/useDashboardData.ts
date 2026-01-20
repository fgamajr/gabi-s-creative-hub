import { useState, useEffect, useCallback } from 'react';
import type { StatsResponse, JobsResponse } from '@/types/dashboard';

// Mock data for development (when API is not available)
const MOCK_STATS: StatsResponse = {
  sources: [
    {
      id: 'tcu_acordaos',
      description: 'Acórdãos do TCU',
      source_type: 'csv_http',
      enabled: true,
      document_count: 497566
    },
    {
      id: 'tcu_decisoes',
      description: 'Decisões Normativas',
      source_type: 'csv_http',
      enabled: true,
      document_count: 12340
    },
    {
      id: 'tcu_sumulas',
      description: 'Súmulas do TCU',
      source_type: 'csv_http',
      enabled: false,
      document_count: 287
    }
  ],
  total_documents: 510193,
  elasticsearch_available: true
};

const MOCK_JOBS: JobsResponse = {
  sync_jobs: [
    { source: 'tcu_acordaos', year: 2024, status: 'synced', updated_at: '2025-01-19T10:30:00' },
    { source: 'tcu_acordaos', year: 2023, status: 'synced', updated_at: '2025-01-19T10:28:00' },
    { source: 'tcu_acordaos', year: 2022, status: 'synced', updated_at: '2025-01-19T10:25:00' },
    { source: 'tcu_acordaos', year: 2021, status: 'synced', updated_at: '2025-01-19T10:22:00' },
    { source: 'tcu_acordaos', year: 2020, status: 'synced', updated_at: '2025-01-19T10:20:00' },
    { source: 'tcu_decisoes', year: 2024, status: 'synced', updated_at: '2025-01-19T09:45:00' },
    { source: 'tcu_decisoes', year: 2023, status: 'syncing', updated_at: '2025-01-19T09:40:00' },
  ],
  elastic_indexes: {
    tcu_acordaos: 497566,
    tcu_decisoes: 12340
  },
  total_elastic_docs: 509906
};

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

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      
      const [statsRes, jobsRes] = await Promise.all([
        fetch(`${API_BASE}/stats`),
        fetch(`${API_BASE}/jobs`)
      ]);

      if (!statsRes.ok || !jobsRes.ok) {
        throw new Error('Failed to fetch data from API');
      }

      const statsData = await statsRes.json();
      const jobsData = await jobsRes.json();

      setStats(statsData);
      setJobs(jobsData);
      setLastUpdated(new Date());
      setUseMockData(false);
    } catch (err) {
      // Use mock data when API is not available
      console.warn('API not available, using mock data:', err);
      setStats(MOCK_STATS);
      setJobs(MOCK_JOBS);
      setLastUpdated(new Date());
      setUseMockData(true);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    stats,
    jobs,
    loading,
    error,
    lastUpdated,
    useMockData,
    refetch: fetchData
  };
}
