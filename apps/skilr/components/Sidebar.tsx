import { Home, CreditCard, HelpCircle, Settings, LogOut } from "lucide-react";

interface SidebarProps {
  currentPage: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  onSignOut?: () => void;
}

export const Sidebar = ({
  currentPage,
  isOpen,
  onClose,
  onNavigate,
  onSignOut,
}: SidebarProps) => {
  const handleNavigate = (page: string) => {
    onNavigate(page);
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-22 left-0 h-[calc(100dvh-5rem)] w-76 bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 flex flex-col`}
      >
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          <button
            onClick={() => handleNavigate("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
              currentPage === "dashboard"
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
            }`}
          >
            <Home size={20} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => handleNavigate("payments")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
              currentPage === "payments"
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
            }`}
          >
            <CreditCard size={20} />
            <span>Payments</span>
          </button>
          <button
            onClick={() => handleNavigate("help")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
              currentPage === "help"
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
            }`}
          >
            <HelpCircle size={20} />
            <span>Help & Support</span>
          </button>
        </nav>

        {onSignOut && (
          <div className="p-4 space-y-2 border-t border-gray-800">
            <button
              onClick={() => handleNavigate("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                currentPage === "settings"
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
              }`}
            >
              <Settings size={20} />
              <span>Settings</span>
            </button>
            <button
              onClick={() => {
                onSignOut();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-300"
            >
              <LogOut size={20} />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
