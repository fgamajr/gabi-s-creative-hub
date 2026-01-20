import { cn } from '@/lib/utils';
import { DashboardIcons } from './Icons';
import type { NavigationPage } from '@/types/dashboard';

interface SidebarProps {
  currentPage: NavigationPage;
  onPageChange: (page: NavigationPage) => void;
  isConnected: boolean;
}

const menuItems: { id: NavigationPage; label: string; icon: keyof typeof DashboardIcons }[] = [
  { id: 'overview', label: 'Overview', icon: 'Home' },
  { id: 'jobs', label: 'Jobs & Logs', icon: 'Activity' },
  { id: 'documents', label: 'Documents', icon: 'FileText' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
];

export function Sidebar({ currentPage, onPageChange, isConnected }: SidebarProps) {
  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground tracking-tight">GABI-WORLD</h1>
            <p className="text-xs text-muted-foreground">Document Pipeline</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = DashboardIcons[item.icon];
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary font-medium shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Connection Status */}
      <div className="p-4">
        <div className="bg-secondary/50 rounded-xl p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <div className={cn(
              'w-2 h-2 rounded-full',
              isConnected 
                ? 'bg-green-500 animate-pulse-dot' 
                : 'bg-muted-foreground'
            )} />
            <span className="text-sm font-medium text-foreground">
              {isConnected ? 'Live Connection' : 'Connecting...'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {isConnected ? 'All systems operational' : 'Checking status...'}
          </p>
        </div>
      </div>
    </aside>
  );
}
