import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Sora } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import { Navbar } from '@/components/Navbar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { ToastNotification } from '@/components/ToastNotification';
import { PageFrame } from '@/components/PageFrame';

// Body: Plus Jakarta Sans (refined, highly legible). Headings: Sora (crisp, modern tech character).
const bodyFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const displayFont = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://gnaathcommunications.com'),
  title: 'G Naath Global Communications Ltd | Everything Modern, All in One Place',
  description:
    'Shop smartphones, electronics, home and office appliances, solar systems, gadgets, cars and bikes at G Naath, with expert repairs and installations in Lagos and Abia State.',
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
    icon: '/gnaathlogo-header.png',
    apple: '/gnaathlogo-header.png',
  },
  openGraph: {
    title: 'G Naath Global Communications Ltd',
    description: 'Everything modern in one trusted place: technology, appliances, solar energy, mobility, accessories and expert services.',
    url: 'https://gnaathcommunications.com',
    siteName: 'G Naath Global Communications Ltd',
    images: [
      {
        url: '/gnaathlogo-header.png',
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
      className={`light ${bodyFont.variable} ${displayFont.variable}`}
    >
      <body
        suppressHydrationWarning
        className="bg-white text-slate-900 antialiased font-sans min-h-screen selection:bg-emerald-500 selection:text-white"
      >
        <StoreProvider>
          <Navbar />
          <PageFrame>{children}</PageFrame>
          <MobileBottomNav />
          <ToastNotification />
        </StoreProvider>
      </body>
    </html>
  );
}
