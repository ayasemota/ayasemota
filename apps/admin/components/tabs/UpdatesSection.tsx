"use client";

import EventsSection from "./EventsSection";
import AnnouncementsSection from "./AnnouncementsSection";
import { Event, Announcement } from "@ayz/types";

interface UpdatesSectionProps {
  events: Event[];
  announcements: Announcement[];
  loadingEvents: boolean;
  loadingAnnouncements: boolean;
  onAddEvent: (event: Omit<Event, "id">, customId?: string) => Promise<string>;
  onUpdateEvent: (eventId: string, updates: Partial<Event>) => Promise<void>;
  onDeleteEvent: (eventId: string) => Promise<void>;
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

export default function UpdatesSection({
  events,
  announcements,
  loadingEvents,
  loadingAnnouncements,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
}: UpdatesSectionProps) {
  return (
    <div className="space-y-10">
      <EventsSection
        events={events}
        loading={loadingEvents}
        onAddEvent={onAddEvent}
        onUpdateEvent={onUpdateEvent}
        onDeleteEvent={onDeleteEvent}
      />

      <AnnouncementsSection
        announcements={announcements}
        loading={loadingAnnouncements}
        onAddAnnouncement={onAddAnnouncement}
        onUpdateAnnouncement={onUpdateAnnouncement}
        onDeleteAnnouncement={onDeleteAnnouncement}
      />
    </div>
  );
}
