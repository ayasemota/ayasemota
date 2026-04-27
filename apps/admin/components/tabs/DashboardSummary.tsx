"use client";

import { Users, Calendar, Megaphone, TrendingUp } from "lucide-react";
import { User, Payment, Event, Announcement } from "@ayasemota/types";

interface DashboardSummaryProps {
  users: User[];
  payments: Payment[];
  events: Event[];
  announcements: Announcement[];
  loading: boolean;
}

export default function DashboardSummary({
  users,
  payments,
  events,
  announcements,
  loading,
}: DashboardSummaryProps) {
  const isCurrentMonthPayment = (payment: Payment) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    if (payment.paymentDate) {
      const paymentDate = new Date(payment.paymentDate);
      if (!Number.isNaN(paymentDate.getTime())) {
        return (
          paymentDate.getMonth() === currentMonth &&
          paymentDate.getFullYear() === currentYear
        );
      }
    }

    if (
      payment.createdAt &&
      typeof payment.createdAt === "object" &&
      "seconds" in payment.createdAt
    ) {
      const paymentDate = new Date(payment.createdAt.seconds * 1000);
      return (
        paymentDate.getMonth() === currentMonth &&
        paymentDate.getFullYear() === currentYear
      );
    }

    return false;
  };

  const getUserName = (email: string | undefined) => {
    if (!email) return "N/A";
    const user = users.find((entry) => entry.email === email);
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
  const monthlyRevenue = payments.reduce((sum, payment) => {
    const status = (payment.status || "").toLowerCase().trim();
    if (status === "completed" && isCurrentMonthPayment(payment)) {
      return sum + (payment.amount || 0);
    }
    return sum;
  }, 0);
  const visibleEvents = events.filter((event) => event.isVisible).length;
  const visibleAnnouncements = announcements.filter(
    (announcement) => announcement.isVisible,
  ).length;
  const recentPayments = payments.slice(0, 3);
  const recentEvents = events.filter((event) => event.isVisible).slice(0, 3);

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

    if (payment.paymentDate) {
      return new Date(payment.paymentDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
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
    },
    {
      title: "Monthly Revenue",
      value: `₦${monthlyRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-success/10 text-success",
    },
    {
      title: "Active Events",
      value: visibleEvents,
      icon: Calendar,
      color: "bg-accent/10 text-accent-foreground",
    },
    {
      title: "Announcements",
      value: visibleAnnouncements,
      icon: Megaphone,
      color: "bg-warning/10 text-warning",
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
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <div className="bg-card text-card-foreground rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Recent Announcements
          </h3>
          <div className="space-y-3">
            {announcements.filter((item) => item.isVisible).slice(0, 3).length >
            0 ? (
              announcements
                .filter((item) => item.isVisible)
                .slice(0, 3)
                .map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-4 bg-muted rounded-lg"
                  >
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
      </div>

      <div className="grid grid-cols-1 gap-6">
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
      </div>
    </div>
  );
}
