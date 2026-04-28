import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
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

const defaultCohortRules: CohortRules = [
  {
    title: "Class Structure",
    points: [
      "Classes hold every Thursday and Saturday.",
      "Additional classes may be scheduled based on group activity and engagement.",
      "Missing two consecutive classes without a valid reason leads to automatic dismissal.",
    ],
  },
  {
    title: "Confidentiality Agreement",
    points: [
      "All class materials are confidential. This includes recordings, documents, discussions, methods, and internal information.",
      "Materials must not be shared, resold, or disclosed outside the program.",
      "Confidentiality applies during and after participation except with prior permission.",
    ],
  },
  {
    title: "Payment Plan and Cancellation",
    points: [
      "Payments are due on the 1st day of each month.",
      "Missing classes or opting for a dismissal does not qualify for a refund.",
      "Dismissal for misconduct, inactivity, or breach does not attract a refund.",
      "If dismissal is requested or assigned, classes will be placed on hold but outstanding balance must be paid in full before dismissal is granted.",
    ],
  },
];

const parsePoints = (value: unknown, fallback: string[]): string[] => {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const cleaned = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);

  return cleaned.length > 0 ? cleaned : fallback;
};

const parseSection = (
  value: unknown,
  fallback: CohortRulesSection,
): CohortRulesSection => {
  const record =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  return {
    title:
      typeof record.title === "string" && record.title.trim().length > 0
        ? record.title
        : fallback.title,
    points: parsePoints(record.points, fallback.points),
  };
};

const parseCohortRules = (value: unknown): CohortRules => {
  if (Array.isArray(value)) {
    const parsed = value
      .map((entry) => parseSection(entry, defaultCohortRules[0]))
      .filter(
        (entry) => entry.title.trim().length > 0 || entry.points.length > 0,
      );
    return parsed.length > 0 ? parsed : defaultCohortRules;
  }

  const record =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  const legacy = [
    parseSection(record.classStructure, defaultCohortRules[0]),
    parseSection(record.confidentiality, defaultCohortRules[1]),
    parseSection(record.paymentPlan, defaultCohortRules[2]),
  ];

  return legacy;
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
  const [settings, setSettings] = useState<SystemSettings>({
    vatRate: 0,
    transactionFee: 0,
    transactionFeeMin: 0,
    transactionFeeMax: 0,
    transactionFeeRange: { min: 0, max: 0 },
    cohortRules: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const settingsRef = doc(db, "settings", "payments");
    const unsubscribe = onSnapshot(
      settingsRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const legacyTransactionFee =
            typeof data.transactionFee === "number" ? data.transactionFee : 0;
          const transactionFeeRange = parseTransactionFeeRange(
            data.transactionFeeRange,
            legacyTransactionFee,
          );

          setSettings({
            vatRate: data.vatRate || 0,
            transactionFee: transactionFeeRange.max,
            transactionFeeMin: transactionFeeRange.min,
            transactionFeeMax: transactionFeeRange.max,
            transactionFeeRange,
            cohortRules: parseCohortRules(data.cohortRules),
          });
        } else {
          setSettings({
            vatRate: 0,
            transactionFee: 0,
            transactionFeeMin: 0,
            transactionFeeMax: 0,
            transactionFeeRange: { min: 0, max: 0 },
            cohortRules: [],
          });
        }

        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    const settingsRef = doc(db, "settings", "payments");
    await setDoc(settingsRef, newSettings, { merge: true });
  };

  return { settings, loading, error, updateSettings };
};
