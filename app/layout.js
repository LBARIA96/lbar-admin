import './globals.css';
import Sidebar from './components/Sidebar';

export const metadata = {
  title: 'LBAR Admin - Panel de reservas',
  description: 'Panel de administracion de reservas',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-8 max-w-7xl">{children}</main>
        </div>
      </body>
    </html>
  );
}
