"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Lock, AlertCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLogin() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(pin)) {
      router.push("/admin");
    } else {
      setError(true);
      setPin("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#161B22] p-8 rounded-[2rem] border border-white/5 w-full max-w-sm shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
            <Lock size={24} className="text-accent" />
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-widest text-center">API Control<br/>System</h1>
          <p className="text-[10px] text-textMuted uppercase tracking-widest font-bold mt-2">Restricted Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="password" 
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(false); }}
              placeholder="ENTER SECURE PIN"
              className="w-full bg-[#0F1115] border border-white/10 p-4 rounded-xl text-center text-accent font-black tracking-[0.5em] focus:outline-none focus:border-accent/50 transition-colors"
              autoFocus
            />
          </div>
          
          <div className="h-6 flex items-center justify-center">
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-danger text-[10px] uppercase font-bold tracking-widest">
                        <AlertCircle size={12} /> Invalid PIN
                    </motion.div>
                )}
            </AnimatePresence>
          </div>

          <button 
            type="submit"
            className="w-full bg-accent text-[#0F1115] p-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_5px_15px_rgba(255,215,0,0.2)] active:scale-95 transition-all"
          >
            Authenticate <ArrowRight size={16} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
