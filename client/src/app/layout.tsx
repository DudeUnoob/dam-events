import type { Metadata } from 'next';
import { Inter, Urbanist, Poppins, Manrope } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { Navigation } from '@/components/shared/Navigation';
import { Footer } from '@/components/shared/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const urbanist = Urbanist({
  subsets: ['latin'],
  variable: '--font-urbanist',
});
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: 'Scout - Event Planning Made Simple',
  description:
    'Connect with pre-vetted vendors offering complete event packages. Plan your perfect event in hours, not weeks.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${urbanist.variable} ${poppins.variable} ${manrope.variable} ${inter.variable}`}>
      <body className={inter.className}>
        <ToastProvider>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Navigation />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
