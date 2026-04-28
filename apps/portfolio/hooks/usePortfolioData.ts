import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@ayz/firebase";

export interface PortfolioData {
  about: string[];
  skills: string[];
}

export const usePortfolioData = () => {
  const [data, setData] = useState<PortfolioData>({
    about: [],
    skills: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, "settings", "portfolio");
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const d = snapshot.data();
        setData({
          about: Array.isArray(d.about) ? d.about : [d.about || ""],
          skills: Array.isArray(d.skills) ? d.skills : [],
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { data, loading };
};
