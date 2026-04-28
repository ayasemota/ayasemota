import { useState } from "react";
import { User, Payment } from "@ayz/types";
import { X, Calendar, Megaphone, Lock } from "lucide-react";

interface DashboardPageProps {
  user: User;
  payments: Payment[];
  paymentsLoading: boolean;
  onNavigateToPayments: () => void;
  onNavigateToCohort: () => void;
  onShowUnavailable: () => void;
  announcements?: { id?: string; title: string; description: string }[];
  upcomingEvents?: {
    id?: string;
    title: string;
    description: string;
    date?: string;
  }[];
  isRestricted?: boolean;
}

const RestrictedOverlay = ({
  message = "Restricted Access",
}: {
  message?: string;
}) => (
  <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-4 text-center rounded-2xl border border-gray-700/50">
    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-3 shadow-xl border border-gray-700">
      <Lock className="text-gray-500" size={24} />
    </div>
    <p className="text-gray-300 font-medium text-sm leading-relaxed max-w-50">
      {message}
    </p>
  </div>
);

const formatCurrency = (amount: number) => {
  return amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getPaymentDateTime = (payment: Payment) => {
  if (payment.paymentDate && payment.paymentTime) {
    const datePart = new Date(payment.paymentDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yy} | ${hh}:${min}`;
  }
  return payment.paymentDate || payment.date || "N/A";
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85dvh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(85dvh-80px)] p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export const DashboardPage = ({
  user,
  payments,
  paymentsLoading,
  onNavigateToPayments,
  onNavigateToCohort,
  onShowUnavailable,
  announcements = [],
  upcomingEvents = [],
  isRestricted = false,
}: DashboardPageProps) => {
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<
    (typeof upcomingEvents)[0] | null
  >(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<
    (typeof announcements)[0] | null
  >(null);

  const recentPayments = payments.slice(0, 2);
  const displayEvents = upcomingEvents.slice(0, 3);
  const displayAnnouncements = announcements.slice(0, 3);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  const quickLinks = [
    {
      label: "Make Payment",
      onClick: onNavigateToPayments,
      disabled: isRestricted,
    },
    { label: "Join Cohort", onClick: onNavigateToCohort },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="bg-linear-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {getGreeting()}, {user.firstName}!
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 flex flex-col relative overflow-hidden">
            {isRestricted && <RestrictedOverlay />}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="text-blue-400" size={20} />
                <h2 className="text-xl font-semibold text-white">
                  Upcoming Events
                </h2>
              </div>
              {upcomingEvents.length > 3 && !isRestricted && (
                <button
                  onClick={() => setShowAllEvents(true)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View All
                </button>
              )}
            </div>
            {displayEvents.length ? (
              <div className="space-y-3 flex-1">
                {displayEvents.map((event, index) => (
                  <div
                    key={event.id || index}
                    className={`p-4 bg-gray-900/50 rounded-lg border border-gray-700/30 transition-colors duration-300 ${!isRestricted ? "hover:border-blue-500/30 cursor-pointer" : "opacity-40"}`}
                    onClick={() => !isRestricted && setSelectedEvent(event)}
                  >
                    <h3 className="font-medium text-white mb-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-1">
                      {event.description}
                    </p>
                    <span className="text-xs text-gray-500 mt-2 block">
                      {event.date}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/30 text-center text-gray-400 flex-1 flex items-center justify-center">
                No upcoming events
              </div>
            )}
          </div>

          <div className="flex-1 w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 flex flex-col relative overflow-hidden">
            {isRestricted && <RestrictedOverlay />}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="text-purple-400" size={20} />
                <h2 className="text-xl font-semibold text-white">
                  Announcements
                </h2>
              </div>
              {announcements.length > 3 && !isRestricted && (
                <button
                  onClick={() => setShowAllAnnouncements(true)}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  View All
                </button>
              )}
            </div>
            {displayAnnouncements.length ? (
              <div className="space-y-3 flex-1">
                {displayAnnouncements.map((item, index) => (
                  <div
                    key={item.id || index}
                    className={`p-3 bg-gray-900/50 rounded-lg border border-gray-700/30 transition-colors duration-300 ${!isRestricted ? "hover:border-purple-500/30 cursor-pointer" : "opacity-40"}`}
                    onClick={() =>
                      !isRestricted && setSelectedAnnouncement(item)
                    }
                  >
                    <h3 className="text-sm font-medium text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/30 text-center text-gray-400 flex-1 flex items-center justify-center">
                No announcements
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 relative overflow-hidden">
          {isRestricted && <RestrictedOverlay />}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">
              Recent Payments
            </h2>
            {!isRestricted && (
              <button
                onClick={onNavigateToPayments}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                View All
              </button>
            )}
          </div>
          {paymentsLoading ? (
            <div className="flex justify-center py-6">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recentPayments.length ? (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700/30">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Reference
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.map((payment) => (
                      <tr
                        key={payment.id}
                        className={`border-b border-gray-700/10 transition-colors duration-300 ${!isRestricted ? "hover:bg-gray-700/10" : ""}`}
                      >
                        <td className="py-4 px-4 text-gray-300">
                          {getPaymentDateTime(payment)}
                        </td>
                        <td className="py-4 px-4 text-white font-medium">
                          ₦{formatCurrency(payment.amount)}
                        </td>
                        <td className="py-4 px-4 text-gray-400 text-xs">
                          {payment.reference || "N/A"}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 text-xs rounded-full border ${
                              payment.status === "Completed"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : payment.status === "Pending"
                                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                  : payment.status === "Failed"
                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                    : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/30 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-lg font-bold text-white">
                        ₦{formatCurrency(payment.amount)}
                      </p>
                      <span
                        className={`px-2 py-1 text-xs rounded-full border ${
                          payment.status === "Completed"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : payment.status === "Pending"
                              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                              : payment.status === "Failed"
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {getPaymentDateTime(payment)}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {payment.reference || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/30 text-center text-gray-400">
              No payments yet
            </div>
          )}
        </div>

        <div className="mt-12">
          <h2 className="font-bold text-white text-2xl md:text-3xl mb-6">
            Quick Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickLinks.map((link, index) => (
              <button
                key={index}
                onClick={link.onClick}
                disabled={link.disabled}
                className={`py-6 rounded-xl font-semibold transition-all duration-300 border ${
                  link.disabled
                    ? "bg-gray-800/20 text-gray-600 border-transparent cursor-not-allowed"
                    : "text-white bg-gray-800/60 hover:bg-gray-700/60 border-gray-700/50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>{link.label}</span>
                  {link.disabled && (
                    <Lock size={14} className="text-gray-700" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showAllEvents || !!selectedEvent}
        onClose={() => {
          setShowAllEvents(false);
          setSelectedEvent(null);
        }}
        title={selectedEvent ? selectedEvent.title : "Upcoming Events"}
      >
        <div className="space-y-4">
          {selectedEvent ? (
            <div className="p-5 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Calendar className="text-blue-400" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {selectedEvent.title}
                  </h3>
                  <p className="text-sm text-gray-400">{selectedEvent.date}</p>
                </div>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">
                {selectedEvent.description}
              </p>
            </div>
          ) : upcomingEvents.length > 0 ? (
            upcomingEvents.map((event, index) => (
              <div
                key={event.id || index}
                className="p-5 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:bg-gray-800 transition-colors cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Calendar className="text-blue-400" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-400">{event.date}</p>
                  </div>
                </div>
                <p className="text-gray-300 line-clamp-2">
                  {event.description}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>No upcoming events</p>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={showAllAnnouncements || !!selectedAnnouncement}
        onClose={() => {
          setShowAllAnnouncements(false);
          setSelectedAnnouncement(null);
        }}
        title={
          selectedAnnouncement ? selectedAnnouncement.title : "Announcements"
        }
      >
        <div className="space-y-4">
          {selectedAnnouncement ? (
            <div className="p-5 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Megaphone className="text-purple-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white flex-1">
                  {selectedAnnouncement.title}
                </h3>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">
                {selectedAnnouncement.description}
              </p>
            </div>
          ) : announcements.length > 0 ? (
            announcements.map((announcement, index) => (
              <div
                key={announcement.id || index}
                className="p-5 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:bg-gray-800 transition-colors cursor-pointer"
                onClick={() => setSelectedAnnouncement(announcement)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Megaphone className="text-purple-400" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-white flex-1">
                    {announcement.title}
                  </h3>
                </div>
                <p className="text-gray-300 line-clamp-2">
                  {announcement.description}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Megaphone size={48} className="mx-auto mb-4 opacity-50" />
              <p>No announcements</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
