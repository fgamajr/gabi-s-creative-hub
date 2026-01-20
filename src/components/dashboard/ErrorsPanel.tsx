import { cn } from '@/lib/utils';
import type { ErrorEntry } from '@/types/dashboard';
import { getStageConfig } from '@/lib/pipeline-config';
import { AlertCircle, RefreshCw, Clock, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorsPanelProps {
  errors: ErrorEntry[];
  onRetry?: (errorId: string) => void;
  onDismiss?: (errorId: string) => void;
}

export function ErrorsPanel({ errors, onRetry, onDismiss }: ErrorsPanelProps) {
  const [expandedError, setExpandedError] = useState<string | null>(null);
  const activeErrors = errors.filter(e => !e.isResolved);
  const hasErrors = activeErrors.length > 0;

  return (
    <div className={cn(
      'rounded-2xl border p-6 shadow-sm transition-all',
      hasErrors 
        ? 'bg-red-50/50 border-red-200' 
        : 'bg-card border-border'
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-xl',
            hasErrors ? 'bg-red-100' : 'bg-secondary'
          )}>
            <AlertCircle className={cn(
              'w-5 h-5',
              hasErrors ? 'text-red-600' : 'text-muted-foreground'
            )} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Errors & Failures
            </h2>
            <p className="text-sm text-muted-foreground">
              {hasErrors 
                ? `${activeErrors.length} active error${activeErrors.length > 1 ? 's' : ''} requiring attention`
                : 'All systems running smoothly'
              }
            </p>
          </div>
        </div>
        
        {hasErrors && (
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry All
          </Button>
        )}
      </div>

      {hasErrors ? (
        <div className="space-y-2">
          {activeErrors.map((error) => {
            const stage = getStageConfig(error.stage);
            const isExpanded = expandedError === error.id;
            
            return (
              <div 
                key={error.id}
                className="bg-white rounded-xl border border-red-200 overflow-hidden"
              >
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-red-50/50 transition-colors"
                  onClick={() => setExpandedError(isExpanded ? null : error.id)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{error.source}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{error.year}</span>
                        <span 
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ 
                            backgroundColor: stage.bgColor, 
                            color: stage.color 
                          }}
                        >
                          {stage.label}
                        </span>
                      </div>
                      <div className="text-sm text-red-700 mt-0.5 font-mono">
                        {error.message}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        {error.retryCount} retries
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(error.timestamp).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                    <ChevronDown className={cn(
                      'w-4 h-4 text-muted-foreground transition-transform',
                      isExpanded && 'rotate-180'
                    )} />
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-red-100 bg-red-50/30">
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="default"
                        className="gap-1.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRetry?.(error.id);
                        }}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Retry Now
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="gap-1.5 text-muted-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismiss?.(error.id);
                        }}
                      >
                        <X className="w-3.5 h-3.5" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-muted-foreground">No errors to display</p>
          <p className="text-xs text-muted-foreground mt-1">All sync jobs completed successfully</p>
        </div>
      )}
    </div>
  );
}
