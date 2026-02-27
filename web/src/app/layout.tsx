import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-display" });

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable}`}>
      <body className="font-sans antialiased text-ghost bg-background overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
