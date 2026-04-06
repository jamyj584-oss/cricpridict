"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, HelpCircle, Wallet, Plus, CreditCard, ChevronRight, CheckCircle2, XCircle, Info, ShieldCheck, Landmark, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function WalletPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#0F1115] text-white pb-20">
      {/* 10.png Header */}
      <header className="sticky top-0 z-50 bg-[#0F1115]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/5">
        <button onClick={() => router.back()} className="text-white"><ChevronLeft size={24}/></button>
        <h1 className="font-black text-sm uppercase tracking-widest text-[#FFFFFF]">My Wallet</h1>
        <button className="text-textMuted"><HelpCircle size={20} /></button>
      </header>

      {/* 10.png Total Balance Card */}
      <div className="p-4">
          <div className="bg-gradient-to-br from-[#1A2234] to-[#161B22] border border-white/5 rounded-[2rem] p-10 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 opacity-10 pointer-events-none w-full h-full"></div>
                <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mb-2">Total Balance</p>
                <h3 className="text-4xl font-black tracking-tight text-white flex items-baseline gap-2">
                    <span className="text-accent text-xl">₹</span>
                    2,450
                </h3>
          </div>
      </div>

      {/* 10.png Balance Breakdown Section */}
      <div className="p-4">
          <div className="bg-[#161B22] border border-white/5 rounded-[2rem] p-6 shadow-xl space-y-8">
                <div className="flex justify-between items-center px-2 group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-[#0F1115] border border-white/5 flex items-center justify-center shadow-inner">
                            <Wallet size={18} className="text-textMuted" />
                        </div>
                        <div>
                           <h4 className="text-sm font-bold tracking-tight text-white/90">Unutilized</h4>
                           <p className="text-[9px] text-textMuted uppercase tracking-widest">Deposited amount</p>
                        </div>
                    </div>
                    <span className="text-lg font-black text-white">₹1,200</span>
                </div>

                <div className="flex justify-between items-center px-2 group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-[#0F1115] border border-white/5 flex items-center justify-center shadow-inner">
                            <Trophy size={18} className="text-textMuted" />
                        </div>
                        <div>
                           <h4 className="text-sm font-bold tracking-tight text-white/90">Winnings</h4>
                           <p className="text-[9px] text-textMuted uppercase tracking-widest">Withdrawal eligible</p>
                        </div>
                    </div>
                    <span className="text-lg font-black text-white">₹1,150</span>
                </div>

                <div className="flex justify-between items-center px-2 group opacity-60">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-[#0F1115] border border-white/5 flex items-center justify-center shadow-inner">
                            <Trophy size={18} className="text-textMuted" />
                        </div>
                        <div>
                           <h4 className="text-sm font-bold tracking-tight text-white/90">Cash Bonus</h4>
                        </div>
                    </div>
                    <span className="text-lg font-black text-white">₹100</span>
                </div>
          </div>
      </div>

      {/* Primary Action Buttons (Add Cash / Withdraw) from 10.png */}
      <div className="px-4 grid grid-cols-2 gap-4 mt-2 mb-8">
          <button className="bg-[#7698FB] text-[#0F1115] font-black py-4 rounded-2xl shadow-lg shadow-[#7698FB]/20 uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-95 transition-all">
              <Plus size={18} strokeWidth={3} /> Add Cash
          </button>
          <button className="bg-[#161B22] border border-white/10 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-95 transition-all">
              <CreditCard size={18} /> Withdraw
          </button>
      </div>

      {/* Refer & Earn Banner from 10.png */}
      <div className="px-4 mb-10">
          <div className="bg-gradient-to-r from-[#7698FB] to-[#4B73E1] rounded-[1.5rem] p-6 flex items-center justify-between shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
              <div className="flex items-center gap-5 relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                       <Plus size={24} className="text-white" />
                  </div>
                  <div>
                      <h4 className="text-base font-black text-white tracking-tight">Refer & Earn ₹500</h4>
                      <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Get bonus for every friend who joins</p>
                  </div>
              </div>
              <ChevronRight size={24} className="text-white relative z-10" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-all"></div>
          </div>
      </div>

      {/* Manage Payments Section from 10.png */}
      <div className="px-4 mb-10">
          <h4 className="text-xs font-black uppercase tracking-widest mb-6 px-2">Manage Payments</h4>
          <div className="space-y-4">
              {[
                  { name: "Google Pay", icon: "G", sub: "Link your UPI ID" },
                  { name: "PhonePe", icon: "P", sub: "Fast & Secure payments" },
                  { name: "Credit/Debit Cards", icon: "C", sub: "Add new card" }
              ].map((method, idx) => (
                  <div key={idx} className="bg-[#161B22] border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-xl">
                      <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-xl bg-[#0F1115] border border-white/5 flex items-center justify-center font-black text-lg text-white">
                                {method.name === "Credit/Debit Cards" ? <CreditCard size={20} className="text-secondary" /> : method.icon }
                          </div>
                          <div>
                             <h4 className="text-sm font-bold tracking-tight">{method.name}</h4>
                             <p className="text-[10px] text-textMuted uppercase tracking-tight">{method.sub}</p>
                          </div>
                      </div>
                      <button className="bg-[#161B22] border border-white/10 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-textMuted hover:text-white transition-colors">Link</button>
                  </div>
              ))}
          </div>
      </div>

      {/* Recent Transactions list Implementation (Fixing Ternary Bug) from 10.png */}
      <div className="px-4">
          <div className="flex justify-between items-center mb-6 px-2">
            <h4 className="text-xs font-black uppercase tracking-widest">Recent Transactions</h4>
            <button className="text-[10px] font-black text-accent uppercase tracking-widest">View All</button>
          </div>

          <div className="bg-[#161B22] border border-white/5 rounded-[2rem] divide-y divide-white/5 overflow-hidden shadow-2xl">
              {[
                  { label: "Contest Joined - I...", date: "24 Oct, 02:30 PM", amount: 49, isAdd: false, status: "Success" },
                  { label: "Cash Added", date: "23 Oct, 11:15 AM", amount: 500, isAdd: true, status: "Success" },
                  { label: "Winnings Credited", date: "22 Oct, 09:45 PM", amount: 1250, isAdd: true, status: "Success" },
                  { label: "Withdrawal to B...", date: "21 Oct, 10:00 AM", amount: 1000, isAdd: false, status: "Success" },
                  { label: "Cash Added", date: "20 Oct, 04:20 PM", amount: 200, isAdd: true, status: "Failed" }
              ].map((tx, idx) => (
                  <div key={idx} className="p-5 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all">
                      <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-2xl bg-[#0F1115] border border-white/5 flex items-center justify-center transition-all group-hover:scale-105 shadow-inner ${tx.isAdd ? 'text-success' : 'text-accent'}`}>
                                {tx.isAdd ? <Plus size={18} /> : <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                          </div>
                          <div>
                              <h4 className="text-sm font-bold tracking-tight text-white/90">{tx.label}</h4>
                              <p className="text-[10px] text-textMuted uppercase tracking-tight">{tx.date}</p>
                          </div>
                      </div>
                      <div className="text-right">
                          {/* FIXED TERNARY LOGIC AS PER DESIGN 10.png */}
                          <p className={`text-sm font-black tracking-tight ${tx.isAdd ? 'text-success' : 'text-white'}`}>
                              {tx.isAdd ? "+" : "-"} ₹{tx.amount.toLocaleString()}
                          </p>
                          <p className={`text-[9px] font-black uppercase tracking-widest ${tx.status === 'Failed' ? 'text-danger' : 'text-success opacity-70'}`}>
                              {tx.status}
                          </p>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* 10.png Footer */}
      <div className="text-center pt-20 pb-10 flex flex-col items-center gap-4 opacity-40">
          <ShieldCheck size={24} className="text-white" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#FFFFFF]">100% Safe & Secure Payments</p>
            <p className="text-[9px] font-bold text-textMuted uppercase tracking-widest mt-1">Play Responsibly. Terms & Conditions Apply.</p>
          </div>
      </div>
    </main>
  );
}
