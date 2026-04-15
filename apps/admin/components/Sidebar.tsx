"use client";

import { useEffect } from "react";
import {
  Users,
  CreditCard,
  Menu,
  Calendar,
  Megaphone,
  LayoutDashboard,
  Briefcase,
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({
  activeSection,
  setActiveSection,
  sidebarOpen,
  setSidebarOpen,
}: SidebarProps) {
  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024;
    const saved = localStorage.getItem("sidebarOpen");

    if (isDesktop) {
      setSidebarOpen(saved !== "false");
    } else {
      setSidebarOpen(false);
    }
  }, [setSidebarOpen]);

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem("sidebarOpen", String(newState));
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "events", label: "Events", icon: Calendar },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "projects", label: "Portfolio", icon: Briefcase },
  ];

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-opacity-40 backdrop-blur-sm bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${sidebarOpen ? "w-64" : "lg:w-20"}
        bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col
      `}
      >
        <div className="p-4 lg:p-6 border-b border-sidebar-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            {sidebarOpen && (
              <>
                <h1 className="text-xl font-bold text-sidebar-foreground">
                  Admin
                </h1>
              </>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
          >
            <Menu
              size={20}
              className="text-sidebar-foreground hidden lg:block"
            />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                activeSection === item.id
                  ? "bg-blue-50 text-sidebar-ring"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
