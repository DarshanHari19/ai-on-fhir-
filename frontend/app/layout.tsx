import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";   // ← client component wrapper

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* ───── page metadata (works only in a *server* component) ───── */
export const metadata: Metadata = {
  title: "AI on FHIR Demo",
  description: "Natural-language FHIR query playground",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /*  ────────────────────────────────────────────────────────────
      This file is *server* by default – no "use client" directive
  ----------------------------------------------------------------*/
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
