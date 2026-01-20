import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { HistoricalMetrics } from '@/types/dashboard';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Button } from '@/components/ui/button';

interface HistoryChartProps {
  metrics: HistoricalMetrics;
  period: '24h' | '7d' | '30d';
  onPeriodChange: (period: '24h' | '7d' | '30d') => void;
}

export function HistoryChart({ metrics, period, onPeriodChange }: HistoryChartProps) {
  const chartData = useMemo(() => {
    return metrics.documentsProcessed.map((point, idx) => ({
      timestamp: new Date(point.timestamp).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short'
      }),
      documents: point.value,
      errors: metrics.errorsOverTime[idx]?.value || 0,
      throughput: metrics.throughputOverTime[idx]?.value || 0
    }));
  }, [metrics]);

  const totals = useMemo(() => {
    const docs = metrics.documentsProcessed.reduce((sum, p) => sum + p.value, 0);
    const errors = metrics.errorsOverTime.reduce((sum, p) => sum + p.value, 0);
    const avgThroughput = Math.round(
      metrics.throughputOverTime.reduce((sum, p) => sum + p.value, 0) / 
      metrics.throughputOverTime.length
    );
    
    // Calculate trend (compare last half to first half)
    const half = Math.floor(metrics.documentsProcessed.length / 2);
    const firstHalf = metrics.documentsProcessed.slice(0, half).reduce((s, p) => s + p.value, 0);
    const secondHalf = metrics.documentsProcessed.slice(half).reduce((s, p) => s + p.value, 0);
    const trend = firstHalf > 0 ? Math.round((secondHalf - firstHalf) / firstHalf * 100) : 0;
    
    return { docs, errors, avgThroughput, trend };
  }, [metrics]);

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Historical Trends</h2>
          <p className="text-sm text-muted-foreground">Processing activity over time</p>
        </div>
        
        <div className="flex items-center gap-2">
          {(['24h', '7d', '30d'] as const).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? 'default' : 'ghost'}
              onClick={() => onPeriodChange(p)}
              className="h-8 px-3"
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <SummaryCard
          label="Documents Processed"
          value={totals.docs.toLocaleString('pt-BR')}
          trend={totals.trend}
          icon={<BarChart3 className="w-4 h-4" />}
        />
        <SummaryCard
          label="Total Errors"
          value={totals.errors.toString()}
          trend={totals.errors === 0 ? 0 : -1}
          trendInverted
          icon={<TrendingDown className="w-4 h-4" />}
        />
        <SummaryCard
          label="Avg Throughput"
          value={`${totals.avgThroughput}/min`}
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis 
              dataKey="timestamp" 
              tick={{ fontSize: 11, fill: 'hsl(220, 9%, 46%)' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: 'hsl(220, 9%, 46%)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(220, 13%, 91%)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Area
              type="monotone"
              dataKey="documents"
              stroke="hsl(217, 91%, 60%)"
              strokeWidth={2}
              fill="url(#colorDocs)"
              name="Documents"
            />
            <Area
              type="monotone"
              dataKey="errors"
              stroke="hsl(0, 84%, 60%)"
              strokeWidth={2}
              fill="url(#colorErrors)"
              name="Errors"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  trend?: number;
  trendInverted?: boolean;
  icon?: React.ReactNode;
}

function SummaryCard({ label, value, trend, trendInverted, icon }: SummaryCardProps) {
  const isPositive = trendInverted ? (trend && trend < 0) : (trend && trend > 0);
  const isNegative = trendInverted ? (trend && trend > 0) : (trend && trend < 0);
  
  return (
    <div className="bg-secondary/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {trend !== undefined && trend !== 0 && (
          <span className={cn(
            'flex items-center gap-0.5 text-xs font-medium pb-1',
            isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-muted-foreground'
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : 
             isNegative ? <TrendingDown className="w-3 h-3" /> : 
             <Minus className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}
