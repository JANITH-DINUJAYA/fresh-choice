import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth';
import { CartProvider } from '@/lib/cart';

export const metadata = {
  title: {
    default: 'Fresh Choice — Freshly Made, Simply Better',
    template: '%s | Fresh Choice',
  },
  description: 'Order fresh homemade healthy meals online. Salads, rice & curry, healthy bowls, drinks and snacks — delivered in Colombo, Sri Lanka.',
  keywords: ['Fresh Choice Sri Lanka', 'healthy homemade food Colombo', 'fresh salads delivery', 'rice curry delivery', 'meal delivery Colombo', 'healthy food Sri Lanka'],
  authors: [{ name: 'Fresh Choice' }],
  creator: 'Fresh Choice',
  metadataBase: new URL('https://fresh-choice-nine.vercel.app'),
  openGraph: {
    title: 'Fresh Choice — Freshly Made, Simply Better',
    description: 'Order fresh homemade healthy meals delivered to your door in Colombo, Sri Lanka.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Fresh Choice',
    url: 'https://fresh-choice-nine.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fresh Choice — Freshly Made, Simply Better',
    description: 'Fresh homemade healthy meals delivered in Colombo, Sri Lanka.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

// Security headers applied via Next.js
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0d1f0d" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* CSP and security meta tags */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta name="format-detection" content="telephone=no" />
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
                  fontSize: '0.875rem',
                },
                success: { iconTheme: { primary: '#3a7a3a', secondary: '#fff' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                duration: 4000,
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
