import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { ThemeScript } from "@/components/layout/theme-script";
import { BRAND } from "@/lib/branding";

export const metadata: Metadata = {
  title: BRAND.name,
  description:
    "A modern dating platform that helps people discover meaningful connections through shared interests, compatibility, and authentic interactions.",
  keywords: [
    "dating",
    "relationships",
    "matchmaking",
    "social discovery",
    "compatibility",
    "connections",
    "SparkDates",
  ],
  openGraph: {
    siteName: BRAND.name,
    title: BRAND.name,
    description: "Discover meaningful connections.",
  },
  twitter: {
    title: BRAND.name,
    description: "Discover meaningful connections.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <ThemeScript />
          {children}
          <Toaster />
          <MobileBottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
