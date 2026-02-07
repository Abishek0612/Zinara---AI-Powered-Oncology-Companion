import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Providers } from "@/components/shared/providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Zinara - AI-Powered Oncology Partner",
    template: "%s | Zinara",
  },
  description:
    "Physician-informed, AI-powered oncology partner delivering precision care and personalization.",
  keywords: [
    "oncology",
    "cancer care",
    "AI health",
    "treatment plans",
    "clinical trials",
  ],
  authors: [{ name: "Zinara Health" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Zinara",
    title: "Zinara - AI-Powered Oncology Partner",
    description:
      "Physician-informed, AI-powered oncology partner delivering precision care.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zinara - AI-Powered Oncology Partner",
    description: "Physician-informed, AI-powered oncology partner.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0D9488",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <Providers>
          {children}
        </Providers>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: "8px", background: "#1F2937", color: "#fff" },
          }}
        />
      </body>
    </html>
  );
}