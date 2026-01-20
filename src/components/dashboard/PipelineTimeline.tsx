import { cn } from '@/lib/utils';
import { PIPELINE_STAGES } from '@/lib/pipeline-config';
import type { PipelineStageData, EnrichedJob } from '@/types/dashboard';
import { DashboardIcons } from './Icons';
import { ArrowRight, AlertCircle, CheckCircle2, Loader2, Clock } from 'lucide-react';

interface PipelineTimelineProps {
  stagesData: PipelineStageData[];
  jobs: EnrichedJob[];
  onStageClick?: (stageId: string) => void;
  selectedStage?: string | null;
}

export function PipelineTimeline({ stagesData, jobs, onStageClick, selectedStage }: PipelineTimelineProps) {
  const getJobsInStage = (stageId: string) => {
    return jobs.filter(j => {
      if (stageId === 'harvest') return j.status === 'pending' || j.status === 'queued';
      if (stageId === 'sync') return j.status === 'syncing' || j.status === 'failed';
      if (stageId === 'ingest') return j.currentStage === 'ingest';
      if (stageId === 'index') return j.status === 'synced';
      return false;
    });
  };

  const getStageStats = (stageId: string) => {
    const stageJobs = getJobsInStage(stageId);
    return {
      total: stageJobs.length,
      active: stageJobs.filter(j => j.status === 'syncing').length,
      failed: stageJobs.filter(j => j.status === 'failed').length,
      completed: stageJobs.filter(j => j.status === 'synced').length,
      pending: stageJobs.filter(j => j.status === 'pending' || j.status === 'queued').length
    };
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Pipeline Flow</h2>
          <p className="text-sm text-muted-foreground">Document processing stages</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-muted-foreground">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Failed</span>
          </div>
        </div>
      </div>

      {/* Timeline Track */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 via-green-200 to-yellow-200 -translate-y-1/2 rounded-full" />
        
        {/* Animated Flow */}
        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 overflow-hidden rounded-full">
          <div className="h-full w-1/4 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[shimmer_2s_infinite] rounded-full" 
               style={{ animation: 'shimmer 2s infinite linear' }} />
        </div>
        
        {/* Stage Nodes */}
        <div className="relative flex justify-between">
          {PIPELINE_STAGES.map((stage, idx) => {
            const stats = getStageStats(stage.id);
            const isSelected = selectedStage === stage.id;
            const hasErrors = stats.failed > 0;
            const hasActive = stats.active > 0;
            
            return (
              <div key={stage.id} className="flex flex-col items-center" style={{ flex: 1 }}>
                {/* Stage Node */}
                <button
                  onClick={() => onStageClick?.(stage.id)}
                  className={cn(
                    'relative z-10 w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-200',
                    'hover:scale-105 hover:shadow-lg cursor-pointer',
                    isSelected ? 'ring-2 ring-offset-2 ring-primary scale-105 shadow-lg' : '',
                    hasErrors ? 'border-red-300 bg-red-50' : 
                    hasActive ? 'border-blue-300 bg-blue-50' :
                    'border-border bg-card'
                  )}
                  style={{ 
                    borderColor: !hasErrors && !hasActive ? stage.borderColor : undefined,
                    backgroundColor: !hasErrors && !hasActive ? stage.bgColor : undefined
                  }}
                >
                  {/* Status Indicator */}
                  {hasErrors && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {hasActive && !hasErrors && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Loader2 className="w-3 h-3 text-white animate-spin" />
                    </div>
                  )}
                  
                  {/* Icon */}
                  <div className="text-2xl font-bold" style={{ color: stage.color }}>
                    {stats.completed > 0 ? stats.completed : stats.active > 0 ? stats.active : stats.pending}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    jobs
                  </div>
                </button>

                {/* Stage Label */}
                <div className="mt-3 text-center">
                  <div className="font-semibold text-sm" style={{ color: stage.color }}>
                    {stage.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stage.description}
                  </div>
                </div>

                {/* Arrow (except last) */}
                {idx < PIPELINE_STAGES.length - 1 && (
                  <ArrowRight 
                    className="absolute top-10 text-muted-foreground/30" 
                    style={{ left: `${(idx + 1) * 25 - 3}%` }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage Details (when selected) */}
      {selectedStage && (
        <div className="mt-6 pt-6 border-t border-border animate-fade-in">
          <StageJobsList 
            stageId={selectedStage} 
            jobs={getJobsInStage(selectedStage)} 
          />
        </div>
      )}
    </div>
  );
}

interface StageJobsListProps {
  stageId: string;
  jobs: EnrichedJob[];
}

function StageJobsList({ stageId, jobs }: StageJobsListProps) {
  const stage = PIPELINE_STAGES.find(s => s.id === stageId);
  
  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No jobs in this stage</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground mb-3">
        Jobs in {stage?.label} ({jobs.length})
      </h3>
      <div className="grid gap-2 max-h-48 overflow-y-auto pr-2">
        {jobs.map((job, idx) => (
          <div 
            key={`${job.source}-${job.year}`}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg border transition-all',
              job.status === 'failed' ? 'bg-red-50 border-red-200' :
              job.status === 'syncing' ? 'bg-blue-50 border-blue-200' :
              'bg-secondary/50 border-border'
            )}
          >
            <div className="flex items-center gap-3">
              {job.status === 'synced' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
              {job.status === 'syncing' && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
              {job.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-600" />}
              {(job.status === 'pending' || job.status === 'queued') && <Clock className="w-4 h-4 text-muted-foreground" />}
              
              <div>
                <span className="font-medium text-foreground">{job.source}</span>
                <span className="text-muted-foreground mx-2">•</span>
                <span className="text-muted-foreground">{job.year}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {job.documents_total && (
                <div className="text-xs text-muted-foreground">
                  {job.documents_processed?.toLocaleString()} / {job.documents_total?.toLocaleString()}
                </div>
              )}
              
              {job.progress > 0 && job.progress < 100 && (
                <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              )}
              
              {job.error_message && (
                <span className="text-xs text-red-600 max-w-[200px] truncate">
                  {job.error_message}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
