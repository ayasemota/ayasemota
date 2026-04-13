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
import { Event } from "@ayasemota/types";

interface PendingEvent {
  id: string;
  event: Omit<Event, "id">;
  type: "add" | "update" | "delete";
  eventId?: string;
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const syncPendingEvents = useCallback(async () => {
    const pendingStr = localStorage.getItem("pending_events");
    if (!pendingStr) return;

    try {
      const pending: PendingEvent[] = JSON.parse(pendingStr);

      for (const item of pending) {
        try {
          if (item.type === "add") {
            await addDoc(collection(db, "events"), {
              ...item.event,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            });
          } else if (item.type === "update" && item.eventId) {
            const eventRef = doc(db, "events", item.eventId);
            await updateDoc(eventRef, {
              ...item.event,
              updatedAt: Timestamp.now(),
            });
          } else if (item.type === "delete" && item.eventId) {
            await deleteDoc(doc(db, "events", item.eventId));
          }
        } catch (error) {
          console.error(`Failed to sync event ${item.id}:`, error);
        }
      }

      localStorage.removeItem("pending_events");
    } catch (error) {
      console.error("Error syncing pending events:", error);
    }
  }, []);

  useEffect(() => {
    const cachedData = localStorage.getItem("cached_events");
    if (cachedData) {
      try {
        setEvents(JSON.parse(cachedData));
      } catch (e) {
        console.error("Error parsing cached events:", e);
      }
    }

    const eventsRef = collection(db, "events");
    const q = query(eventsRef, orderBy("eventDate", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const eventsData: Event[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || "",
            description: data.description || "",
            eventDate: data.eventDate || "",
            eventTime: data.eventTime || "",
            isVisible: data.isVisible ?? true,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });

        setEvents(eventsData);

        localStorage.setItem("cached_events", JSON.stringify(eventsData));

        if (navigator.onLine) {
          syncPendingEvents();
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
      console.log("Connection restored - syncing pending events");
      syncPendingEvents();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      unsubscribe();
      window.removeEventListener("online", handleOnline);
    };
  }, [syncPendingEvents]);

  const addEvent = async (event: Omit<Event, "id">, customId?: string) => {
    setIsSaving(true);
    try {
      if (navigator.onLine) {
        let docRef;
        if (customId) {
          docRef = doc(db, "events", customId);
          await setDoc(docRef, {
            ...event,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        } else {
          docRef = await addDoc(collection(db, "events"), {
            ...event,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        }
        return docRef.id;
      } else {
        const tempId = customId || `temp_${Date.now()}`;
        const pending: PendingEvent[] = JSON.parse(
          localStorage.getItem("pending_events") || "[]",
        );
        pending.push({
          id: tempId,
          event,
          type: "add",
        });
        localStorage.setItem("pending_events", JSON.stringify(pending));

        const newEvent: Event = {
          id: tempId,
          ...event,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };
        setEvents([newEvent, ...events]);
        localStorage.setItem(
          "cached_events",
          JSON.stringify([newEvent, ...events]),
        );
        return tempId;
      }
    } catch (error) {
      const tempId = customId || `temp_${Date.now()}`;
      const pending: PendingEvent[] = JSON.parse(
        localStorage.getItem("pending_events") || "[]",
      );
      pending.push({
        id: tempId,
        event,
        type: "add",
      });
      localStorage.setItem("pending_events", JSON.stringify(pending));
      throw error instanceof Error ? error : new Error("Failed to add event");
    } finally {
      setIsSaving(false);
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    setIsSaving(true);
    try {
      if (navigator.onLine) {
        const eventRef = doc(db, "events", eventId);
        await updateDoc(eventRef, {
          ...updates,
          updatedAt: Timestamp.now(),
        });
      } else {
        const pending: PendingEvent[] = JSON.parse(
          localStorage.getItem("pending_events") || "[]",
        );
        pending.push({
          id: `temp_${Date.now()}`,
          event: updates as Omit<Event, "id">,
          type: "update",
          eventId,
        });
        localStorage.setItem("pending_events", JSON.stringify(pending));

        const updated = events.map((e) =>
          e.id === eventId ? { ...e, ...updates } : e,
        );
        setEvents(updated);
        localStorage.setItem("cached_events", JSON.stringify(updated));
      }
    } catch (error) {
      const pending: PendingEvent[] = JSON.parse(
        localStorage.getItem("pending_events") || "[]",
      );
      pending.push({
        id: `temp_${Date.now()}`,
        event: updates as Omit<Event, "id">,
        type: "update",
        eventId,
      });
      localStorage.setItem("pending_events", JSON.stringify(pending));
      throw error instanceof Error
        ? error
        : new Error("Failed to update event");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    setIsSaving(true);
    try {
      if (navigator.onLine) {
        await deleteDoc(doc(db, "events", eventId));
      } else {
        const pending: PendingEvent[] = JSON.parse(
          localStorage.getItem("pending_events") || "[]",
        );
        pending.push({
          id: `temp_${Date.now()}`,
          event: {} as Omit<Event, "id">,
          type: "delete",
          eventId,
        });
        localStorage.setItem("pending_events", JSON.stringify(pending));

        const updated = events.filter((e) => e.id !== eventId);
        setEvents(updated);
        localStorage.setItem("cached_events", JSON.stringify(updated));
      }
    } catch (error) {
      const pending: PendingEvent[] = JSON.parse(
        localStorage.getItem("pending_events") || "[]",
      );
      pending.push({
        id: `temp_${Date.now()}`,
        event: {} as Omit<Event, "id">,
        type: "delete",
        eventId,
      });
      localStorage.setItem("pending_events", JSON.stringify(pending));
      throw error instanceof Error
        ? error
        : new Error("Failed to delete event");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    events,
    loading,
    error,
    isSaving,
    addEvent,
    updateEvent,
    deleteEvent,
  };
};
