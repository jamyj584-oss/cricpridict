"use client";
import BottomNav from "@/components/BottomNav";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-md mx-auto relative min-h-screen bg-primary border-x border-white/5 pb-20 shadow-2xl">
      {children}
      <BottomNav />
    </div>
  );
}
