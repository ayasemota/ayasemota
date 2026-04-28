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
import { db } from "@ayz/firebase";
import { Event } from "@ayz/types";

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
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

  const addEvent = async (event: Omit<Event, "id">, customId?: string) => {
    setIsSaving(true);
    try {
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
    } catch (error) {
      throw error instanceof Error ? error : new Error("Failed to add event");
    } finally {
      setIsSaving(false);
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    setIsSaving(true);
    try {
      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
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
      await deleteDoc(doc(db, "events", eventId));
    } catch (error) {
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
