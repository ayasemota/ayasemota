import type { Metadata } from "next";
import Script from "next/script";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

const siteUrl = "https://ayz-skilr.vercel.app";

export const metadata: Metadata = {
  title: "Skilr - Management System",
  description:
    "Skilr by AY Asemota helps you manage payments, announcements, and events in one dashboard.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Skilr - Management System",
    description:
      "Skilr by AY Asemota helps you manage payments, announcements, and events in one dashboard.",
    siteName: "Skilr",
    url: siteUrl,
    images: [
      {
        url: "/api/social-preview",
        width: 1200,
        height: 630,
        alt: "Skilr Management System Preview",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skilr - Management System",
    description:
      "Skilr by AY Asemota helps you manage payments, announcements, and events in one dashboard.",
    images: ["/api/social-preview"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="beforeInteractive"
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
