"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Smartphone, Info, CheckCircle2 } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

import { useUserStore } from "@/store/useStore";

export default function Login() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const [is18Plus, setIs18Plus] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.recaptchaVerifier && auth) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': () => {}
        });
      } catch (err) {
        console.error("Recaptcha init error:", err);
      }
    }
  }, []);

  const handleSendOtp = async () => {
    setError("");
    if (phoneNumber.length < 10) {
      setError("Please enter a valid 10-digit number.");
      return;
    }
    if (!is18Plus) {
      setError("Please confirm your age and terms.");
      return;
    }

    setLoading(true);
    try {
      if (!auth) throw new Error("Authentication not initialized");
      const appVerifier = window.recaptchaVerifier;
      const formatPhone = `+91${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(auth, formatPhone, appVerifier);
      
      setConfirmationResult(confirmation);
      setIsOtpSent(true);
    } catch (err: any) {
      console.error(err);
      setError(err.code === 'auth/invalid-api-key' ? "Firebase Config Error: Invalid API Key" : err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (otp.length < 6) {
      setError("Enter 6-digit OTP");
      return;
    }
    
    setLoading(true);
    try {
      if (confirmationResult) {
        const result = await confirmationResult.confirm(otp);
        const firebaseUser = result.user;
        
        const userRef = doc(db, "users", firebaseUser.uid);
        let userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          const newUser = {
            uid: firebaseUser.uid,
            phoneNumber: firebaseUser.phoneNumber || "",
            walletBalance: 2450, // Starting balance
            teamsCount: 0,
            joinedContests: 0,
            createdAt: serverTimestamp(),
            is18Verified: true,
            isAdmin: false,
            kycStatus: "Unsubmitted",
            state: "Not Set"
          };
          await setDoc(userRef, newUser);
          userSnap = await getDoc(userRef); // Re-fetch to get consistent object
        }

        const userData = userSnap.data();
        if (userData) {
            setUser({
                uid: firebaseUser.uid,
                phoneNumber: userData.phoneNumber || firebaseUser.phoneNumber || "",
                walletBalance: userData.walletBalance ?? 0,
                is18Verified: userData.is18Verified ?? false,
                state: userData.state ?? "Not Set",
                kycStatus: userData.kycStatus ?? "Unsubmitted",
                isAdmin: userData.isAdmin ?? false
            } as any);
        }
        
        router.push("/");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0F1115] text-white flex flex-col items-center justify-between py-12 px-6">
      <div id="recaptcha-container"></div>
      
      {/* Top Branding Section */}
      <div className="flex flex-col items-center mt-4">
        <div className="w-24 h-24 bg-[#161B22] border border-white/10 rounded-[2rem] flex items-center justify-center p-5 shadow-2xl relative">
          <div className="absolute inset-0 bg-accent/5 rounded-[2rem] blur-xl opacity-50"></div>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white relative z-10">
            <path d="M12 2v20M2 12h20" stroke="rgba(255,255,255,0.1)"></path>
            <path d="M18 6L6 18M6 6l12 12" stroke="rgba(255,255,255,0.1)"></path>
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5"></circle>
            <path d="m14 10-2.5 2.5a2 2 0 1 1-2.8-2.8L11.2 7.2" stroke="white" strokeWidth="2"></path>
          </svg>
        </div>
        <h1 className="text-4xl font-bold mt-6 tracking-tight">CricPredict</h1>
        <p className="text-accent text-[10px] tracking-[0.3em] font-bold mt-2 uppercase opacity-80">The Imperial Selection</p>
        <div className="w-12 h-0.5 bg-white/20 mt-4 rounded-full"></div>
        <p className="text-textMuted text-xs mt-6">Play Smart. Win Big.</p>
      </div>

      {/* Login Card Section */}
      <div className="w-full max-w-[380px]">
        <div className="bg-[#161B22] border border-white/5 rounded-[2rem] p-8 shadow-2xl mb-6">
          <h2 className="text-2xl font-bold">Welcome, Player</h2>
          <p className="text-textMuted text-sm mt-1 mb-8">Enter your mobile number to begin</p>

          {!isOtpSent ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider font-bold text-textMuted">Mobile Number</label>
                <div className="flex gap-3">
                  <div className="bg-[#0F1115] border border-white/5 rounded-xl px-4 py-3.5 flex items-center gap-2">
                    <div className="w-5 h-4 bg-white/10 rounded-sm"></div>
                    <span className="font-bold text-sm text-white/90">+91</span>
                  </div>
                  <div className="flex-1 bg-[#0F1115] border border-white/5 rounded-xl px-4 py-3.5 flex items-center gap-3 focus-within:border-accent/40 transition-all">
                    <Smartphone size={18} className="text-textMuted" />
                    <input 
                      type="tel" 
                      maxLength={10}
                      placeholder="98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                      className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-white/10"
                    />
                  </div>
                </div>
              </div>

              {error && <p className="text-danger text-[10px] font-bold text-center">{error}</p>}

              <button 
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-[#7698FB] text-[#0F1115] font-bold py-4 rounded-2xl shadow-lg shadow-[#7698FB]/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? "Sending..." : "Get OTP"}
              </button>

              <div className="flex justify-between items-center px-2 pt-2 text-[10px] font-bold text-textMuted opacity-80 uppercase tracking-widest">
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-accent"></div> Instant Payouts</div>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-accent"></div> AI Insights</div>
                <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-accent"></div> 24/7 Support</div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider font-bold text-textMuted text-center block">Enter 6-Digit OTP sent to {phoneNumber}</label>
                <div className="flex-1 bg-[#0F1115] border border-white/5 rounded-xl px-4 py-4 flex items-center gap-3 focus-within:border-accent/40 transition-all">
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="------"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                    className="bg-transparent border-none outline-none w-full text-center text-xl font-bold tracking-[0.5em] placeholder:text-white/10"
                  />
                </div>
              </div>
              {error && <p className="text-danger text-[10px] font-bold text-center">{error}</p>}
              <button 
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-[#4ADE80] text-[#0F1115] font-bold py-4 rounded-2xl shadow-lg shadow-[#4ADE80]/20 hover:brightness-110 active:scale-[0.98] transition-all"
              >
                {loading ? "Verifying..." : "Verify & Play"}
              </button>
              <button onClick={() => setIsOtpSent(false)} className="text-[10px] font-bold text-textMuted uppercase tracking-widest block mx-auto hover:text-white">Change Number</button>
            </div>
          )}
        </div>

        {/* Legal and Security Footer */}
        <div className="space-y-6">
          <div className="flex items-start gap-4 px-2">
            <button 
              onClick={() => setIs18Plus(!is18Plus)}
              className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${is18Plus ? 'bg-accent border-accent' : 'bg-transparent border-white/20'}`}
            >
              {is18Plus && <CheckCircle2 size={16} className="text-primary" />}
            </button>
            <p className="text-[11px] text-textMuted leading-relaxed">
              I confirm that I am <strong className="text-white">18+ years old</strong> and I agree to the <span className="text-accent underline cursor-pointer">Terms & Conditions</span>.
              <br /><span className="italic opacity-60">Fantasy sports involves financial risk. Please play responsibly.</span>
            </p>
          </div>

          <div className="bg-[#161B22] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-success" />
              <div>
                <h3 className="text-xs font-bold">100% Secure & Legal</h3>
                <p className="text-[9px] text-textMuted">ISO Certified Gaming Platform</p>
              </div>
            </div>
            <div className="flex gap-3 grayscale opacity-50">
              <div className="flex flex-col items-start leading-[0]">
                <p className="text-[9px] font-bold">VISA</p>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-white opacity-40 -mr-1.5"></div>
                <div className="w-3 h-3 rounded-full bg-white opacity-40"></div>
              </div>
            </div>
          </div>
        </div>
        {/* Developer Mock Login (Only for Testing) */}
        <div className="mt-8 pt-8 border-t border-white/5">
          <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest text-center mb-4">Internal Testing Only</p>
          <button
            onClick={async () => {
                const testUid = "TEST_USER_999";
                const userRef = doc(db, "users", testUid);
                const userSnap = await getDoc(userRef);
                
                if (!userSnap.exists()) {
                    await setDoc(userRef, {
                        uid: testUid,
                        phoneNumber: "+919999999999",
                        walletBalance: 2450, // Match initial balance
                        is18Verified: true,
                        state: "Maharashtra",
                        kycStatus: "Unsubmitted",
                        isAdmin: true,
                        createdAt: serverTimestamp()
                    });
                }
                
                const testUser = {
                    uid: testUid,
                    phoneNumber: "+919999999999",
                    walletBalance: 2450,
                    isAdmin: true,
                    kycStatus: "Unsubmitted",
                    is18Verified: true,
                    state: "Maharashtra"
                };

                setUser(testUser as any);
                router.push("/");
            }}
            className="w-full bg-white/5 border border-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-all text-xs uppercase tracking-widest"
          >
            Developer Bypass Login
          </button>
        </div>
      </div>

      <p className="text-[10px] font-bold text-textMuted tracking-[0.2em] opacity-40 uppercase mt-auto">Estd. 2024</p>
    </main>
  );
}
