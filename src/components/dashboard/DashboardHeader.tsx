import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RefreshCw, Zap } from 'lucide-react';

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
          <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg w-fit border border-amber-200">
            <Zap className="w-3 h-3" />
            <span>Demo mode - Using mock data</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {lastUpdated && (
          <div className="text-right hidden sm:block">
            <div className="text-xs text-muted-foreground">Last updated</div>
            <div className="text-sm font-medium text-foreground">
              {lastUpdated.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
          </div>
        )}
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={cn(
            'w-4 h-4',
            isRefreshing && 'animate-spin'
          )} />
          Refresh
        </Button>
      </div>
    </header>
  );
}
