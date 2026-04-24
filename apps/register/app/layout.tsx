import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const siteUrl = "https://ayz-register.vercel.app";

export const metadata: Metadata = {
  title: "Welcome | Onboarding",
  description:
    "Begin your journey with us through a guided onboarding experience",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Welcome | Onboarding",
    description:
      "Begin your journey with us through a guided onboarding experience",
    siteName: "AY Asemota Register",
    url: siteUrl,
    images: [
      {
        url: "/api/social-preview",
        width: 1200,
        height: 630,
        alt: "AY Asemota Registration Preview",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Welcome | Onboarding",
    description:
      "Begin your journey with us through a guided onboarding experience",
    images: ["/api/social-preview"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased`}>{children}</body>
    </html>
  );
}
