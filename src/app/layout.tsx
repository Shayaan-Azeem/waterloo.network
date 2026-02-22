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
    type: 'website',
    images: [
      {
        url: 'https://www.uhouston.network/front1.png',
        width: 1200,
        height: 630,
        alt: 'uhouston.network',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "uhouston.network",
    description: "A webring for University of Houston students",
    images: ['https://www.uhouston.network/front1.png'],
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
