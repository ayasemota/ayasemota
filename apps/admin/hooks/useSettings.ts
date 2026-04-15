import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@ayasemota/firebase";

export interface SystemSettings {
  vatRate: number;
  transactionFee: number;
}

export const useSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    vatRate: 0,
    transactionFee: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const settingsRef = doc(db, "settings", "payments");
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          vatRate: data.vatRate || 0,
          transactionFee: data.transactionFee || 0,
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    const settingsRef = doc(db, "settings", "payments");
    await setDoc(settingsRef, newSettings, { merge: true });
  };

  return { settings, loading, updateSettings };
};
