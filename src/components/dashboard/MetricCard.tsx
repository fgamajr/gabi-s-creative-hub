import { cn } from '@/lib/utils';
import { DashboardIcons, type IconName } from './Icons';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon: IconName;
  className?: string;
}

export function MetricCard({ title, value, trend, icon, className }: MetricCardProps) {
  const Icon = DashboardIcons[icon];
  
  return (
    <div className={cn(
      'bg-card rounded-xl border border-border p-6',
      'shadow-sm hover:shadow-md transition-all duration-200',
      'animate-fade-in',
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-secondary text-muted-foreground">
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">
            <DashboardIcons.TrendUp className="w-3.5 h-3.5" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-foreground tracking-tight">
        {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{title}</div>
    </div>
  );
}
