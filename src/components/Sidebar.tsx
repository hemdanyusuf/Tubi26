import { useState } from 'react';
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
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={clsx("relative h-screen shrink-0 w-16 lg:w-20 z-50", className)}>
      <aside 
        className={clsx(
          "bg-white border-r border-border-light flex flex-col h-screen fixed top-0 left-0 transition-all duration-300 shadow-[4px_0_24px_-10px_rgba(0,0,0,0.1)] overflow-hidden z-[60]", 
          isExpanded ? "w-72" : "w-16 lg:w-20",
        )}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Header */}
        <div className={clsx("p-6 flex items-center shrink-0 h-16", isExpanded ? "justify-start gap-4" : "justify-center")}>

          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          {isExpanded && (
            <div className="flex flex-col overflow-hidden animate-in fade-in duration-300">
              <h1 className="text-lg font-bold leading-tight text-text-dark whitespace-nowrap">DiyetApp</h1>
              <p className="text-xs text-text-muted-light font-medium uppercase tracking-wider whitespace-nowrap">Mutfak Yönetimi</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.path);
            return (
               <Link
                 key={link.path}
                 to={link.path}
                 title={!isExpanded ? link.label : undefined}
                 className={clsx(
                   'flex items-center transition-all duration-200 rounded-lg overflow-hidden group',
                   isExpanded ? 'px-4 py-3 gap-3' : 'px-0 py-3 justify-center w-10 lg:w-12 mx-auto',
                   isActive
                     ? 'bg-primary text-white shadow-lg shadow-primary/20'
                     : 'text-text-muted-light hover:bg-primary/10 hover:text-primary'
                 )}
               >
                 <Icon className={clsx("shrink-0", isExpanded ? "w-5 h-5" : "w-5 h-5 lg:w-6 lg:h-6")} />
                 {isExpanded && <span className="text-sm font-semibold whitespace-nowrap animate-in fade-in duration-300">{link.label}</span>}
               </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={clsx("p-4 border-t border-border-light flex flex-col gap-4 shrink-0", isExpanded ? "" : "items-center")}>
          <Link
            to="/settings"
            title={!isExpanded ? "Ayarlar" : undefined}
            className={clsx(
              "flex items-center transition-colors rounded-lg overflow-hidden text-text-muted-light hover:bg-slate-100",
              isExpanded ? "px-4 py-3 gap-3" : "p-3"
            )}
          >
            <Settings className={clsx("shrink-0", isExpanded ? "w-5 h-5" : "w-5 h-5 lg:w-6 lg:h-6")} />
            {isExpanded && <span className="text-sm font-semibold whitespace-nowrap animate-in fade-in duration-300">Ayarlar</span>}
          </Link>
          
          {isExpanded ? (
            <div className="flex items-center px-4 py-2 bg-background-light rounded-xl gap-3 animate-in fade-in duration-300">
              <div
                className="w-8 h-8 rounded-full bg-cover bg-center shrink-0 border border-border-light"
                style={{
                  backgroundImage: "url('https://i.pravatar.cc/150?img=11')",
                }}
              ></div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold truncate text-text-dark">Ahmet Yılmaz</p>
                <p className="text-[10px] text-text-muted-light truncate">Premium Üye</p>
              </div>
            </div>
          ) : (
             <div
               className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-cover bg-center shrink-0 border-2 border-transparent hover:border-primary cursor-pointer transition-colors"
               style={{
                 backgroundImage: "url('https://i.pravatar.cc/150?img=11')",
               }}
               title="Profil"
             ></div>
          )}
        </div>
      </aside>
    </div>
  );
}
