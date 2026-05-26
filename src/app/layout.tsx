import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import FirebaseInitializer from '@/components/FirebaseInitializer'

export const metadata: Metadata = {
  title: 'Chalke Homestay | Authentic Konkani Experience',
  description: 'Premium eco-retreat offering authentic Konkani village hospitality surrounded by rivers and mountains.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="icon" href="/favicons/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" href="/favicons/favicon-16x16.png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" sizes="180x180" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Literata:opsz,wght@7..72,400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground selection:bg-primary/20">
        {children}
        <FirebaseInitializer />
        <Toaster />
      </body>
    </html>
  );
}
