import { Home, DollarSign, FileText, FolderOpen, LogOut, Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type NavItem = 'home' | 'salary' | 'investments' | 'documents';

interface PortalSidebarProps {
  employee: {
    full_name: string;
    avatar_url?: string | null;
    designation?: string | null;
  };
  activeNav: NavItem;
  onNavChange: (nav: NavItem) => void;
  onLogout: () => void;
  onNotificationClick: () => void;
  onViewProfile: () => void;
}

const navItems: { id: NavItem; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'salary', label: 'Salary Details', icon: DollarSign },
  { id: 'investments', label: 'Investments', icon: FileText },
  { id: 'documents', label: 'Documents', icon: FolderOpen },
];

export function PortalSidebar({
  employee,
  activeNav,
  onNavChange,
  onLogout,
  onNotificationClick,
  onViewProfile,
}: PortalSidebarProps) {
  const initials = employee.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[220px] flex-col bg-[#1e293b] text-white">
      {/* Profile section */}
      <div className="flex flex-col items-center px-4 pt-6 pb-4">
        <div className="relative mb-3">
          <Avatar className="h-20 w-20 border-2 border-white/20">
            <AvatarImage src={employee.avatar_url || undefined} />
            <AvatarFallback className="bg-slate-500 text-white text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={onNotificationClick}
            className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-slate-600 flex items-center justify-center hover:bg-slate-500 transition-colors"
          >
            <Bell className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-sm font-semibold text-center leading-tight">
          {employee.full_name}
        </p>
        <button
          onClick={onViewProfile}
          className="text-xs text-blue-400 hover:text-blue-300 mt-1 transition-colors"
        >
          View My Profile
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2 space-y-1">
        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
