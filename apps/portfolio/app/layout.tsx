import type { Metadata } from "next";
import { Source_Code_Pro } from "next/font/google";
import "./globals.css";

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://ayz-portfolio.vercel.app";

export const metadata: Metadata = {
  title: "AY Asemota - Front End Developer",
  description: "Portfolio website showcasing my work and skills",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "AY Asemota - Front End Developer",
    description: "Portfolio website showcasing my work and skills",
    siteName: "AY Asemota Portfolio",
    url: siteUrl,
    images: [
      {
        url: "/api/social-preview",
        width: 1200,
        height: 630,
        alt: "AY Asemota Portfolio Preview",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AY Asemota - Front End Developer",
    description: "Portfolio website showcasing my work and skills",
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
      <body className={`${sourceCodePro.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
