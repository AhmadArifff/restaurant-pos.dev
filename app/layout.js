import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ui/ServiceWorkerRegister";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Bang.Han POS",
  description: "Point of Sale System - Lumpia Beef Bang.Han",
  manifest: '/manifest.json',
  icons: {
    icon: '/images/assets/logo.png',
    apple: '/images/assets/logo.png',
  },
};

export const viewport = {
  themeColor: '#f97316',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}