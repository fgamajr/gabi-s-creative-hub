import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DashboardIcons } from './Icons';
import type { PipelineStage, SyncJob } from '@/types/dashboard';

interface PipelineCardProps {
  stage: PipelineStage;
  jobs: SyncJob[];
}

const colorConfig = {
  blue: {
    text: 'text-blue-600',
    bg: 'bg-blue-50',
    progressClass: 'progress-harvest',
    dot: 'bg-blue-500'
  },
  purple: {
    text: 'text-purple-600',
    bg: 'bg-purple-50',
    progressClass: 'progress-sync',
    dot: 'bg-purple-500'
  },
  green: {
    text: 'text-green-600',
    bg: 'bg-green-50',
    progressClass: 'progress-ingest',
    dot: 'bg-green-500'
  },
  yellow: {
    text: 'text-yellow-600',
    bg: 'bg-yellow-50',
    progressClass: 'progress-index',
    dot: 'bg-yellow-500'
  }
};

const iconMap: Record<string, keyof typeof DashboardIcons> = {
  harvest: 'CloudDownload',
  sync: 'Database',
  ingest: 'FileText',
  index: 'Search'
};

export function PipelineCard({ stage, jobs }: PipelineCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = colorConfig[stage.color];
  const Icon = DashboardIcons[iconMap[stage.id]];
  
  // Filter jobs relevant to this stage
  const stageJobs = jobs.filter(job => {
    if (stage.id === 'harvest') return true;
    if (stage.id === 'sync') return job.status === 'synced' || job.status === 'syncing';
    if (stage.id === 'ingest') return job.status === 'synced';
    if (stage.id === 'index') return true;
    return false;
  });
  
  const displayJobs = isExpanded ? stageJobs.slice(0, 10) : stageJobs.slice(0, 3);
  const hasMoreJobs = stageJobs.length > 3;

  return (
    <div
      onClick={() => hasMoreJobs && setIsExpanded(!isExpanded)}
      className={cn(
        'bg-card rounded-xl border border-border p-6',
        'shadow-sm hover:shadow-md transition-all duration-200',
        'animate-fade-in',
        hasMoreJobs && 'cursor-pointer'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={cn('p-2.5 rounded-xl', colors.bg, colors.text)}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{stage.label}</h3>
            <p className="text-sm text-muted-foreground">{stage.description}</p>
          </div>
        </div>
        <span className={cn(
          'px-3 py-1 rounded-full text-xs font-medium',
          stage.status === 'completed' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-secondary text-muted-foreground'
        )}>
          {stage.status === 'completed' ? 'Completed' : stage.status}
        </span>
      </div>

      {/* Main Metric */}
      <div className="mb-5">
        <div className="text-3xl font-bold text-foreground tracking-tight">{stage.value}</div>
        <div className="text-sm text-muted-foreground">{stage.subtitle}</div>
      </div>

      {/* Progress Bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Progress</span>
          <span className="font-medium">100%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div 
            className={cn('h-full rounded-full', colors.progressClass)} 
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Recent Jobs */}
      {displayJobs.length > 0 && (
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Recent Jobs ({stageJobs.length})
            </span>
            {hasMoreJobs && (
              <div className={cn('transition-transform', isExpanded && 'rotate-180')}>
                <DashboardIcons.ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            {displayJobs.map((job, idx) => (
              <div 
                key={`${job.source}-${job.year}-${idx}`} 
                className="flex items-center justify-between text-sm animate-slide-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center gap-2">
                  <div className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
                  <span className="text-foreground font-medium">{job.source}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{job.year}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {job.updated_at 
                    ? new Date(job.updated_at).toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: 'short' 
                      })
                    : 'N/A'}
                </span>
              </div>
            ))}
          </div>
          {!isExpanded && stageJobs.length > 3 && (
            <div className="text-xs text-primary font-medium mt-3 flex items-center gap-1">
              <span>+{stageJobs.length - 3} more jobs</span>
              <DashboardIcons.ChevronDown className="w-3 h-3" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
