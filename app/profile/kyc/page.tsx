"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, CheckCircle, Clock } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUserStore } from "@/store/useStore";

export default function KYCVerification() {
  const router = useRouter();
  const { user } = useUserStore();

  const [fullName, setFullName] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const kycStatus = user?.kycStatus || "Unsubmitted";

  const handleSubmitKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Basic PAN Regex Check
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase())) {
       alert("Invalid PAN Card format. Must be like ABCDE1234F.");
       return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
         kycStatus: "Pending",
         kycDetails: {
           fullName,
           panNumber: panNumber.toUpperCase()
         }
      });
      alert("KYC Submitted! Our team will verify it shortly.");
      router.back();
    } catch (err) {
      alert("Failed to submit KYC. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pb-24 min-h-screen flex flex-col">
      <div className="glass-header p-4 sticky top-0 z-50 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-xl">&larr;</button>
        <h1 className="font-bold text-lg">KYC Verification</h1>
      </div>

      <div className="p-6">
        {kycStatus === "Verified" ? (
          <div className="glass-card p-6 border border-success/30 flex flex-col items-center text-center">
             <CheckCircle className="text-success mb-4" size={48} />
             <h2 className="text-xl font-bold text-success mb-2">Verification Complete</h2>
             <p className="text-sm text-textMuted">Your account is fully verified. You have full access to withdrawals!</p>
          </div>
        ) : kycStatus === "Pending" ? (
          <div className="glass-card p-6 border border-yellow-500/30 flex flex-col items-center text-center">
             <Clock className="text-yellow-500 mb-4" size={48} />
             <h2 className="text-xl font-bold text-yellow-500 mb-2">Review in Progress</h2>
             <p className="text-sm text-textMuted">Your documents are submitted and under review. This usually takes 2-4 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitKYC} className="glass-card p-6 border border-white/10 flex flex-col gap-6">
            <div className="bg-danger/20 p-4 rounded-xl border border-danger/30 flex gap-3 text-sm items-start">
               <ShieldAlert className="text-danger flex-shrink-0 mt-0.5" size={20} />
               <p>As per Indian Govt Regulations, KYC is mandatory for all real-money fantasy platforms before processing any withdrawals.</p>
            </div>

            <div>
              <label className="text-xs text-textMuted font-bold uppercase tracking-wider mb-2 block">Name on PAN Card</label>
              <input 
                 required 
                 value={fullName}
                 onChange={e => setFullName(e.target.value)}
                 className="w-full bg-primary/50 border border-white/10 rounded-lg px-4 py-3" 
                 placeholder="Enter full legal name" 
              />
            </div>

            <div>
              <label className="text-xs text-textMuted font-bold uppercase tracking-wider mb-2 block">10-Digit PAN Number</label>
              <input 
                 required 
                 value={panNumber}
                 onChange={e => setPanNumber(e.target.value)}
                 className="w-full bg-primary/50 border border-white/10 rounded-lg px-4 py-3 uppercase" 
                 placeholder="ABCDE1234F" 
                 maxLength={10}
              />
            </div>

            <button disabled={loading} type="submit" className="w-full bg-accent text-primary font-bold py-3.5 rounded-xl disabled:opacity-50 transition-colors mt-4">
              {loading ? "Submitting securely..." : "Submit for Verification"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
