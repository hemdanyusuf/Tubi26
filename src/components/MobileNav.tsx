import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Refrigerator } from 'lucide-react';
import { clsx } from 'clsx';

export default function MobileNav() {
  const location = useLocation();
  const links = [
    { label: 'Panel', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Tarifler', path: '/recipes', icon: BookOpen },
    { label: 'Envanter', path: '/inventory', icon: Refrigerator },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border-light z-50 px-6 py-2 flex justify-between items-center pb-safe">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname.startsWith(link.path);
        return (
          <Link
            key={link.path}
            to={link.path}
            className={clsx(
              'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors',
              isActive ? 'text-primary' : 'text-text-muted-light hover:text-text-dark'
            )}
          >
            <Icon className="w-6 h-6" />
            <span className="text-[10px] font-bold">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
