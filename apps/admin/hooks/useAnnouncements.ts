import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  Timestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@ayasemota/firebase";
import { Announcement } from "@ayasemota/types";

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const announcementsRef = collection(db, "announcements");
    const q = query(announcementsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const announcementsData: Announcement[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || "",
            description: data.description || "",
            isVisible: data.isVisible ?? true,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });

        setAnnouncements(announcementsData);

        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const addAnnouncement = async (
    announcement: Omit<Announcement, "id">,
    customId?: string,
  ) => {
    setIsSaving(true);
    try {
      let docRef;
      if (customId) {
        docRef = doc(db, "announcements", customId);
        await setDoc(docRef, {
          ...announcement,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      } else {
        docRef = await addDoc(collection(db, "announcements"), {
          ...announcement,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }
      return docRef.id;
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Failed to add announcement");
    } finally {
      setIsSaving(false);
    }
  };

  const updateAnnouncement = async (
    announcementId: string,
    updates: Partial<Announcement>,
  ) => {
    setIsSaving(true);
    try {
      const announcementRef = doc(db, "announcements", announcementId);
      await updateDoc(announcementRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Failed to update announcement");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    setIsSaving(true);
    try {
      await deleteDoc(doc(db, "announcements", announcementId));
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Failed to delete announcement");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    announcements,
    loading,
    error,
    isSaving,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  };
};
