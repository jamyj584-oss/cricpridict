"use client";
import { Loader2 } from "lucide-react";

export default function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F1115] text-white">
      <Loader2 className="animate-spin mr-2" size={24} />
      <span className="text-sm uppercase tracking-widest">Loading…</span>
    </div>
  );
}
