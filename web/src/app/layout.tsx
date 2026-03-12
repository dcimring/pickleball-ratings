import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

import { DataProvider } from "@/context/DataContext";
import { Navigation } from "@/components/Navigation";
import { UpdatePrompt } from "@/components/UpdatePrompt";
import { ScrollToTop } from "@/components/ScrollToTop";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans" });
const spaceGroteskDisplay = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  metadataBase: new URL('https://dinkdash.xyz'),
  title: "DinkDash | Your Pickleball Dashboard",
  description: "Real-time rank tracking and analytics for the Cayman Islands Pickleball community.",
  openGraph: {
    title: "DinkDash | Your Pickleball Dashboard",
    description: "Real-time rank tracking and analytics for the Cayman Islands Pickleball community.",
    url: "https://dinkdash.xyz",
    siteName: "DinkDash",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
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
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${spaceGroteskDisplay.variable}`}>
      <body className="font-sans antialiased text-foreground bg-background overflow-x-hidden">
        <DataProvider>
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
