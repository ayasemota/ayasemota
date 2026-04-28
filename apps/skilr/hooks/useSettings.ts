import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@ayz/firebase";

export interface CohortRulesSection {
  title: string;
  points: string[];
}

export type CohortRules = CohortRulesSection[];

export interface TransactionFeeRange {
  min: number;
  max: number;
}

export interface SystemSettings {
  vatRate: number;
  transactionFee: number;
  transactionFeeMin: number;
  transactionFeeMax: number;
  transactionFeeRange: TransactionFeeRange;
  cohortRules: CohortRules;
}

const defaultSettings: SystemSettings = {
  vatRate: 0,
  transactionFee: 0,
  transactionFeeMin: 0,
  transactionFeeMax: 0,
  transactionFeeRange: { min: 0, max: 0 },
  cohortRules: [],
};

const parseTransactionFeeRange = (value: unknown, fallback: number) => {
  const record =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  const min = typeof record.min === "number" ? record.min : fallback;
  const max = typeof record.max === "number" ? record.max : fallback;

  return {
    min: Math.min(min, max),
    max: Math.max(min, max),
  };
};

export const useSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const settingsRef = doc(db, "settings", "payments");

    const unsubscribe = onSnapshot(
      settingsRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          setSettings(defaultSettings);
          setLoading(false);
          return;
        }

        const data = docSnap.data();
        const legacyTransactionFee =
          typeof data.transactionFee === "number" ? data.transactionFee : 0;
        const transactionFeeRange = parseTransactionFeeRange(
          data.transactionFeeRange,
          legacyTransactionFee,
        );

        setSettings({
          vatRate: typeof data.vatRate === "number" ? data.vatRate : 0,
          transactionFee: transactionFeeRange.max,
          transactionFeeMin: transactionFeeRange.min,
          transactionFeeMax: transactionFeeRange.max,
          transactionFeeRange,
          cohortRules: Array.isArray(data.cohortRules) ? data.cohortRules : [],
        });
        setLoading(false);
      },
      () => {
        setSettings(defaultSettings);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  return { settings, loading };
};
