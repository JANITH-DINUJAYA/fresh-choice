import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth';
import { CartProvider } from '@/lib/cart';

export const metadata = {
  title: 'Fresh Choice — Freshly Made, Simply Better',
  description: 'Order fresh homemade healthy meals online. Salads, rice & curry, healthy bowls, drinks and snacks delivered in Colombo, Sri Lanka.',
  keywords: 'Fresh Choice Sri Lanka, healthy homemade food Colombo, fresh salads delivery, rice curry delivery',
  openGraph: {
    title: 'Fresh Choice — Freshly Made, Simply Better',
    description: 'Order fresh homemade healthy meals delivered to your door in Colombo, Sri Lanka.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  fontFamily: 'Inter, sans-serif',
                  borderRadius: '12px',
                  padding: '12px 16px',
                },
                success: { iconTheme: { primary: '#3a7a3a', secondary: '#fff' } },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
