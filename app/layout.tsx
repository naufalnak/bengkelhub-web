import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TokenSyncProvider } from "@/components/providers/TokenSyncProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/ui/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BengkelHub",
    template: "%s | BengkelHub",
  },
  description: "Platform booking bengkel online terpercaya",
  keywords: ["bengkel", "servis", "booking", "otomotif"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <TokenSyncProvider />
          {children}
          <ToastProvider />
        </QueryProvider>
      </body>
    </html>
  );
}
