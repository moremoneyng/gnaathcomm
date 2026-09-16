import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import { Navbar } from '@/components/Navbar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { ToastNotification } from '@/components/ToastNotification';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://gnaathcommunications.com'),
  title: 'G Naath Global Communications Ltd | Phones, Accessories, Repairs & Solar',
  description:
    'G Naath Global Communications Ltd (RC: 6898302). Ultimate Satisfaction Assured! We sell mobile phones and accessories from Apple, Samsung, JBL, Anker and more, offer phone repairs, and install solar systems in Lagos & Abia State.',
  keywords: [
    'G Naath Global Communications',
    'Mobile Phones Lagos',
    'Phone Accessories Isolo Ago Palace',
    'JBL Speakers Nigeria',
    'Anker Power Bank',
    'Phone Repair Lagos',
    'Phone Repair ABSU Uturu Abia State',
    'Solar Installation Lagos',
    'Solar Materials Sales',
  ],
  authors: [{ name: 'G Naath Global Communications Ltd' }],
  icons: {
    icon: '/gnaathcommlogo.png',
    apple: '/gnaathcommlogo.png',
  },
  openGraph: {
    title: 'G Naath Global Communications Ltd',
    description: 'Ultimate Satisfaction Assured! Mobile Phones, Accessories, Repair Services & Solar Installations.',
    url: 'https://gnaathcommunications.com',
    siteName: 'G Naath Global Communications Ltd',
    images: [
      {
        url: '/gnaathcommlogo.png',
        width: 1200,
        height: 630,
        alt: 'G Naath Global Communications Ltd Logo',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`light ${inter.variable} ${outfit.variable}`}
    >
      <body
        suppressHydrationWarning
        className="bg-white text-slate-900 antialiased font-sans min-h-screen selection:bg-emerald-500 selection:text-white"
      >
        <StoreProvider>
          <Navbar />
          <div className="pb-20 md:pb-0">{children}</div>
          <MobileBottomNav />
          <ToastNotification />
        </StoreProvider>
      </body>
    </html>
  );
}
