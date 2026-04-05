import { Outlet, useLocation } from 'react-router-dom';
import TopNav from './TopNav';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { clsx } from 'clsx';

export default function Layout() {
  const location = useLocation();
  const isInventory = location.pathname.startsWith('/inventory');

  const topNavLinks = [
    { label: 'Ana Sayfa', path: '/dashboard' },
    { label: 'Tarifler', path: '/recipes' },
    { label: 'Envanter', path: '/inventory' },
    { label: 'Liste', path: '/shopping' },
  ];

  return (
    <div className="flex min-h-screen bg-background-light pb-16 md:pb-0">
      <Sidebar className="hidden md:flex" />
      
      <div className="flex-1 flex flex-col w-full h-screen overflow-hidden">
        <TopNav links={topNavLinks} />
        
        <main className={clsx(
          "flex-1 overflow-y-auto w-full",
          !isInventory && "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        )}>
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
