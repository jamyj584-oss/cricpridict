"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, HelpCircle, Minus, Plus, Lock, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function PredictSelection() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Most 6s");
  const [predictions, setPredictions] = useState<Record<string, number>>({
    "Virat Kohli": 3,
    "Glenn Maxwell": 5,
    "Rohit Sharma": 4,
    "Travis Head": 2,
    "Hardik Pandya": 0
  });

  const updatePrediction = (name: string, delta: number) => {
    setPredictions(prev => ({
      ...prev,
      [name]: Math.max(0, (prev[name] || 0) + delta)
    }));
  };

  const total = Object.values(predictions).reduce((a, b) => a + b, 0);

  return (
    <main className="min-h-screen bg-[#0F1115] text-white flex flex-col pb-24">
      {/* 06.png Header */}
      <header className="bg-[#161B22] p-4 border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="text-white"><ChevronLeft size={24}/></button>
          <div className="text-center flex-1">
            <h1 className="text-sm font-bold uppercase tracking-widest text-[#FFFFFF]">Predict & Win</h1>
          </div>
          <HelpCircle size={20} className="text-textMuted" />
        </div>

        {/* Match Info Bar from 06.png */}
        <div className="bg-[#0F1115] border border-white/5 p-4 rounded-xl flex items-center justify-between mb-4 shadow-inner">
            <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center font-black text-[10px] text-accent">IN</div>
                <span className="text-[10px] font-bold uppercase tracking-tighter mt-1">India</span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">02:45:12</span>
                <span className="text-[10px] font-bold text-textMuted opacity-30 uppercase tracking-[0.3em]">VS</span>
            </div>

            <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center font-black text-[10px] text-accent">AU</div>
                <span className="text-[10px] font-bold uppercase tracking-tighter mt-1">Australia</span>
            </div>
        </div>

        {/* 06.png Tabs */}
        <div className="flex gap-8 overflow-x-auto no-scrollbar px-2">
            {["Most 6s", "Most 4s", "Wickets", "Catch"].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`text-[11px] font-bold uppercase tracking-widest min-w-max pb-2 relative transition-all ${activeTab === tab ? 'text-accent' : 'text-textMuted'}`}
                >
                    {tab}
                    {activeTab === tab && <motion.div layoutId="pred-tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />}
                </button>
            ))}
        </div>
      </header>

      {/* 06.png Player Steppers List */}
      <div className="p-4 space-y-4">
          <div className="flex justify-between items-center px-2 mb-4">
              <span className="text-[10px] text-textMuted font-bold uppercase tracking-widest">Select Player Counts</span>
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Total: {total}</span>
          </div>

          {[
              { name: "Virat Kohli", avg: "2.4", form: "High", team: "IN" },
              { name: "Glenn Maxwell", avg: "3.1", form: "Peak", team: "AU" },
              { name: "Rohit Sharma", avg: "2.8", form: "Mid", team: "IN" },
              { name: "Travis Head", avg: "1.9", form: "High", team: "AU" },
              { name: "Hardik Pandya", avg: "1.2", form: "Low", team: "IN" }
          ].map((player) => (
              <div key={player.name} className="bg-[#161B22] border border-white/5 rounded-[1.5rem] p-4 flex items-center justify-between shadow-xl">
                   <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#0F1115] border border-white/10 flex items-center justify-center font-bold text-xs relative overflow-hidden">
                             {player.team}
                             <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 to-transparent"></div>
                        </div>
                        <div>
                             <h4 className="text-sm font-bold tracking-tight">{player.name}</h4>
                             <div className="flex items-center gap-2 mt-0.5 font-bold uppercase">
                                 <span className="text-[9px] text-textMuted tracking-widest">Avg: {player.avg}</span>
                                 <span className="text-[9px] text-[#4ADE80] tracking-widest">Form: {player.form}</span>
                             </div>
                        </div>
                   </div>

                   {/* Stepper Logic as shown in 06.png */}
                   <div className="bg-[#0F1115] border border-white/5 p-1 rounded-xl flex items-center gap-4">
                       <button 
                         onClick={() => updatePrediction(player.name, -1)}
                         className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/10 active:scale-95 transition-all"
                       >
                           <Minus size={18} />
                       </button>
                       <div className="text-center min-w-[30px]">
                           <span className="text-lg font-black leading-none block">{predictions[player.name] || 0}</span>
                           <span className="text-[7px] font-bold text-textMuted uppercase block">Sixes</span>
                       </div>
                       <button 
                         onClick={() => updatePrediction(player.name, 1)}
                         className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/10 active:scale-95 transition-all"
                       >
                           <Plus size={18} />
                       </button>
                   </div>
              </div>
          ))}

          {/* AI Smart Prediction Box from 06.png */}
          <div className="p-1">
              <div className="bg-gradient-to-br from-[#7698FB] to-[#2D3F6D] rounded-[2rem] p-6 relative overflow-hidden shadow-2xl h-[220px] flex flex-col justify-start">
                  <div className="absolute inset-0 pointer-events-none opacity-20">
                      <svg viewBox="0 0 100 100" className="w-full h-full"><circle cx="80" cy="20" r="40" fill="white" filter="blur(20px)" /></svg>
                  </div>
                  <div className="flex justify-between items-start relative z-10">
                      <div className="flex gap-3 items-center">
                          <Sparkles size={20} className="text-white" />
                          <div>
                              <h4 className="text-sm font-bold text-white shadow-xl">AI Smart Prediction</h4>
                              <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Based on pitch report & recent form</p>
                          </div>
                      </div>
                      <button className="text-[9px] font-bold uppercase tracking-widest text-[#0F1115] bg-white/30 backdrop-blur-md px-3 py-1 rounded-lg">Apply</button>
                  </div>
              </div>
          </div>
      </div>

      {/* 06.png Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0F1115]/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-between z-50 shadow-2xl">
          <div>
                <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mb-1">Potential Win</p>
                <p className="text-xl font-black text-[#4ADE80]">₹5,000</p>
          </div>
          <button 
            onClick={() => router.push("/")}
            className="bg-[#7698FB] text-[#0F1115] font-bold px-10 py-4 rounded-2xl shadow-lg shadow-accent/20 active:scale-95 transition-all flex items-center gap-3 uppercase text-xs tracking-widest"
          >
              <Lock size={16} /> Lock Predictions
          </button>
      </div>
    </main>
  );
}
