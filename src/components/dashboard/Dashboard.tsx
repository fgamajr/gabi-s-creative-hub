import { useState } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Sidebar } from './Sidebar';
import { DashboardHeader } from './DashboardHeader';
import { MetricCard } from './MetricCard';
import { PipelineCard } from './PipelineCard';
import { DataSourcesTable } from './DataSourcesTable';
import { LoadingState, ErrorState } from './LoadingState';
import type { NavigationPage, PipelineStage } from '@/types/dashboard';

export function Dashboard() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('overview');
  const { stats, jobs, loading, error, lastUpdated, useMockData, refetch } = useDashboardData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const totalDocs = stats?.total_documents || 0;
  const esDocs = jobs?.total_elastic_docs || 0;
  const syncJobs = jobs?.sync_jobs || [];
  const sources = stats?.sources || [];

  const pipelineStages: PipelineStage[] = [
    {
      id: 'harvest',
      label: 'Harvest',
      description: 'Download de arquivos CSV',
      icon: 'CloudDownload',
      color: 'blue',
      value: syncJobs.length.toString(),
      subtitle: 'sync states',
      status: 'completed'
    },
    {
      id: 'sync',
      label: 'Sync',
      description: 'Sincronização com banco',
      icon: 'Database',
      color: 'purple',
      value: totalDocs.toLocaleString('pt-BR'),
      subtitle: 'documentos no PostgreSQL',
      status: 'completed'
    },
    {
      id: 'ingest',
      label: 'Ingest',
      description: 'Processamento e parsing',
      icon: 'FileText',
      color: 'green',
      value: totalDocs.toLocaleString('pt-BR'),
      subtitle: 'documentos ingeridos',
      status: 'completed'
    },
    {
      id: 'index',
      label: 'Index',
      description: 'Indexação Elasticsearch',
      icon: 'Search',
      color: 'yellow',
      value: esDocs.toLocaleString('pt-BR'),
      subtitle: 'documentos indexados',
      status: 'completed'
    }
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        isConnected={stats?.elasticsearch_available ?? false}
      />

      <main className="flex-1 p-8 overflow-auto">
        <DashboardHeader
          title="Dashboard Overview"
          subtitle="Real-time monitoring of document pipeline"
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
          useMockData={useMockData}
        />

        {/* Metrics Overview */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Documents"
            value={totalDocs}
            trend="+12%"
            icon="FileText"
          />
          <MetricCard
            title="Indexed Documents"
            value={esDocs}
            icon="Search"
          />
          <MetricCard
            title="Data Sources"
            value={sources.length}
            icon="Database"
          />
          <MetricCard
            title="Sync Jobs"
            value={syncJobs.length}
            icon="Activity"
          />
        </section>

        {/* Pipeline Status */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Pipeline Status</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pipelineStages.map((stage) => (
              <PipelineCard 
                key={stage.id} 
                stage={stage} 
                jobs={syncJobs}
              />
            ))}
          </div>
        </section>

        {/* Data Sources */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Data Sources</h2>
          <DataSourcesTable sources={sources} />
        </section>
      </main>
    </div>
  );
}
