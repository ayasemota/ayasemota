import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin | AY Asemota",
  description: "All-In-One Management System",
  applicationName: "Admin",
  authors: [{ name: "AY Asemota" }],
  keywords: ["admin", "ayasemota"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Admin",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192x192.png", sizes: "192x192", type: "image/png" }],
  },
  openGraph: {
    title: "Admin | AY Asemota",
    description: "All-In-One Management System",
    siteName: "Admin",
    url: "https://ayz-admin.vercel.app",
    images: [
      {
        url: "/api/social-preview",
        width: 1200,
        height: 630,
        alt: "Admin - AY Asemota",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Admin | AY Asemota",
    description: "All-In-One Management System",
    images: ["/api/social-preview"],
  },
  metadataBase: new URL("https://ayz-admin.vercel.app"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3B82F6" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
