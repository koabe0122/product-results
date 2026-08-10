import type { Metadata } from "next";
import { Figtree, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const display = Figtree({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

const sans = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "重点商材ダッシュボード",
  description: "重点商材の受注状況を全社・部門・担当者別に可視化するダッシュボード",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`h-full ${display.variable} ${sans.variable}`}>
      <body className="min-h-full flex flex-col font-sans antialiased">{children}</body>
    </html>
  );
}
