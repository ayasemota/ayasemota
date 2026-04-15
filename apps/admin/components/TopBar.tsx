"use client";

import React from "react";
import { LogOut, Wifi, WifiOff, Menu } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface TopBarProps {
  activeSection: string;
  onToggleSidebar: () => void;
  title: string;
  onShowLogoutConfirm: () => void;
  onLogout?: () => void;
}

export default function TopBar({
  onToggleSidebar,
  title,
  onShowLogoutConfirm,
}: TopBarProps) {
  const isOnline = useOnlineStatus();

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            {title}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isOnline ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={onShowLogoutConfirm}
        className="flex items-center gap-2 px-3 md:px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all font-medium"
      >
        <LogOut size={18} />
        <span className="text-sm hidden sm:inline">Logout</span>
      </button>
    </header>
  );
}
