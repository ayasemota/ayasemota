import type { Metadata } from "next";
import Script from "next/script";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skilr - Management System",
  description: "AY Asemota Payment Management System",
  openGraph: {
    title: "Skilr - Management System",
    description: "AY Asemota Payment Management System",
    siteName: "Skilr",
    images: [
      {
        url: "/social-preview.png",
        width: 1200,
        height: 630,
        alt: "Skilr Management System Preview",
      },
    ],
    type: "website",
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