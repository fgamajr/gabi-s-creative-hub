import { cn } from '@/lib/utils';
import type { SourceCoverage } from '@/types/dashboard';
import { CheckCircle2, AlertCircle, Clock, ChevronRight } from 'lucide-react';

interface CoverageGridProps {
  coverage: SourceCoverage[];
}

export function CoverageGrid({ coverage }: CoverageGridProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Coverage & Gaps</h2>
          <p className="text-sm text-muted-foreground">Data completeness by source</p>
        </div>
      </div>

      <div className="space-y-4">
        {coverage.map((source) => (
          <CoverageRow key={source.sourceId} source={source} />
        ))}
      </div>
      
      {coverage.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No sources configured
        </div>
      )}
    </div>
  );
}

interface CoverageRowProps {
  source: SourceCoverage;
}

function CoverageRow({ source }: CoverageRowProps) {
  const hasErrors = source.yearsWithErrors.length > 0;
  const allSynced = source.coveragePercent === 100;
  
  return (
    <div className="group">
      <div className={cn(
        'p-4 rounded-xl border transition-all cursor-pointer',
        'hover:shadow-md hover:border-primary/30',
        hasErrors ? 'border-red-200 bg-red-50/50' : 'border-border bg-secondary/30'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Status Icon */}
            {allSynced && <CheckCircle2 className="w-5 h-5 text-green-600" />}
            {hasErrors && <AlertCircle className="w-5 h-5 text-red-600" />}
            {!allSynced && !hasErrors && <Clock className="w-5 h-5 text-amber-500" />}
            
            <div>
              <div className="font-medium text-foreground">{source.sourceName}</div>
              <div className="text-xs text-muted-foreground">{source.sourceId}</div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Years Coverage Visualization */}
            <div className="flex items-center gap-1">
              {source.yearsAvailable.slice(0, 8).map(year => {
                const isSynced = source.yearsSynced.includes(year);
                const hasError = source.yearsWithErrors.includes(year);
                
                return (
                  <div
                    key={year}
                    title={`${year}: ${hasError ? 'Error' : isSynced ? 'Synced' : 'Pending'}`}
                    className={cn(
                      'w-6 h-6 rounded text-[10px] font-medium flex items-center justify-center',
                      hasError ? 'bg-red-100 text-red-700 border border-red-300' :
                      isSynced ? 'bg-green-100 text-green-700 border border-green-300' :
                      'bg-secondary text-muted-foreground border border-border'
                    )}
                  >
                    {year.toString().slice(-2)}
                  </div>
                );
              })}
              {source.yearsAvailable.length > 8 && (
                <div className="text-xs text-muted-foreground">
                  +{source.yearsAvailable.length - 8}
                </div>
              )}
            </div>

            {/* Coverage Percent */}
            <div className="w-24 text-right">
              <div className={cn(
                'text-lg font-bold',
                source.coveragePercent === 100 ? 'text-green-600' :
                source.coveragePercent >= 80 ? 'text-foreground' :
                source.coveragePercent >= 50 ? 'text-amber-600' :
                'text-red-600'
              )}>
                {source.coveragePercent}%
              </div>
              <div className="text-xs text-muted-foreground">
                {source.yearsSynced.length}/{source.yearsAvailable.length} years
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-32">
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full rounded-full transition-all',
                    source.coveragePercent === 100 ? 'bg-green-500' :
                    hasErrors ? 'bg-gradient-to-r from-green-500 via-amber-500 to-red-500' :
                    'bg-gradient-to-r from-green-500 to-amber-500'
                  )}
                  style={{ width: `${source.coveragePercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>{source.syncedDocuments.toLocaleString()} synced</span>
                <span>{source.totalDocuments.toLocaleString()} total</span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </div>

        {/* Error Summary */}
        {hasErrors && (
          <div className="mt-3 pt-3 border-t border-red-200">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span>
                {source.yearsWithErrors.length} year(s) with errors: {source.yearsWithErrors.join(', ')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
