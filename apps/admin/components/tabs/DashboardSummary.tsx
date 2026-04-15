"use client";

import { useState, useEffect } from "react";
import { Users, Calendar, Megaphone, TrendingUp, Settings, Save } from "lucide-react";
import { User, Payment, Event, Announcement } from "@ayasemota/types";
import { SystemSettings } from "@/hooks/useSettings";

interface DashboardSummaryProps {
  users: User[];
  payments: Payment[];
  events: Event[];
  announcements: Announcement[];
  loading: boolean;
  settings?: SystemSettings;
  updateSettings?: (settings: Partial<SystemSettings>) => Promise<void>;
}

export default function DashboardSummary({
  users,
  payments,
  events,
  announcements,
  loading,
  settings,
  updateSettings,
}: DashboardSummaryProps) {
  const [localSettings, setLocalSettings] = useState<SystemSettings>({
    vatRate: 0,
    transactionFee: 0,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    if (!updateSettings) return;
    setIsSavingSettings(true);
    try {
      await updateSettings(localSettings);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const getUserName = (email: string | undefined) => {
    if (!email) return "N/A";
    const user = users.find((u) => u.email === email);
    if (user) {
      return `${user.firstName} ${user.lastName}`;
    }
    return email;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalUsers = users.length;
  const unconfirmedUsers = users.filter(
    (u) => !u.status || u.status.trim() === "",
  ).length;

  const completedPayments = payments.filter((p) => {
    const status = (p.status || "").toLowerCase().trim();
    return status === "completed";
  }).length;
  const totalRevenue = payments.reduce((sum, p) => {
    const status = (p.status || "").toLowerCase().trim();
    if (status === "completed") {
      return sum + (p.amount || 0);
    }
    return sum;
  }, 0);
  const visibleEvents = events.filter((e) => e.isVisible).length;
  const visibleAnnouncements = announcements.filter((a) => a.isVisible).length;
  const recentPayments = payments.slice(0, 3);
  const recentEvents = events.filter((e) => e.isVisible).slice(0, 3);

  const getPaymentDateTime = (payment: Payment) => {
    if (payment.paymentDate && payment.paymentTime) {
      const datePart = new Date(payment.paymentDate).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        },
      );
      return `${datePart} at ${payment.paymentTime}`;
    }

    if (
      payment.createdAt &&
      typeof payment.createdAt === "object" &&
      "seconds" in payment.createdAt
    ) {
      const date = new Date(payment.createdAt.seconds * 1000);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const timeStr = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return `${dateStr} at ${timeStr}`;
    }
    return payment.date || "N/A";
  };

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "bg-primary/10 text-primary",
      change: `${unconfirmedUsers} Unconfirmed`,
    },
    {
      title: "Total Revenue",
      value: `₦${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-success/10 text-success",
      change: `${completedPayments} Completed`,
    },
    {
      title: "Active Events",
      value: visibleEvents,
      icon: Calendar,
      color: "bg-accent/10 text-accent-foreground",
      change: `${events.length} Total`,
    },
    {
      title: "Announcements",
      value: visibleAnnouncements,
      icon: Megaphone,
      color: "bg-warning/10 text-warning",
      change: `${announcements.length} Total`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-card text-card-foreground rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              {stat.title}
            </h3>
            <p className="text-2xl font-bold text-foreground mb-1">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card text-card-foreground rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Recent Payments
          </h3>
          <div className="space-y-3">
            {recentPayments.length > 0 ? (
              recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="grid grid-cols-2 items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {getUserName(payment.userEmail)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getPaymentDateTime(payment)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">
                      ₦{payment.amount.toLocaleString()}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        payment.status?.toLowerCase() === "completed"
                          ? "bg-success/10 text-success"
                          : payment.status?.toLowerCase() === "success"
                            ? "bg-primary/10 text-primary"
                            : payment.status?.toLowerCase() === "pending"
                              ? "bg-warning/10 text-warning"
                              : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No payments yet
              </p>
            )}
          </div>
        </div>

        <div className="bg-card text-card-foreground rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Upcoming Events
          </h3>
          <div className="space-y-3">
            {recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                >
                  <div
                    className={`p-2 rounded-lg ${
                      event.isVisible ? "bg-success/10" : "bg-muted"
                    }`}
                  >
                    <Calendar
                      size={18}
                      className={
                        event.isVisible
                          ? "text-success"
                          : "text-muted-foreground"
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {event.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.eventDate} at {event.eventTime}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No upcoming events
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card text-card-foreground rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Recent Announcements
          </h3>
          <div className="space-y-3">
            {announcements.filter((a) => a.isVisible).slice(0, 3).length > 0 ? (
              announcements
                .filter((a) => a.isVisible)
                .slice(0, 3)
                .map((announcement) => (
                  <div key={announcement.id} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-foreground">
                        {announcement.title}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {announcement.description}
                    </p>
                  </div>
                ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No announcements
              </p>
            )}
          </div>
        </div>

        <div className="bg-card text-card-foreground rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Settings size={20} className="text-primary" />
              Skilr App Settings
            </h3>
            {updateSettings && (
              <button
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {isSavingSettings ? "Saving..." : "Save"}
              </button>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase block mb-2">
                Skilr VAT Rate (%)
              </label>
              <input
                type="number"
                value={localSettings.vatRate}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    vatRate: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="e.g. 4"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase block mb-2">
                Fixed Transaction Fee (₦)
              </label>
              <input
                type="number"
                value={localSettings.transactionFee}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    transactionFee: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="e.g. 300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
