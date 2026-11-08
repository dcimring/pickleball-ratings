import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
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

const barlow = Barlow({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans" });
const barlowCondensed = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "CAYMANDINK | Cayman Islands Pickleball Rankings",
  description: "Cayman Islands pickleball rankings with every rating change recorded daily. Doubles and singles boards, player trajectories and weekly movers.",
  openGraph: {
    title: "CAYMANDINK | Cayman Islands Pickleball Rankings",
    description: "Cayman Islands pickleball rankings with every rating change recorded daily. Doubles and singles boards, player trajectories and weekly movers.",
    url: SITE_URL,
    siteName: "CAYMANDINK",
    images: [
      {
        url: "/og-image.jpg",
        width: 2760,
        height: 1504,
        alt: "CAYMANDINK Cayman Islands Pickleball Rankings",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CAYMANDINK | Cayman Islands Pickleball Rankings",
    description: "Cayman Islands pickleball rankings with every rating change recorded daily. Doubles and singles boards, player trajectories and weekly movers.",
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
    <html lang="en" className={`${barlow.variable} ${barlowCondensed.variable}`}>
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
