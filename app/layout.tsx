import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
