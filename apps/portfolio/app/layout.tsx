import type { Metadata } from "next";
import { Source_Code_Pro } from "next/font/google";
import "./globals.css";

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AY Asemota - Front End Developer",
  description: "Portfolio website showcasing my work and skills",
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
