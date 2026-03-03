import { Outlet, useLocation } from 'react-router-dom';
import TopNav from './TopNav';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function Layout() {
  const location = useLocation();
  const isInventory = location.pathname.startsWith('/inventory');

  if (isInventory) {
    return (
      <div className="flex min-h-screen bg-background-light pb-16 md:pb-0">
        <Sidebar className="hidden md:flex" />
        <main className="flex-1 overflow-y-auto w-full">
          <Outlet />
        </main>
        <MobileNav />
      </div>
    );
  }

  const topNavLinks = [
    { label: 'Ana Sayfa', path: '/dashboard' },
    { label: 'Tarifler', path: '/recipes' },
    { label: 'Envanter', path: '/inventory' },
  ];

  return (
    <div className="min-h-screen bg-background-light flex flex-col pb-16 md:pb-0">
      <TopNav links={topNavLinks} />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}
