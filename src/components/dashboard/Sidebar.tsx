import { cn } from '@/lib/utils';
import type { NavigationPage } from '@/types/dashboard';
import { 
  GitBranch, 
  Layers, 
  AlertCircle, 
  BarChart3, 
  Settings,
  Zap
} from 'lucide-react';

interface SidebarProps {
  currentPage: NavigationPage;
  onPageChange: (page: NavigationPage) => void;
  isConnected: boolean;
  errorCount: number;
}

const menuItems: { id: NavigationPage; label: string; icon: React.ReactNode }[] = [
  { id: 'pipeline', label: 'Pipeline', icon: <GitBranch className="w-5 h-5" /> },
  { id: 'jobs', label: 'Jobs', icon: <Layers className="w-5 h-5" /> },
  { id: 'coverage', label: 'Coverage', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'errors', label: 'Errors', icon: <AlertCircle className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export function Sidebar({ currentPage, onPageChange, isConnected, errorCount }: SidebarProps) {
  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary via-accent to-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <span className="text-white font-bold text-lg relative">G</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground tracking-tight">GABI</h1>
            <p className="text-xs text-muted-foreground">Pipeline Monitor</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = currentPage === item.id;
          const showBadge = item.id === 'errors' && errorCount > 0;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </div>
              {showBadge && (
                <span className={cn(
                  'px-2 py-0.5 text-xs font-bold rounded-full',
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-red-100 text-red-700'
                )}>
                  {errorCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Connection Status */}
      <div className="p-4 border-t border-border">
        <div className={cn(
          'rounded-xl p-4 transition-all',
          isConnected 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-secondary border border-border'
        )}>
          <div className="flex items-center gap-2 mb-1">
            <div className={cn(
              'w-2 h-2 rounded-full',
              isConnected 
                ? 'bg-green-500 animate-pulse-dot' 
                : 'bg-muted-foreground'
            )} />
            <span className={cn(
              'text-sm font-medium',
              isConnected ? 'text-green-700' : 'text-muted-foreground'
            )}>
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
          <p className={cn(
            'text-xs',
            isConnected ? 'text-green-600' : 'text-muted-foreground'
          )}>
            {isConnected ? 'Real-time sync active' : 'Checking status...'}
          </p>
        </div>
      </div>
    </aside>
  );
}
