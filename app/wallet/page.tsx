"use client";

import { useState } from "react";
import { ChevronLeft, HelpCircle, Plus, CreditCard, Landmark, Coins, Trophy, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/useStore";
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const PACKS = [
  { inr: 9, coins: 50, bonus: "" },
  { inr: 49, coins: 260, bonus: "🔥 10% Extra" },
  { inr: 99, coins: 550, bonus: "🔥 12% Extra" },
  { inr: 499, coins: 3000, bonus: "💎 20% Extra" },
  { inr: 999, coins: 6500, bonus: "👑 Best Value" },
];

export default function WalletPage() {
  const router = useRouter();
  const { user } = useUserStore();
  
  const [loadingPack, setLoadingPack] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleBuyPack = async (packIndex: number, pack: typeof PACKS[0]) => {
    if (!user) return;
    setLoadingPack(packIndex);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        walletCoins: increment(pack.coins)
      });

      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        type: "deposit",
        amount: pack.coins,
        currency: "COIN",
        status: "Success",
        description: `Purchased ₹${pack.inr} Pack`,
        createdAt: serverTimestamp()
      });

      setSuccessMsg(`Successfully added ${pack.coins} Coins!`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Transaction failed. Please try again.");
      setTimeout(() => setErrorMsg(""), 3000);
    } finally {
      setLoadingPack(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#0F1115] text-white pb-20">
      <header className="sticky top-0 z-50 bg-[#0F1115]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/5 shadow-xl">
        <button onClick={() => router.back()} className="text-white hover:text-accent transition-colors"><ChevronLeft size={24}/></button>
        <h1 className="font-black text-sm uppercase tracking-widest text-[#FFFFFF]">My Vault</h1>
        <button className="text-textMuted hover:text-white transition-colors"><HelpCircle size={20} /></button>
      </header>

      {/* Notifications */}
      <div className="absolute top-20 left-0 right-0 z-50 px-4">
        <AnimatePresence>
            {successMsg && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-success/20 border border-success/50 p-3 rounded-xl shadow-[0_5px_20px_rgba(34,197,94,0.3)] text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-success">{successMsg}</p>
                </motion.div>
            )}
            {errorMsg && (
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-danger/20 border border-danger/50 p-3 rounded-xl shadow-[0_5px_20px_rgba(239,68,68,0.3)] text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-danger">{errorMsg}</p>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <div className="p-4">
          <div className="bg-[#161B22] border gap-2 border-white/5 rounded-[2rem] p-10 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-[#161B22] to-[#161B22]">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-2">
                    <Coins size={32} className="text-accent" />
                </div>
                <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mb-1">Total Coins</p>
                <h3 className="text-5xl font-black tracking-tight text-white flex items-baseline gap-2 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">
                    {user?.walletCoins?.toLocaleString() || 0}
                </h3>
                <p className="text-[9px] text-white/40 mt-4 uppercase tracking-widest font-bold">1 INR = 5 Coins</p>
          </div>
      </div>

      {/* Deposit Packs */}
      <div className="px-4 mb-10">
          <h4 className="text-xs font-black uppercase tracking-widest mb-4 px-2 text-white/80">Get More Coins</h4>
          <div className="grid grid-cols-2 gap-3">
              {PACKS.map((pack, idx) => (
                  <button 
                     key={idx}
                     onClick={() => handleBuyPack(idx, pack)}
                     disabled={loadingPack !== null}
                     className="bg-[#161B22] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-lg hover:border-accent/40 hover:bg-white/5 transition-all group active:scale-95"
                  >
                      {pack.bonus && (
                          <div className="absolute top-0 w-full text-center bg-accent text-[#0F1115] text-[7px] font-black uppercase py-1">
                              {pack.bonus}
                          </div>
                      )}
                      
                      <div className={`mt-3 flex items-center justify-center w-full ${loadingPack === idx ? 'opacity-0' : 'opacity-100'}`}>
                          <Coins size={14} className="text-accent mr-1.5" />
                          <span className="text-lg font-black text-white">{pack.coins}</span>
                      </div>
                      
                      <div className={`mt-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/5 text-[9px] font-bold text-white/70 uppercase group-hover:text-white transition-colors ${loadingPack === idx ? 'opacity-0' : 'opacity-100'}`}>
                          Pay ₹{pack.inr}
                      </div>

                      {loadingPack === idx && (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#161B22]/80 backdrop-blur-sm">
                              <Loader2 size={24} className="animate-spin text-accent" />
                          </div>
                      )}
                  </button>
              ))}
          </div>
      </div>

      <div className="px-4 grid grid-cols-2 gap-4 mb-10">
          <button className="bg-[#161B22] border border-white/10 text-white font-black py-4 rounded-2xl shadow-xl shadow-black uppercase tracking-widest text-xs flex flex-col items-center justify-center gap-2 active:scale-95 transition-all w-full">
              <Trophy size={18} className="text-[#7698FB]" /> 
              <span className="text-[9px]">Winnings</span>
              <span className="text-white">₹{user?.walletBalance?.toLocaleString() || 0}</span>
          </button>
          <button className="bg-[#161B22] border border-white/10 text-white font-black py-4 rounded-2xl shadow-xl shadow-black uppercase tracking-widest text-xs flex flex-col items-center justify-center gap-2 active:scale-95 transition-all w-full">
              <Landmark size={18} className="text-white/50" /> 
              <span className="text-[9px]">Withdraw</span>
              <span className="text-white/40 text-[9px]">Bank / UPI</span>
          </button>
      </div>
      
      {/* Disclaimer */}
      <div className="px-6 text-center text-[9px] font-bold uppercase tracking-widest text-white/30 leading-relaxed mb-6">
         Coins are the exclusive digital currency used for contest admissions. 
         Converted coins cannot be withdrawn to bank accounts. Only winnings from contests are eligible for withdrawal.
      </div>
    </main>
  );
}
