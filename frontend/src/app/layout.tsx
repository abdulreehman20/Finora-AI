import "./globals.css";
import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/providers/auth-providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finora | AI-Powered Personal Finance Tracker",
  description:
    "Track income and expenses, view weekly and monthly reports, and get AI-powered insights to analyze spending and make smarter financial decisions.",
  keywords:
    "finance, AI, expense tracker, money management, budgeting, fintech",
  openGraph: {
    title: "Finora | AI-Powered Personal Finance Tracker",
    description:
      "Track income, manage expenses, and get AI-powered financial insights.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <Providers>{children}</Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
