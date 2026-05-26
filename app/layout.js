import { Geist, Geist_Mono, Playfair_Display, DM_Sans, Bebas_Neue } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ui/ServiceWorkerRegister";
import WebsiteThemeRuntime from "@/components/ui/WebsiteThemeRuntime";
import SettingsProvider from "@/components/providers/SettingsProvider";
import GlobalFeedbackDialog from "@/components/ui/GlobalFeedbackDialog";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const bebasNeue = Bebas_Neue({ subsets: ["latin"], variable: "--font-bebas", weight: "400" });

export const metadata = {
  title: "Sultan Kebab POS",
  description: "Point of Sale System - Sultan Kebab",
  manifest: '/manifest.json',
  icons: {
    icon: '/images/assets/logo.png',
    apple: '/images/assets/logo.png',
  },
};

export const viewport = {
  themeColor: '#C9A84C',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${dmSans.variable} ${bebasNeue.variable} antialiased`}>
        <SettingsProvider>
          <WebsiteThemeRuntime />
          {children}
          <GlobalFeedbackDialog />
        </SettingsProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
