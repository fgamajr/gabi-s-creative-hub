import { cn } from '@/lib/utils';
import type { EnrichedJob } from '@/types/dashboard';
import { getStageConfig } from '@/lib/pipeline-config';
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Clock, 
  ChevronDown,
  FileText,
  Calendar
} from 'lucide-react';
import { useState } from 'react';

interface JobsListProps {
  jobs: EnrichedJob[];
  title?: string;
}

export function JobsList({ jobs, title = "All Jobs" }: JobsListProps) {
  const [sortBy, setSortBy] = useState<'date' | 'source' | 'status'>('date');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const sortedJobs = [...jobs].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return dateB - dateA;
    }
    if (sortBy === 'source') return a.source.localeCompare(b.source);
    if (sortBy === 'status') return a.status.localeCompare(b.status);
    return 0;
  });

  const filteredJobs = filterStatus 
    ? sortedJobs.filter(j => j.status === filterStatus)
    : sortedJobs;

  const statusCounts = {
    synced: jobs.filter(j => j.status === 'synced').length,
    syncing: jobs.filter(j => j.status === 'syncing').length,
    failed: jobs.filter(j => j.status === 'failed').length,
    pending: jobs.filter(j => j.status === 'pending' || j.status === 'queued').length
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <div className="text-sm text-muted-foreground">
            {filteredJobs.length} of {jobs.length} jobs
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2">
          <StatusFilter 
            label="All" 
            count={jobs.length}
            isActive={filterStatus === null}
            onClick={() => setFilterStatus(null)}
          />
          <StatusFilter 
            label="Completed" 
            count={statusCounts.synced}
            color="green"
            isActive={filterStatus === 'synced'}
            onClick={() => setFilterStatus(filterStatus === 'synced' ? null : 'synced')}
          />
          <StatusFilter 
            label="In Progress" 
            count={statusCounts.syncing}
            color="blue"
            isActive={filterStatus === 'syncing'}
            onClick={() => setFilterStatus(filterStatus === 'syncing' ? null : 'syncing')}
          />
          <StatusFilter 
            label="Failed" 
            count={statusCounts.failed}
            color="red"
            isActive={filterStatus === 'failed'}
            onClick={() => setFilterStatus(filterStatus === 'failed' ? null : 'failed')}
          />
          <StatusFilter 
            label="Pending" 
            count={statusCounts.pending}
            color="yellow"
            isActive={filterStatus === 'pending'}
            onClick={() => setFilterStatus(filterStatus === 'pending' ? null : 'pending')}
          />
        </div>
      </div>

      {/* Jobs List */}
      <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
        {filteredJobs.map((job, idx) => (
          <JobRow key={`${job.source}-${job.year}-${idx}`} job={job} />
        ))}
        
        {filteredJobs.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            No jobs found
          </div>
        )}
      </div>
    </div>
  );
}

interface StatusFilterProps {
  label: string;
  count: number;
  color?: 'green' | 'blue' | 'red' | 'yellow';
  isActive: boolean;
  onClick: () => void;
}

function StatusFilter({ label, count, color, isActive, onClick }: StatusFilterProps) {
  const colorClasses = {
    green: 'bg-green-100 text-green-700 border-green-300',
    blue: 'bg-blue-100 text-blue-700 border-blue-300',
    red: 'bg-red-100 text-red-700 border-red-300',
    yellow: 'bg-amber-100 text-amber-700 border-amber-300'
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
        isActive 
          ? color 
            ? colorClasses[color]
            : 'bg-primary text-primary-foreground border-primary'
          : 'bg-secondary text-muted-foreground border-transparent hover:border-border'
      )}
    >
      {label}
      <span className={cn(
        'ml-1.5 px-1.5 py-0.5 rounded text-xs',
        isActive ? 'bg-white/20' : 'bg-secondary'
      )}>
        {count}
      </span>
    </button>
  );
}

interface JobRowProps {
  job: EnrichedJob;
}

function JobRow({ job }: JobRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const stage = getStageConfig(job.currentStage);

  const StatusIcon = {
    synced: CheckCircle2,
    syncing: Loader2,
    failed: AlertCircle,
    pending: Clock,
    queued: Clock
  }[job.status];

  const statusColors = {
    synced: 'text-green-600',
    syncing: 'text-blue-600',
    failed: 'text-red-600',
    pending: 'text-amber-500',
    queued: 'text-muted-foreground'
  };

  return (
    <div className={cn(
      'transition-colors',
      job.status === 'failed' && 'bg-red-50/50'
    )}>
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <StatusIcon className={cn(
            'w-5 h-5',
            statusColors[job.status],
            job.status === 'syncing' && 'animate-spin'
          )} />
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{job.source}</span>
              <span 
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: stage.bgColor, color: stage.color }}
              >
                {stage.label}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {job.year}
              </span>
              {job.documents_total && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  {job.documents_processed?.toLocaleString()} / {job.documents_total?.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {job.progress > 0 && job.progress < 100 && (
            <div className="w-32">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{job.progress}%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="text-right text-xs text-muted-foreground">
            {job.updated_at && (
              <div>
                {new Date(job.updated_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}
          </div>

          <ChevronDown className={cn(
            'w-4 h-4 text-muted-foreground transition-transform',
            isExpanded && 'rotate-180'
          )} />
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pl-14">
          <div className="bg-secondary/50 rounded-lg p-4 text-sm">
            {job.error_message ? (
              <div className="text-red-700 font-mono">{job.error_message}</div>
            ) : (
              <div className="text-muted-foreground">
                Job details and logs would appear here.
                {job.retry_count && job.retry_count > 0 && (
                  <span className="ml-2 text-amber-600">
                    (Retried {job.retry_count} times)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
