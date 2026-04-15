import { useState, useEffect, useCallback } from "react";
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "@ayasemota/firebase";
import { User } from "@ayasemota/types";

interface PendingUserUpdate {
  id: string;
  userId: string;
  updates: Partial<User>;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>(() => {
    if (typeof window !== "undefined") {
      const cachedData = localStorage.getItem("cached_users");
      if (cachedData) {
        try {
          return JSON.parse(cachedData);
        } catch (e) {
          console.error("Error parsing cached users:", e);
        }
      }
    }
    return [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncPendingUserUpdates = useCallback(async () => {
    const pendingStr = localStorage.getItem("pending_user_updates");
    if (!pendingStr) return;

    try {
      const pending: PendingUserUpdate[] = JSON.parse(pendingStr);

      for (const item of pending) {
        try {
          const userRef = doc(db, "users", item.userId);
          await updateDoc(userRef, item.updates);
        } catch (error) {
          console.error(`Failed to sync user update ${item.id}:`, error);
        }
      }

      localStorage.removeItem("pending_user_updates");
    } catch (error) {
      console.error("Error syncing pending user updates:", error);
    }
  }, []);

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
            status: data.status || "",
            unclearedAmount: data.unclearedAmount || 0,
            createdAt: data.createdAt,
          };
        });

        setUsers(usersData);

        localStorage.setItem("cached_users", JSON.stringify(usersData));

        if (navigator.onLine) {
          syncPendingUserUpdates();
        }

        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching users:", err);
        setError(err.message);
        setLoading(false);
      },
    );

    const handleOnline = () => {
      console.log("Connection restored - syncing pending user updates");
      syncPendingUserUpdates();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      unsubscribe();
      window.removeEventListener("online", handleOnline);
    };
  }, [syncPendingUserUpdates]);

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      if (navigator.onLine) {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, updates);
      } else {
        const pending: PendingUserUpdate[] = JSON.parse(
          localStorage.getItem("pending_user_updates") || "[]",
        );
        pending.push({
          id: `temp_${Date.now()}`,
          userId,
          updates,
        });
        localStorage.setItem("pending_user_updates", JSON.stringify(pending));

        const updated = users.map((u) =>
          u.id === userId ? { ...u, ...updates } : u,
        );
        setUsers(updated);
        localStorage.setItem("cached_users", JSON.stringify(updated));
      }
    } catch (error) {
      const pending: PendingUserUpdate[] = JSON.parse(
        localStorage.getItem("pending_user_updates") || "[]",
      );
      pending.push({
        id: `temp_${Date.now()}`,
        userId,
        updates,
      });
      localStorage.setItem("pending_user_updates", JSON.stringify(pending));
      throw error instanceof Error ? error : new Error("Failed to update user");
    }
  };

  const addUser = async (newUser: Partial<User>) => {
    if (!navigator.onLine) throw new Error("Must be online to create a user");
    
    let docId = newUser.email ? newUser.email.toLowerCase().replace(/[^a-z0-9@.]/g, '') : "";
    if (!docId) {
      docId = `${newUser.firstName || ''}_${newUser.lastName || ''}`.toLowerCase().replace(/\\s+/g, '_');
      if (!docId || docId === "_") docId = `user_${Date.now()}`;
    }
    const userRef = doc(db, "users", docId);
    await setDoc(userRef, { ...newUser, createdAt: Timestamp.now() });
    return docId;
  };

  const deleteUser = async (userId: string) => {
    if (!navigator.onLine) throw new Error("Must be online to delete a user");
    const userRef = doc(db, "users", userId);
    await deleteDoc(userRef);
  };

  return { users, loading, error, updateUser, addUser, deleteUser };
};
