import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@ayasemota/firebase";
import { Payment } from "@ayasemota/types";

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

export const usePayments = (userEmail: string | null) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(!!userEmail);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userEmail) {
      return;
    }

    const paymentsRef = collection(db, "payments");
    const q = query(paymentsRef, where("userEmail", "==", userEmail));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const paymentsData: Payment[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            amount: data.amount,
            date: data.date,
            paymentDate: data.paymentDate,
            paymentTime: data.paymentTime,
            status: data.status,
            reference: data.reference,
            userEmail: data.userEmail,
            createdAt: data.createdAt,
          };
        });

        paymentsData.sort(
          (a, b) => getPaymentTimestamp(b) - getPaymentTimestamp(a),
        );

        setPayments(paymentsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userEmail]);

  const addPayment = async (payment: Omit<Payment, "id">, email: string) => {
    try {
      const docRef = await addDoc(collection(db, "payments"), {
        ...payment,
        userEmail: email,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      throw error instanceof Error ? error : new Error("Failed to add payment");
    }
  };

  const updatePayment = async (
    paymentId: string,
    updates: Partial<Omit<Payment, "id">>
  ) => {
    try {
      const paymentRef = doc(db, "payments", paymentId);
      await updateDoc(paymentRef, updates);
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Failed to update payment");
    }
  };

  return { payments, loading, error, addPayment, updatePayment };
};
