import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "../globals.css";

const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Administration — POLARIS Construction",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" dir="ltr" className={`${body.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full bg-ivory text-navy">{children}</body>
    </html>
  );
}
