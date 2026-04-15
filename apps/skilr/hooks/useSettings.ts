import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@ayasemota/firebase";

export interface SystemSettings {
  vatRate: number;
  transactionFee: number;
}

export const useSettings = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const settingsRef = doc(db, "settings", "payments");
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          vatRate: typeof data.vatRate === "number" ? data.vatRate : 0,
          transactionFee: typeof data.transactionFee === "number" ? data.transactionFee : 0,
        });
      } else {
        setSettings({
          vatRate: 0,
          transactionFee: 0,
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { settings, loading };
};
