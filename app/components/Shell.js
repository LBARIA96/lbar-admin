'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

// Rutas publicas que NO deben mostrar el sidebar del panel admin.
const PUBLIC_ROUTES = ['/bienvenida', '/registro', '/reservar'];

export default function Shell({ children }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));

  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 max-w-7xl">{children}</main>
    </div>
  );
}
