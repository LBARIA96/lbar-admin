import './globals.css';
import Shell from './components/Shell';

export const metadata = {
  title: 'LBAR Reservas - Panel de administracion',
  description: 'Gestiona las reservas de tu negocio en un solo lugar',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
