import { Sora, DM_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import CartDrawer from '@/components/CartDrawer';

const sora = Sora({ subsets: ['latin'], variable: '--font-sora', weight: ['400','600','700','800'] });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm', weight: ['400','500','600','700','800'] });

export const metadata = {
  title: 'BéninXi — Le marché du Bénin',
  description: 'Achetez vêtements, chaussures, meubles, montres, colliers et chaînes.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${sora.variable} ${dmSans.variable}`}>
      <body>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              {children}
              <CartDrawer />
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
