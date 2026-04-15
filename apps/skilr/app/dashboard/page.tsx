"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePayments } from "@/hooks/usePayments";
import { usePublicAnnouncements } from "@/hooks/usePublicAnnouncements";
import { usePublicEvents } from "@/hooks/usePublicEvents";
import { Sidebar } from "@/components/Sidebar";
import { DashboardPage } from "@/components/pages/DashboardPage";
import { PaymentsPage } from "@/components/pages/PaymentsPage";
import { HelpPage } from "@/components/pages/HelpPage";
import { SettingsPage } from "@/components/pages/SettingsPage";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { UnavailableModal } from "@/components/UnavailableModal";
import { LogoutModal } from "@/components/LogoutModal";
import { Preloader } from "@/components/Preloader";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Wifi, WifiOff } from "lucide-react";

export default function Dashboard() {
  const {
    isLoggedIn,
    user,
    signOut,
    loading,
    updateUnclearedAmount,
    updateProfile,
  } = useAuth();
  const { payments, loading: paymentsLoading } = usePayments(
    user?.email || null,
  );
  const { announcements } = usePublicAnnouncements();
  const { events } = usePublicEvents();
  const router = useRouter();
  const isOnline = useOnlineStatus();

  useEffect(() => {}, [announcements, events]);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const isRestricted = !user?.status || user.status === "" || user.status === "Pending";

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && ["dashboard", "payments", "help", "settings"].includes(hash)) {
      if (isRestricted && hash === "payments") {
        setCurrentPage("dashboard");
        window.location.hash = "dashboard";
      } else {
        setTimeout(() => setCurrentPage(hash), 0);
      }
    }
  }, [isRestricted]);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/auth");
    }
  }, [isLoggedIn, loading, router]);

  useEffect(() => {
    window.location.hash = currentPage;
  }, [currentPage]);

  const handleSignOut = () => {
    signOut();
    router.push("/auth");
  };

  if (loading) {
    return <Preloader />;
  }

  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <>
      <div className="min-h-dvh bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
        <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 left-0 right-0 z-50">
          <div className="flex items-center justify-between px-6 py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden text-gray-400 hover:text-white transition-colors duration-300"
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Logo />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-400">{user.status ?? ""}</p>
              </div>
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold relative">
                {user.firstName[0]}
                {user.lastName[0]}
                <div 
                  className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-gray-900 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
                  title={isOnline ? 'Online' : 'Offline'}
                />
              </div>
            </div>
          </div>
        </header>
        <Sidebar
          currentPage={currentPage}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onNavigate={(page) => {
            if (isRestricted && page === "payments") return;
            setCurrentPage(page);
          }}
          onSignOut={() => setShowLogoutModal(true)}
          isRestricted={isRestricted}
        />
        <div className="lg:pl-76 pt-2">
          <main className="p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
            {currentPage === "dashboard" && (
              <DashboardPage
                user={user}
                payments={payments}
                paymentsLoading={paymentsLoading}
                onNavigateToPayments={() => !isRestricted && setCurrentPage("payments")}
                onNavigateToProfile={() => setCurrentPage("settings")}
                onShowUnavailable={() => setShowUnavailableModal(true)}
                announcements={announcements}
                upcomingEvents={events}
                isRestricted={isRestricted}
              />
            )}
            {currentPage === "payments" && (
              <PaymentsPage
                user={user}
                payments={payments}
                paymentsLoading={paymentsLoading}
                updateUnclearedAmount={updateUnclearedAmount}
              />
            )}
            {currentPage === "help" && <HelpPage />}
            {currentPage === "settings" && (
              <SettingsPage user={user} updateProfile={updateProfile} />
            )}
            <Footer />
          </main>
        </div>
      </div>
      <UnavailableModal
        isOpen={showUnavailableModal}
        onClose={() => setShowUnavailableModal(false)}
      />
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleSignOut}
      />
    </>
  );
}
