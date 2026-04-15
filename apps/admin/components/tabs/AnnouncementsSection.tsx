"use client";

import { useState } from "react";
import { Plus, Eye, EyeOff, Trash2, Clock } from "lucide-react";
import Modal from "../Modal";
import { Announcement } from "@ayasemota/types";
import { useToast } from "../ToastContext";

interface AnnouncementsSectionProps {
  announcements: Announcement[];
  loading: boolean;
  isSaving?: boolean;
  onAddAnnouncement: (
    announcement: Omit<Announcement, "id">,
    customId?: string,
  ) => Promise<string>;
  onUpdateAnnouncement: (
    announcementId: string,
    updates: Partial<Announcement>,
  ) => Promise<void>;
  onDeleteAnnouncement: (announcementId: string) => Promise<void>;
}

export default function AnnouncementsSection({
  announcements,
  loading,
  isSaving = false,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
}: AnnouncementsSectionProps) {
  const { showToast } = useToast();
  const [showNewForm, setShowNewForm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(
    null,
  );
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    description: "",
    isVisible: false,
  });

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.title) return;

    try {
      const newId = await onAddAnnouncement(newAnnouncement);
      showToast("Announcement created successfully");

      setNewAnnouncement({ title: "", description: "", isVisible: false });
      setShowNewForm(false);
    } catch (error) {
      console.error("Error adding announcement:", error);
    }
  };

  const handleFieldUpdate = async (
    announcementId: string,
    field: keyof Announcement,
    value: string | boolean,
  ) => {
    const oldAnnouncement = announcements.find((a) => a.id === announcementId);
    if (!oldAnnouncement) return;

    try {
      await onUpdateAnnouncement(announcementId, { [field]: value });
      showToast("Announcement updated successfully");
    } catch (error) {
      console.error("Error updating announcement:", error);
    }
  };

  const handleDeleteClick = (announcementId: string) => {
    setDeleteConfirmation(announcementId);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation) {
      const deletedAnnouncement = announcements.find(
        (a) => a.id === deleteConfirmation,
      );

      try {
        await onDeleteAnnouncement(deleteConfirmation);
        if (deletedAnnouncement) {
          showToast("Announcement deleted successfully");
        }
      } catch (error) {
        console.error("Error deleting announcement:", error);
      }
      setDeleteConfirmation(null);
    }
  };

  const formatDate = (timestamp: { seconds: number } | undefined) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
          Announcements
        </h2>
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
        title="New Announcement"
        size="md"
      >
        <div className="p-4 md:p-6 space-y-4">
          <input
            type="text"
            placeholder="Announcement Title"
            value={newAnnouncement.title}
            onChange={(e) =>
              setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <textarea
            placeholder="Announcement Description"
            value={newAnnouncement.description}
            onChange={(e) =>
              setNewAnnouncement({
                ...newAnnouncement,
                description: e.target.value,
              })
            }
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="newAnnouncementVisible"
              checked={newAnnouncement.isVisible}
              onChange={(e) =>
                setNewAnnouncement({
                  ...newAnnouncement,
                  isVisible: e.target.checked,
                })
              }
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label
              htmlFor="newAnnouncementVisible"
              className="text-sm text-gray-700"
            >
              Visible on website
            </label>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <button
              onClick={handleAddAnnouncement}
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Create"}
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
        title="Delete Announcement"
        size="sm"
      >
        <div className="p-6 space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this announcement? This action
            cannot be undone.
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
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-white rounded-lg shadow p-4 md:p-6"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3">
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    value={announcement.title}
                    onChange={(e) =>
                      handleFieldUpdate(
                        announcement.id!,
                        "title",
                        e.target.value,
                      )
                    }
                    className="text-lg md:text-xl font-semibold text-gray-900 w-full border-0 border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <div className="flex items-center gap-2 mt-2 text-xs md:text-sm text-gray-500">
                    <Clock size={14} />
                    <span>Posted: {formatDate(announcement.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleFieldUpdate(
                        announcement.id!,
                        "isVisible",
                        !announcement.isVisible,
                      )
                    }
                    className={`p-2 rounded-lg transition-colors ${
                      announcement.isVisible
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                    title={announcement.isVisible ? "Visible" : "Hidden"}
                  >
                    {announcement.isVisible ? (
                      <Eye size={20} />
                    ) : (
                      <EyeOff size={20} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(announcement.id!)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <textarea
                value={announcement.description}
                onChange={(e) =>
                  handleFieldUpdate(
                    announcement.id!,
                    "description",
                    e.target.value,
                  )
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
              />
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <Plus size={48} className="mx-auto mb-4 opacity-50" />
            <p>No announcements yet. Create your first announcement!</p>
          </div>
        )}
      </div>
    </div>
  );
}
