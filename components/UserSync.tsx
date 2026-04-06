"use client";
import { useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useUserStore } from "@/store/useStore";
import { AppUser } from "@/types";

export default function UserSync() {
  const { user, setUser } = useUserStore();

  useEffect(() => {
    // 1. Handled case for our TEST_USER_999 from bypass login
    const storedUser = localStorage.getItem('user-storage');
    let uid = user?.uid;

    if (!uid && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        uid = parsed.state?.user?.uid;
      } catch (e) { }
    }

    if (!uid) return;

    // 2. Listen to Firestore for real-time wallet/admin updates
    const unsub = onSnapshot(doc(db, "users", uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUser({
          uid: uid!,
          phoneNumber: data.phoneNumber ?? data.phone ?? "",
          walletBalance: data.walletBalance ?? 0,
          walletCoins: data.walletCoins ?? 0,
          kycStatus: data.kycStatus ?? "Unsubmitted",
          is18Verified: data.is18Verified ?? false,
          state: data.state ?? "Not Set",
        } as AppUser);
      }
    }, (err) => {
      console.error("UserSync Error:", err);
    });

    return () => unsub();
  }, [user?.uid, setUser]);

  return null;
}
