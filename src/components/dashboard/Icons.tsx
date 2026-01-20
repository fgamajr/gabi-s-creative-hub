import { 
  Database, 
  Search, 
  FileText, 
  CloudDownload,
  RefreshCw,
  Home,
  Activity,
  Settings,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  BarChart3,
  Server,
  Zap
} from 'lucide-react';

export const DashboardIcons = {
  Database,
  Search,
  FileText,
  CloudDownload,
  Refresh: RefreshCw,
  Home,
  Activity,
  Settings,
  TrendUp: TrendingUp,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
  Loader: Loader2,
  Chart: BarChart3,
  Server,
  Zap
};

export type IconName = keyof typeof DashboardIcons;
