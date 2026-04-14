import { useState, useEffect, useCallback } from "react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@ayasemota/firebase";
import { Payment } from "@ayasemota/types";

interface PendingPayment {
  id: string;
  payment: Omit<Payment, "id">;
  type: "add" | "update" | "delete";
  paymentId?: string;
}

export function useAllPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const syncPendingPayments = useCallback(async () => {
    const pendingStr = localStorage.getItem("pending_payments");
    if (!pendingStr) return;

    try {
      const pending: PendingPayment[] = JSON.parse(pendingStr);

      for (const item of pending) {
        try {
          if (item.type === "add") {
            await addDoc(collection(db, "payments"), {
              ...item.payment,
              createdAt: Timestamp.now(),
            });
          } else if (item.type === "update" && item.paymentId) {
            const paymentRef = doc(db, "payments", item.paymentId);
            await updateDoc(paymentRef, item.payment);
          } else if (item.type === "delete" && item.paymentId) {
            await deleteDoc(doc(db, "payments", item.paymentId));
          }
        } catch (error) {
          console.error(`Failed to sync payment ${item.id}:`, error);
        }
      }

      localStorage.removeItem("pending_payments");
    } catch (error) {
      console.error("Error syncing pending payments:", error);
    }
  }, []);

  useEffect(() => {
    const cachedData = localStorage.getItem("cached_payments");
    if (cachedData) {
      try {
        setPayments(JSON.parse(cachedData));
      } catch (e) {
        console.error("Error parsing cached payments:", e);
      }
    }

    const paymentsRef = collection(db, "payments");
    const q = query(paymentsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const paymentsData: Payment[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Payment[];
        setPayments(paymentsData);

        localStorage.setItem("cached_payments", JSON.stringify(paymentsData));

        if (navigator.onLine) {
          syncPendingPayments();
        }

        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching payments:", err);
        setError("Failed to load payments");
        setLoading(false);
      },
    );

    const handleOnline = () => {
      console.log("Connection restored - syncing pending payments");
      syncPendingPayments();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      unsubscribe();
      window.removeEventListener("online", handleOnline);
    };
  }, [syncPendingPayments]);

  const addPayment = async (
    payment: {
      userEmail: string;
      userName: string;
      userId: string;
      amount: number;
      status: string;
      reference: string;
      date: string;
      paymentDate?: string;
      paymentTime?: string;
    },
    customId?: string,
  ) => {
    setIsSaving(true);
    try {
      if (navigator.onLine) {
        let docRef;
        if (customId) {
          docRef = doc(db, "payments", customId);
          await setDoc(docRef, {
            ...payment,
            createdAt: Timestamp.now(),
          });
        } else {
          docRef = await addDoc(collection(db, "payments"), {
            ...payment,
            createdAt: Timestamp.now(),
          });
        }
        return docRef.id;
      } else {
        const tempId = customId || `temp_${Date.now()}`;
        const pending: PendingPayment[] = JSON.parse(
          localStorage.getItem("pending_payments") || "[]",
        );
        pending.push({
          id: tempId,
          payment: payment as Omit<Payment, "id">,
          type: "add",
        });
        localStorage.setItem("pending_payments", JSON.stringify(pending));

        const newPayment = {
          id: tempId,
          ...payment,
          createdAt: Timestamp.now(),
        } as Payment;
        const updated = [newPayment, ...payments];
        setPayments(updated);
        localStorage.setItem("cached_payments", JSON.stringify(updated));
        return tempId;
      }
    } catch (err) {
      console.error("Error adding payment:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const updatePayment = async (
    paymentId: string,
    updates: Partial<Payment>,
  ) => {
    setIsSaving(true);
    try {
      if (navigator.onLine) {
        const paymentRef = doc(db, "payments", paymentId);
        await updateDoc(paymentRef, updates);
      } else {
        const pending: PendingPayment[] = JSON.parse(
          localStorage.getItem("pending_payments") || "[]",
        );
        pending.push({
          id: `temp_${Date.now()}`,
          payment: updates as Omit<Payment, "id">,
          type: "update",
          paymentId,
        });
        localStorage.setItem("pending_payments", JSON.stringify(pending));

        const updated = payments.map((p) =>
          p.id === paymentId ? { ...p, ...updates } : p,
        );
        setPayments(updated);
        localStorage.setItem("cached_payments", JSON.stringify(updated));
      }
    } catch (err) {
      console.error("Error updating payment:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const deletePayment = async (paymentId: string) => {
    setIsSaving(true);
    try {
      if (navigator.onLine) {
        const paymentRef = doc(db, "payments", paymentId);
        await deleteDoc(paymentRef);
      } else {
        const pending: PendingPayment[] = JSON.parse(
          localStorage.getItem("pending_payments") || "[]",
        );
        pending.push({
          id: `temp_${Date.now()}`,
          payment: {} as Omit<Payment, "id">,
          type: "delete",
          paymentId,
        });
        localStorage.setItem("pending_payments", JSON.stringify(pending));

        const updated = payments.filter((p) => p.id !== paymentId);
        setPayments(updated);
        localStorage.setItem("cached_payments", JSON.stringify(updated));
      }
    } catch (err) {
      console.error("Error deleting payment:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    payments,
    loading,
    error,
    isSaving,
    addPayment,
    updatePayment,
    deletePayment,
  };
}
