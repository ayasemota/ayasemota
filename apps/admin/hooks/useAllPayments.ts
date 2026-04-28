import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@ayz/firebase";
import { Payment } from "@ayz/types";

const getPaymentTimestamp = (payment: Payment) => {
  const dateValue = payment.paymentDate || payment.date;

  if (dateValue) {
    const dateTime = `${dateValue} ${payment.paymentTime || "00:00"}`;
    const parsed = new Date(dateTime).getTime();
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  if (
    payment.createdAt &&
    typeof payment.createdAt === "object" &&
    "seconds" in payment.createdAt
  ) {
    return payment.createdAt.seconds * 1000;
  }

  return 0;
};

export function useAllPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const paymentsRef = collection(db, "payments");

    const unsubscribe = onSnapshot(
      paymentsRef,
      (snapshot) => {
        const paymentsData: Payment[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Payment[];
        paymentsData.sort(
          (a, b) => getPaymentTimestamp(b) - getPaymentTimestamp(a),
        );
        setPayments(paymentsData);

        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching payments:", err);
        setError("Failed to load payments");
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

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
      const paymentRef = doc(db, "payments", paymentId);
      await updateDoc(paymentRef, updates);
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
      const paymentRef = doc(db, "payments", paymentId);
      await deleteDoc(paymentRef);
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
