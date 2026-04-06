import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CricPredict - Imperial League",
  description: "Premium Fantasy Cricket Prediction App",
};

import UserSync from "@/components/UserSync";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-primary text-textMain max-w-md mx-auto relative overflow-x-hidden md:border-x md:border-white/10`}>
        <UserSync />
        {children}
      </body>
    </html>
  );
}
