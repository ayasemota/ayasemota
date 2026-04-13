"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import Modal from "@/components/Modal";
import Preloader from "@/components/Preloader";
import DashboardSummary from "@/components/tabs/DashboardSummary";
import UsersSection from "@/components/tabs/UsersSection";
import PaymentsSection from "@/components/tabs/PaymentsSection";
import EventsSection from "@/components/tabs/EventsSection";
import AnnouncementsSection from "@/components/tabs/AnnouncementsSection";
import UserDetailModal from "@/components/UserDetailModal";
import PaymentDetailModal from "@/components/PaymentDetailModal";
import { useUsers } from "@/hooks/useUsers";
import { useAllPayments } from "@/hooks/useAllPayments";
import { useEvents } from "@/hooks/useEvents";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";
import { User } from "@ayasemota/types";
import { Payment } from "@ayasemota/types";
import { ToastProvider } from "@/components/ToastContext";

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  users: "Users Management",
  payments: "Payments",
  events: "Events Management",
  announcements: "Announcements",
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";

  useInactivityLogout(30);

  const { users, loading: usersLoading, updateUser } = useUsers();
  const {
    payments,
    loading: paymentsLoading,
    addPayment,
    updatePayment,
    deletePayment,
  } = useAllPayments();
  const {
    events,
    loading: eventsLoading,
    addEvent,
    updateEvent,
    deleteEvent,
  } = useEvents();
  const {
    announcements,
    loading: announcementsLoading,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  } = useAnnouncements();

  const [activeSection, setActiveSection] = useState(tab);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const selectedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuth");
    if (!isAuth) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    setActiveSection(tab);
  }, [tab]);

  useEffect(() => {
    const title = pageTitles[activeSection] || "Dashboard";
    document.title = `AY Asemota | ${title}`;
  }, [activeSection]);

  useEffect(() => {
    if (selectedUserIdRef.current && users.length > 0) {
      const updatedUser = users.find((u) => u.id === selectedUserIdRef.current);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    }
  }, [users]);

  useEffect(() => {
    if (
      !usersLoading &&
      !paymentsLoading &&
      !eventsLoading &&
      !announcementsLoading
    ) {
      setInitialLoading(false);
    }
  }, [usersLoading, paymentsLoading, eventsLoading, announcementsLoading]);

  const handleSectionChange = (section: string) => {
    router.push(`/dashboard?tab=${section}`);
    setSelectedUser(null);
    selectedUserIdRef.current = null;
    setSearchTerm("");
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("loginTime");
    router.push("/login");
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    handleLogout();
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    selectedUserIdRef.current = user.id || null;
  };

  const handleCloseUserModal = () => {
    setSelectedUser(null);
    selectedUserIdRef.current = null;
  };

  const handleUserUpdate = async (userId: string, updates: Partial<User>) => {
    try {
      await updateUser(userId, updates);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handlePaymentUpdate = async (
    paymentId: string,
    updates: Partial<Payment>,
  ) => {
    try {
      await updatePayment(paymentId, updates);
    } catch (error) {
      console.error("Error updating payment:", error);
    }
  };

  const handlePaymentDelete = async (paymentId: string) => {
    try {
      await deletePayment(paymentId);
      setSelectedPayment(null);
    } catch (error) {
      console.error("Error deleting payment:", error);
    }
  };

  const handleAddPayment = async (payment: {
    userEmail: string;
    userName: string;
    userId: string;
    amount: number;
    status: string;
    reference: string;
    date: string;
    paymentDate?: string;
    paymentTime?: string;
  }) => {
    try {
      await addPayment(payment);
    } catch (error) {
      console.error("Error adding payment:", error);
      throw error;
    }
  };

  if (initialLoading) {
    return <Preloader />;
  }

  return (
    <div className="flex h-dvh bg-gray-50 overflow-hidden">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={handleSectionChange}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          activeSection={activeSection}
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen(true)}
          title={pageTitles[activeSection] || "Admin"}
          onShowLogoutConfirm={() => setShowLogoutConfirm(true)}
        />

        <main className="flex-1 overflow-auto p-4 md:p-6">
          {activeSection === "dashboard" && (
            <DashboardSummary
              users={users}
              payments={payments}
              events={events}
              announcements={announcements}
              loading={initialLoading}
            />
          )}

          {activeSection === "users" && (
            <UsersSection
              users={users}
              loading={initialLoading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              setSelectedUser={handleSelectUser}
            />
          )}

          {activeSection === "payments" && (
            <PaymentsSection
              payments={payments}
              users={users}
              loading={initialLoading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onPaymentSelect={setSelectedPayment}
            />
          )}

          {activeSection === "events" && (
            <EventsSection
              events={events}
              loading={initialLoading}
              onAddEvent={addEvent}
              onUpdateEvent={updateEvent}
              onDeleteEvent={deleteEvent}
            />
          )}

          {activeSection === "announcements" && (
            <AnnouncementsSection
              announcements={announcements}
              loading={initialLoading}
              onAddAnnouncement={addAnnouncement}
              onUpdateAnnouncement={updateAnnouncement}
              onDeleteAnnouncement={deleteAnnouncement}
            />
          )}
        </main>

        <Footer />
      </div>

      {selectedUser && (
        <UserDetailModal
          isOpen={!!selectedUser}
          user={selectedUser}
          payments={payments}
          onClose={handleCloseUserModal}
          onUserUpdate={handleUserUpdate}
          onPaymentSelect={setSelectedPayment}
          onAddPayment={handleAddPayment}
          onDeletePayment={handlePaymentDelete}
        />
      )}

      <PaymentDetailModal
        isOpen={!!selectedPayment}
        payment={selectedPayment}
        users={users}
        onClose={() => setSelectedPayment(null)}
        onPaymentUpdate={handlePaymentUpdate}
        onPaymentDelete={handlePaymentDelete}
        onAddPayment={handleAddPayment}
      />

      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Logout"
        size="sm"
      >
        <div className="p-6 space-y-4">
          <p className="text-gray-700">Are you sure you want to logout?</p>
          <div className="flex gap-3">
            <button
              onClick={handleConfirmLogout}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Logout
            </button>
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
export default function DashboardPage() {
  return (
    <Suspense fallback={<Preloader />}>
      <ToastProvider>
        <DashboardContent />
      </ToastProvider>
    </Suspense>
  );
}
