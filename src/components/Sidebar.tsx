import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, LayoutDashboard, LogOut, MessageSquare, PlusCircle, Refrigerator, Settings, ShoppingCart, UtensilsCrossed } from 'lucide-react';
import { clsx } from 'clsx';
import { clearSession, getSessionUser } from '../lib/auth';

const links = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Tarifler', path: '/recipes', icon: BookOpen },
  { label: 'Mutfaktakiler', path: '/inventory', icon: Refrigerator },
  { label: 'Diyetisyen Sohbet', path: '/chat', icon: MessageSquare },
  { label: 'Alışveriş Listesi', path: '/shopping', icon: ShoppingCart },
  { label: 'Malzeme Ekle', path: '/add-ingredient', icon: PlusCircle },
];

export default function Sidebar({ className }: { className?: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const user = getSessionUser();

  function logout() {
    clearSession();
    navigate('/onboarding', { replace: true });
  }

  return (
    <div className={clsx('relative h-screen shrink-0 w-16 lg:w-20 z-50', className)}>
      <aside
        className={clsx(
          'bg-white border-r border-border-light flex flex-col h-screen fixed top-0 left-0 transition-all duration-300 shadow-[4px_0_24px_-10px_rgba(0,0,0,0.1)] overflow-hidden z-[60]',
          isExpanded ? 'w-72' : 'w-16 lg:w-20',
        )}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className={clsx('p-6 flex items-center shrink-0 h-16', isExpanded ? 'justify-start gap-4' : 'justify-center')}>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          {isExpanded && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold leading-tight text-text-dark whitespace-nowrap">Tubi26</h1>
              <p className="text-xs text-text-muted-light font-medium uppercase tracking-wider whitespace-nowrap">Akıllı Mutfak</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {links.map((link) => {
            const Icon = link.icon;
            const active = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                title={!isExpanded ? link.label : undefined}
                className={clsx(
                  'flex items-center transition-all rounded-lg overflow-hidden',
                  isExpanded ? 'px-4 py-3 gap-3' : 'px-0 py-3 justify-center w-10 lg:w-12 mx-auto',
                  active ? 'bg-primary text-text-dark shadow-lg shadow-primary/20' : 'text-text-muted-light hover:bg-primary/10 hover:text-primary',
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {isExpanded && <span className="text-sm font-semibold whitespace-nowrap">{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={clsx('p-4 border-t border-border-light flex flex-col gap-2 shrink-0', !isExpanded && 'items-center')}>
          <Link to="/onboarding" title="Profili düzenle" className={clsx('flex items-center rounded-lg text-text-muted-light hover:bg-slate-100', isExpanded ? 'px-4 py-3 gap-3' : 'p-3')}>
            <Settings className="w-5 h-5 shrink-0" />
            {isExpanded && <span className="text-sm font-semibold whitespace-nowrap">Profili Düzenle</span>}
          </Link>
          <button onClick={logout} title="Çıkış yap" className={clsx('flex items-center rounded-lg text-rose-500 hover:bg-rose-50', isExpanded ? 'px-4 py-3 gap-3' : 'p-3')}>
            <LogOut className="w-5 h-5 shrink-0" />
            {isExpanded && <span className="text-sm font-semibold whitespace-nowrap">Çıkış Yap</span>}
          </button>
          {isExpanded && (
            <div className="px-4 py-2 bg-background-light rounded-xl">
              <p className="text-xs font-bold truncate text-text-dark">{user?.username ?? 'Tubi26 Kullanıcısı'}</p>
              <p className="text-[10px] text-text-muted-light truncate">Yerel profil</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
