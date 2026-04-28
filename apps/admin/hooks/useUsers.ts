import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@ayz/firebase";
import { User } from "@ayz/types";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const usersRef = collection(db, "users");

    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        const usersData: User[] = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phone: data.phone || "",
            pin: data.pin || "",
            status: data.status || "",
            unclearedAmount: data.unclearedAmount || 0,
            dateOfBirth: data.dateOfBirth || "",
            telegramUsername: data.telegramUsername || "",
            skillLevel: data.skillLevel || "",
            budget: data.budget || "",
            paymentStructure: data.paymentStructure || "",
            classLink: data.classLink || "",
            createdAt: data.createdAt,
          };
        });

        setUsers(usersData);

        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching users:", err);
        setError(err.message);
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const updateUser = async (userId: string, updates: Partial<User>) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updates);
  };

  const addUser = async (newUser: Partial<User>) => {
    let docId = newUser.email
      ? newUser.email.toLowerCase().replace(/[^a-z0-9@.]/g, "")
      : "";
    if (!docId) {
      docId = `${newUser.firstName || ""}_${newUser.lastName || ""}`
        .toLowerCase()
        .replace(/\s+/g, "_");
      if (!docId || docId === "_") docId = `user_${Date.now()}`;
    }
    const userRef = doc(db, "users", docId);
    await setDoc(userRef, { ...newUser, createdAt: Timestamp.now() });
    return docId;
  };

  const deleteUser = async (userId: string) => {
    const userRef = doc(db, "users", userId);
    await deleteDoc(userRef);
  };

  return { users, loading, error, updateUser, addUser, deleteUser };
};
