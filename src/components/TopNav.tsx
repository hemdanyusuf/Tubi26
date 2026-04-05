import { Link, useLocation } from 'react-router-dom';
import { Bell, User, UtensilsCrossed } from 'lucide-react';
import { clsx } from 'clsx';

interface TopNavProps {
  links: { label: string; path: string }[];
}

export default function TopNav({ links }: TopNavProps) {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-light bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-primary p-1.5 rounded-lg">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-text-dark leading-tight hidden sm:block">DiyetApp</h2>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={clsx(
                    'text-sm font-semibold transition-colors',
                    location.pathname.startsWith(link.path)
                      ? 'text-primary'
                      : 'text-slate-600 hover:text-primary'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600 border border-transparent hover:border-slate-200 transition-all">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600 border border-transparent hover:border-slate-200 transition-all">
              <User className="w-5 h-5" />
            </button>
            <div
              className="w-8 h-8 rounded-full bg-cover bg-center border border-slate-200 cursor-pointer"
              style={{
                backgroundImage:
                  "url('https://i.pravatar.cc/150?img=32')",
              }}
            ></div>
          </div>
        </div>
      </div>
    </header>
  );
}
