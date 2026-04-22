import { useState, useEffect, useCallback } from "react";
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

interface PendingAnnouncement {
  id: string;
  announcement: Omit<Announcement, "id">;
  type: "add" | "update" | "delete";
  announcementId?: string;
}

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const syncPendingAnnouncements = useCallback(async () => {
    const pendingStr = localStorage.getItem("pending_announcements");
    if (!pendingStr) return;

    try {
      const pending: PendingAnnouncement[] = JSON.parse(pendingStr);

      for (const item of pending) {
        try {
          if (item.type === "add") {
            await addDoc(collection(db, "announcements"), {
              ...item.announcement,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            });
          } else if (item.type === "update" && item.announcementId) {
            const announcementRef = doc(
              db,
              "announcements",
              item.announcementId,
            );
            await updateDoc(announcementRef, {
              ...item.announcement,
              updatedAt: Timestamp.now(),
            });
          } else if (item.type === "delete" && item.announcementId) {
            await deleteDoc(doc(db, "announcements", item.announcementId));
          }
        } catch (error) {
          console.error(`Failed to sync announcement ${item.id}:`, error);
        }
      }

      localStorage.removeItem("pending_announcements");
    } catch (error) {
      console.error("Error syncing pending announcements:", error);
    }
  }, []);

  useEffect(() => {
    const cachedData = localStorage.getItem("cached_announcements");
    if (cachedData) {
      try {
        setAnnouncements(JSON.parse(cachedData));
      } catch (e) {
        console.error("Error parsing cached announcements:", e);
      }
    }

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

        localStorage.setItem(
          "cached_announcements",
          JSON.stringify(announcementsData),
        );

        if (navigator.onLine) {
          syncPendingAnnouncements();
        }

        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    const handleOnline = () => {
      syncPendingAnnouncements();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      unsubscribe();
      window.removeEventListener("online", handleOnline);
    };
  }, [syncPendingAnnouncements]);

  const addAnnouncement = async (
    announcement: Omit<Announcement, "id">,
    customId?: string,
  ) => {
    setIsSaving(true);
    try {
      if (navigator.onLine) {
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
      } else {
        const tempId = customId || `temp_${Date.now()}`;
        const pending: PendingAnnouncement[] = JSON.parse(
          localStorage.getItem("pending_announcements") || "[]",
        );
        pending.push({
          id: tempId,
          announcement,
          type: "add",
        });
        localStorage.setItem("pending_announcements", JSON.stringify(pending));

        const newAnnouncement: Announcement = {
          id: tempId,
          ...announcement,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };
        setAnnouncements([newAnnouncement, ...announcements]);
        localStorage.setItem(
          "cached_announcements",
          JSON.stringify([newAnnouncement, ...announcements]),
        );
        return tempId;
      }
    } catch (error) {
      const tempId = customId || `temp_${Date.now()}`;
      const pending: PendingAnnouncement[] = JSON.parse(
        localStorage.getItem("pending_announcements") || "[]",
      );
      pending.push({
        id: tempId,
        announcement,
        type: "add",
      });
      localStorage.setItem("pending_announcements", JSON.stringify(pending));
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
      if (navigator.onLine) {
        const announcementRef = doc(db, "announcements", announcementId);
        await updateDoc(announcementRef, {
          ...updates,
          updatedAt: Timestamp.now(),
        });
      } else {
        const pending: PendingAnnouncement[] = JSON.parse(
          localStorage.getItem("pending_announcements") || "[]",
        );
        pending.push({
          id: `temp_${Date.now()}`,
          announcement: updates as Omit<Announcement, "id">,
          type: "update",
          announcementId,
        });
        localStorage.setItem("pending_announcements", JSON.stringify(pending));

        const updated = announcements.map((a) =>
          a.id === announcementId ? { ...a, ...updates } : a,
        );
        setAnnouncements(updated);
        localStorage.setItem("cached_announcements", JSON.stringify(updated));
      }
    } catch (error) {
      const pending: PendingAnnouncement[] = JSON.parse(
        localStorage.getItem("pending_announcements") || "[]",
      );
      pending.push({
        id: `temp_${Date.now()}`,
        announcement: updates as Omit<Announcement, "id">,
        type: "update",
        announcementId,
      });
      localStorage.setItem("pending_announcements", JSON.stringify(pending));
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
      if (navigator.onLine) {
        await deleteDoc(doc(db, "announcements", announcementId));
      } else {
        const pending: PendingAnnouncement[] = JSON.parse(
          localStorage.getItem("pending_announcements") || "[]",
        );
        pending.push({
          id: `temp_${Date.now()}`,
          announcement: {} as Omit<Announcement, "id">,
          type: "delete",
          announcementId,
        });
        localStorage.setItem("pending_announcements", JSON.stringify(pending));

        const updated = announcements.filter((a) => a.id !== announcementId);
        setAnnouncements(updated);
        localStorage.setItem("cached_announcements", JSON.stringify(updated));
      }
    } catch (error) {
      const pending: PendingAnnouncement[] = JSON.parse(
        localStorage.getItem("pending_announcements") || "[]",
      );
      pending.push({
        id: `temp_${Date.now()}`,
        announcement: {} as Omit<Announcement, "id">,
        type: "delete",
        announcementId,
      });
      localStorage.setItem("pending_announcements", JSON.stringify(pending));
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
