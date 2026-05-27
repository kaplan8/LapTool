import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LAP Systemtechnik Academy",
  description: "Privates Lernportal zur LAP-Vorbereitung IT-Systemtechnik.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de-AT" className="h-full dark">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
