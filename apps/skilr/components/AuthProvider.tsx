"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@ayasemota/firebase";
import { User } from "@/types";

const AUTH_STORAGE_KEY = "skilr_user_session";

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  signIn: (pin: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUnclearedAmount: (email: string, amountToReduce: number) => Promise<void>;
  updateProfile: (fields: { firstName: string; lastName: string; phone: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);
        if (savedSession) {
          const sessionData = JSON.parse(savedSession);
          const userRef = doc(db, "users", sessionData.id);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = { ...userDoc.data(), id: userDoc.id } as User;
            setUser(userData);
            setIsLoggedIn(true);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
          } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error("Error restoring session:", error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const userRef = doc(db, "users", user.id);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = { ...doc.data(), id: doc.id } as User;
        setUser(userData);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      } else {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem("loginTime");
      }
    });

    return () => unsubscribe();
  }, [user?.id]);

  const signIn = async (pin: string) => {
    try {
      setLoading(true);
      let q = query(collection(db, "users"), where("pin", "==", pin));
      let querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        const fallbackId = "ayevbosa_asemota_1775566381938";
        q = query(collection(db, fallbackId), where("pin", "==", pin));
        querySnapshot = await getDocs(q);
      }

      if (querySnapshot.empty) {
        throw new Error("User not found.");
      }

      const userDoc = querySnapshot.docs[0];
      const userData = { ...userDoc.data(), id: userDoc.id } as User;

      setUser(userData);
      setIsLoggedIn(true);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      localStorage.setItem("loginTime", Date.now().toString());
    } catch (error: any) {
      console.error("Login Error:", error);
      throw new Error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("loginTime");
  };

  const updateUnclearedAmount = async (email: string, amountToReduce: number) => {
    try {
      if (!user?.id) throw new Error("No user logged in");
      const userRef = doc(db, "users", user.id);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentUncleared = userData.unclearedAmount || 0;
        const newUncleared = Math.max(0, currentUncleared - amountToReduce);
        await updateDoc(userRef, { unclearedAmount: newUncleared });
      }
    } catch (error) {
      console.error("Error updating uncleared amount:", error);
      throw error;
    }
  };

  const updateProfile = async (fields: { firstName: string; lastName: string; phone: string }) => {
    try {
      if (!user?.id) throw new Error("No user logged in");
      const sanitized = {
        firstName: fields.firstName.replace(/\s/g, ""),
        lastName: fields.lastName.replace(/\s/g, ""),
        phone: fields.phone.trim(),
      };
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, sanitized);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        loading,
        signIn,
        signOut,
        updateUnclearedAmount,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
