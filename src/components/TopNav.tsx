import { Link, useLocation } from 'react-router-dom';
import { Settings, UtensilsCrossed } from 'lucide-react';
import { clsx } from 'clsx';
import { getSessionUser } from '../lib/auth';

interface TopNavProps {
  links: { label: string; path: string }[];
}

export default function TopNav({ links }: TopNavProps) {
  const location = useLocation();
  const user = getSessionUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-light bg-white/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="bg-primary p-1.5 rounded-lg"><UtensilsCrossed className="w-5 h-5 text-text-dark" /></div>
              <h2 className="text-xl font-extrabold tracking-tight hidden sm:block">Tubi26</h2>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {links.map((link) => <Link key={link.path} to={link.path} className={clsx('text-sm font-semibold transition-colors', location.pathname.startsWith(link.path) ? 'text-primary-hover' : 'text-slate-600 hover:text-primary-hover')}>{link.label}</Link>)}
            </nav>
          </div>
          <Link to="/onboarding" className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100" title="Profili düzenle">
            <div className="hidden sm:block text-right"><p className="text-xs font-bold">{user?.username}</p><p className="text-[10px] text-slate-500">Profili düzenle</p></div>
            <div className="w-9 h-9 rounded-full bg-background-dark text-primary flex items-center justify-center"><Settings className="w-4 h-4" /></div>
          </Link>
        </div>
      </div>
    </header>
  );
}
