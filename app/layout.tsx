import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CricPredict - Imperial League",
  description: "Premium Fantasy Cricket Prediction App",
};

export const viewport = { 
  width: "device-width", 
  initialScale: 1, 
  maximumScale: 1, 
  userScalable: false 
};

import UserSync from "@/components/UserSync";
import BottomNav from "@/components/BottomNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#0F1115] text-textMain relative`}>
        <UserSync />
        {children}
      </body>
    </html>
  );
}
