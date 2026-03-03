import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Refrigerator, MessageSquare, ShoppingCart, Settings, UtensilsCrossed } from 'lucide-react';
import { clsx } from 'clsx';

const links = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Tarifler', path: '/recipes', icon: BookOpen },
  { label: 'Mutfaktakiler', path: '/inventory', icon: Refrigerator },
  { label: 'Diyetisyen Sohbet', path: '/chat', icon: MessageSquare },
  { label: 'Alışveriş Listesi', path: '/shopping', icon: ShoppingCart },
];

export default function Sidebar({ className }: { className?: string }) {
  const location = useLocation();

  return (
    <aside className={clsx("w-72 bg-white border-r border-border-light flex flex-col h-screen sticky top-0 shrink-0", className)}>
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
          <UtensilsCrossed className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold leading-tight text-text-dark">Envanterim</h1>
          <p className="text-xs text-text-muted-light font-medium uppercase tracking-wider">Mutfak Yönetimi</p>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname.startsWith(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-text-muted-light hover:bg-primary/10 hover:text-text-dark'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-semibold">{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border-light">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 text-text-muted-light hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-semibold">Ayarlar</span>
        </Link>
        <div className="mt-4 flex items-center gap-3 px-4 py-2 bg-background-light rounded-xl">
          <div
            className="w-8 h-8 rounded-full bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://i.pravatar.cc/150?img=11')",
            }}
          ></div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold truncate text-text-dark">Ahmet Yılmaz</p>
            <p className="text-[10px] text-text-muted-light truncate">Premium Üye</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
