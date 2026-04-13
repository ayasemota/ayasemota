import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { db } from "@ayasemota/firebase";
import { Announcement } from "@ayasemota/types";

export const usePublicAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const announcementsRef = collection(db, "announcements");
    const q = query(announcementsRef, orderBy("createdAt", "desc"), limit(20));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const announcementsData: Announcement[] = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || "",
              description: data.description || "",
              isVisible: data.isVisible ?? true,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            };
          })
          .filter((announcement) => announcement.isVisible)
          .slice(0, 10);

        setAnnouncements(announcementsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching announcements:", error);
        console.error("Error details:", {
          name: error instanceof Error ? error.name : "Unknown",
          message: error instanceof Error ? error.message : String(error),
        });
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { announcements, loading };
};
