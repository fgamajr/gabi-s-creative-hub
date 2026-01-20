import { cn } from '@/lib/utils';
import type { Source } from '@/types/dashboard';

interface DataSourcesTableProps {
  sources: Source[];
}

export function DataSourcesTable({ sources }: DataSourcesTableProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm animate-fade-in">
      <table className="w-full">
        <thead>
          <tr className="bg-secondary/50 border-b border-border">
            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Source
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Documents
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sources.map((source, idx) => (
            <tr 
              key={source.id} 
              className="hover:bg-secondary/30 transition-colors animate-slide-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <td className="px-6 py-4">
                <div className="font-medium text-foreground">{source.id}</div>
                <div className="text-sm text-muted-foreground">{source.description}</div>
              </td>
              <td className="px-6 py-4">
                <code className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded">
                  {source.source_type}
                </code>
              </td>
              <td className="px-6 py-4 text-right">
                <span className="font-semibold text-foreground tabular-nums">
                  {source.document_count?.toLocaleString('pt-BR') || 0}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className={cn(
                  'inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full',
                  source.enabled
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-secondary text-muted-foreground border border-border'
                )}>
                  {source.enabled ? 'Active' : 'Disabled'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {sources.length === 0 && (
        <div className="px-6 py-12 text-center text-muted-foreground">
          No data sources configured
        </div>
      )}
    </div>
  );
}
