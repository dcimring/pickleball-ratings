import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";

import { DataProvider } from "@/context/DataContext";
import { Navigation } from "@/components/Navigation";
import { UpdatePrompt } from "@/components/UpdatePrompt";
import { ScrollToTop } from "@/components/ScrollToTop";
import { getCurrentRankings } from "@/lib/rankings-api";
import { SITE_URL } from "@/lib/site-config";

// Regenerate server-rendered pages (and their seeded ranking data) hourly,
// matching the daily scrape cadence with headroom.
export const revalidate = 3600;

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-display", style: "italic" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "DinkDash | Your Pickleball Dashboard",
  description: "Real-time rank tracking and analytics for the Cayman Islands Pickleball community.",
  openGraph: {
    title: "DinkDash | Your Pickleball Dashboard",
    description: "Real-time rank tracking and analytics for the Cayman Islands Pickleball community.",
    url: SITE_URL,
    siteName: "DinkDash",
    images: [
      {
        url: "/og-image.jpg",
        width: 2760,
        height: 1504,
        alt: "DinkDash Pickleball Rankings",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DinkDash | Your Pickleball Dashboard",
    description: "Real-time rank tracking and analytics for the Cayman Islands Pickleball community.",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Seed the client-side data context so ranking content is present in
  // server-rendered HTML; falls back to client fetching if this fails.
  const initialData = await getCurrentRankings();

  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`}>
      <body className="font-sans antialiased text-foreground bg-background overflow-x-hidden">
        <DataProvider initialData={initialData}>
          <main className="h-[100dvh] flex flex-col overflow-hidden relative overscroll-none">
            <Navigation />
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
            <UpdatePrompt />
            <ScrollToTop />
          </main>
        </DataProvider>
      </body>
    </html>
  );
}
