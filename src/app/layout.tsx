import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "uhouston.network",
  description: "A webring for University of Houston students",
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: "uhouston.network",
    description: "A webring for University of Houston students",
    url: 'https://uhouston-network.vercel.app/',
    siteName: 'uhouston.network',
    type: 'website',
    images: [
      {
        url: 'https://uhouston-network.vercel.app//thumb.png',
        width: 1280,
        height: 720,
        alt: 'uhouston.network',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "uhouston.network",
    description: "A webring for University of Houston students",
    images: ['https://uhouston-network.vercel.app//thumb.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
