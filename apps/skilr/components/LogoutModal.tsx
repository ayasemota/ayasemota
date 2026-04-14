import { LogOut, X } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutModal = ({
  isOpen,
  onClose,
  onConfirm,
}: LogoutModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      <div
        className="relative bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-300"
        >
          <X size={24} />
        </button>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <LogOut className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Log Out</h3>
          <p className="text-gray-400 mb-6">
            Are you sure you want to log out?
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700/50 border border-gray-600 text-gray-300 rounded-lg font-medium hover:bg-gray-700 hover:text-white transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 bg-red-500/80 text-white rounded-lg font-medium hover:bg-red-500 transition-all duration-300"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
