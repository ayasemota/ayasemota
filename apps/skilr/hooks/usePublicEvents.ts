import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@ayasemota/firebase";
import { Event } from "@/types";

interface PublicEvent extends Event {
  date?: string;
}

export const usePublicEvents = () => {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, orderBy("eventDate", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const eventsData: PublicEvent[] = snapshot.docs
          .map((doc) => {
            const data = doc.data();

            const formattedDate = data.eventDate
              ? data.eventTime
                ? `${data.eventDate} at ${data.eventTime}`
                : data.eventDate
              : "Date TBA";

            return {
              id: doc.id,
              title: data.title || "",
              description: data.description || "",
              eventDate: data.eventDate || "",
              eventTime: data.eventTime || "",
              isVisible: data.isVisible ?? true,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
              date: formattedDate,
            };
          })
          .filter((event) => event.isVisible);

        setEvents(eventsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching events:", error);
        console.error("Error details:", {
          name: error instanceof Error ? error.name : "Unknown",
          message: error instanceof Error ? error.message : String(error),
        });
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  return { events, loading };
};
