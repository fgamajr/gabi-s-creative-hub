import { useState } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Sidebar } from './Sidebar';
import { DashboardHeader } from './DashboardHeader';
import { PipelineTimeline } from './PipelineTimeline';
import { CoverageGrid } from './CoverageGrid';
import { ErrorsPanel } from './ErrorsPanel';
import { HistoryChart } from './HistoryChart';
import { JobsList } from './JobsList';
import { LoadingState, ErrorState } from './LoadingState';
import type { NavigationPage } from '@/types/dashboard';

export function Dashboard() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('pipeline');
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  
  const { 
    stats, 
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
    refetch 
  } = useDashboardData();
  
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

  const pageConfig = {
    pipeline: {
      title: 'Pipeline Monitor',
      subtitle: 'Real-time document processing flow'
    },
    jobs: {
      title: 'Jobs Overview',
      subtitle: 'All sync and indexing jobs'
    },
    coverage: {
      title: 'Data Coverage',
      subtitle: 'Completeness and gaps analysis'
    },
    errors: {
      title: 'Error Management',
      subtitle: 'Failed jobs and error tracking'
    },
    settings: {
      title: 'Settings',
      subtitle: 'Configure pipeline and alerts'
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        isConnected={stats?.elasticsearch_available ?? false}
        errorCount={errors.length}
      />

      <main className="flex-1 p-8 overflow-auto">
        <DashboardHeader
          title={pageConfig[currentPage].title}
          subtitle={pageConfig[currentPage].subtitle}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
          useMockData={useMockData}
        />

        {/* Pipeline Page */}
        {currentPage === 'pipeline' && (
          <div className="space-y-6">
            <PipelineTimeline 
              stagesData={pipelineData}
              jobs={enrichedJobs}
              onStageClick={setSelectedStage}
              selectedStage={selectedStage}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ErrorsPanel errors={errors} />
              <HistoryChart 
                metrics={historicalMetrics}
                period={historyPeriod}
                onPeriodChange={setHistoryPeriod}
              />
            </div>
            
            <CoverageGrid coverage={sourceCoverage} />
          </div>
        )}

        {/* Jobs Page */}
        {currentPage === 'jobs' && (
          <JobsList jobs={enrichedJobs} />
        )}

        {/* Coverage Page */}
        {currentPage === 'coverage' && (
          <div className="space-y-6">
            <CoverageGrid coverage={sourceCoverage} />
            <HistoryChart 
              metrics={historicalMetrics}
              period={historyPeriod}
              onPeriodChange={setHistoryPeriod}
            />
          </div>
        )}

        {/* Errors Page */}
        {currentPage === 'errors' && (
          <div className="space-y-6">
            <ErrorsPanel errors={errors} />
            <JobsList 
              jobs={enrichedJobs.filter(j => j.status === 'failed')} 
              title="Failed Jobs"
            />
          </div>
        )}

        {/* Settings Page */}
        {currentPage === 'settings' && (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <div className="text-muted-foreground">
              Settings page - Configure alerts, thresholds, and pipeline behavior
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
