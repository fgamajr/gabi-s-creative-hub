import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DashboardIcons } from './Icons';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  onRefresh: () => void;
  isRefreshing?: boolean;
  lastUpdated?: Date | null;
  useMockData?: boolean;
}

export function DashboardHeader({ 
  title, 
  subtitle, 
  onRefresh, 
  isRefreshing,
  lastUpdated,
  useMockData
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
        {useMockData && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md w-fit border border-amber-200">
            <DashboardIcons.Zap className="w-3 h-3" />
            <span>Demo mode - Using mock data</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {lastUpdated && (
          <span className="text-xs text-muted-foreground hidden sm:block">
            Last updated: {lastUpdated.toLocaleTimeString('pt-BR')}
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <DashboardIcons.Refresh className={cn(
            'w-4 h-4',
            isRefreshing && 'animate-spin'
          )} />
          <span>Refresh</span>
        </Button>
      </div>
    </header>
  );
}
