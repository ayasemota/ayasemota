"use client";

import { useState } from "react";
import { Plus, Calendar, Clock, Eye, EyeOff, Trash2 } from "lucide-react";
import Modal from "../Modal";
import { Event } from "@ayasemota/types";
import { useToast } from "../ToastContext";

interface EventsSectionProps {
  events: Event[];
  loading: boolean;
  isSaving?: boolean;
  onAddEvent: (event: Omit<Event, "id">, customId?: string) => Promise<string>;
  onUpdateEvent: (eventId: string, updates: Partial<Event>) => Promise<void>;
  onDeleteEvent: (eventId: string) => Promise<void>;
}

export default function EventsSection({
  events,
  loading,
  isSaving = false,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
}: EventsSectionProps) {
  const { addAction } = useToast();
  const [showNewForm, setShowNewForm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(
    null,
  );
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    isVisible: false,
  });

  const handleAddEvent = async () => {
    if (!newEvent.title) return;

    try {
      const newId = await onAddEvent(newEvent);
      addAction(
        "Create Event",
        () => onDeleteEvent(newId),
        async () => {
          await onAddEvent(newEvent, newId);
        },
      );

      setNewEvent({
        title: "",
        description: "",
        eventDate: "",
        eventTime: "",
        isVisible: false,
      });
      setShowNewForm(false);
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  const handleFieldUpdate = async (
    eventId: string,
    field: keyof Event,
    value: string | boolean,
  ) => {
    const oldEvent = events.find((e) => e.id === eventId);
    if (!oldEvent) return;

    try {
      await onUpdateEvent(eventId, { [field]: value });
      addAction(
        "Update Event",
        () => onUpdateEvent(eventId, { [field]: oldEvent[field] }),
        () => onUpdateEvent(eventId, { [field]: value }),
      );
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleDeleteClick = (eventId: string) => {
    setDeleteConfirmation(eventId);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation) {
      const deletedEvent = events.find((e) => e.id === deleteConfirmation);

      try {
        await onDeleteEvent(deleteConfirmation);
        if (deletedEvent) {
          const { id: _id, ...data } = deletedEvent;
          addAction(
            "Delete Event",
            async () => {
              await onAddEvent(data, deletedEvent.id);
            },
            () => onDeleteEvent(deletedEvent.id!),
          );
        }
      } catch (error) {
        console.error("Error deleting event:", error);
      }
      setDeleteConfirmation(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Events</h2>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      <Modal
        isOpen={showNewForm}
        onClose={() => setShowNewForm(false)}
        title="New Event"
        size="md"
      >
        <div className="p-4 md:p-6 space-y-4">
          <input
            type="text"
            placeholder="Event Title"
            value={newEvent.title}
            onChange={(e) =>
              setNewEvent({ ...newEvent, title: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <textarea
            placeholder="Event Description"
            value={newEvent.description}
            onChange={(e) =>
              setNewEvent({ ...newEvent, description: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="date"
              value={newEvent.eventDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setNewEvent({ ...newEvent, eventDate: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="time"
              value={newEvent.eventTime}
              onChange={(e) =>
                setNewEvent({ ...newEvent, eventTime: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="newEventVisible"
              checked={newEvent.isVisible}
              onChange={(e) =>
                setNewEvent({ ...newEvent, isVisible: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="newEventVisible" className="text-sm text-gray-700">
              Visible on website
            </label>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <button
              onClick={handleAddEvent}
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Create Event"}
            </button>
            <button
              onClick={() => setShowNewForm(false)}
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={deleteConfirmation !== null}
        onClose={() => setDeleteConfirmation(null)}
        title="Delete Event"
        size="sm"
      >
        <div className="p-6 space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this event? This action cannot be
            undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleConfirmDelete}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Delete
            </button>
            <button
              onClick={() => setDeleteConfirmation(null)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <div className="grid gap-4">
        {events.length > 0 ? (
          events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow p-4 md:p-6"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3">
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    value={event.title}
                    onChange={(e) =>
                      handleFieldUpdate(event.id!, "title", e.target.value)
                    }
                    className="text-lg md:text-xl font-semibold text-gray-900 w-full border-0 border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleFieldUpdate(
                        event.id!,
                        "isVisible",
                        !event.isVisible,
                      )
                    }
                    className={`p-2 rounded-lg transition-colors ${
                      event.isVisible
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                    title={event.isVisible ? "Visible" : "Hidden"}
                  >
                    {event.isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(event.id!)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <textarea
                value={event.description}
                onChange={(e) =>
                  handleFieldUpdate(event.id!, "description", e.target.value)
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={18} />
                  <input
                    type="date"
                    value={event.eventDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) =>
                      handleFieldUpdate(event.id!, "eventDate", e.target.value)
                    }
                    className="flex-1 px-2 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={18} />
                  <input
                    type="time"
                    value={event.eventTime}
                    onChange={(e) =>
                      handleFieldUpdate(event.id!, "eventTime", e.target.value)
                    }
                    className="flex-1 px-2 py-1 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>No events yet. Create your first event!</p>
          </div>
        )}
      </div>
    </div>
  );
}
