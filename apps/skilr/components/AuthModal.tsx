import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ModalType = "success" | "error" | "info";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ModalType;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

const modalConfig: Record<
  ModalType,
  { bgColor: string; borderColor: string; iconBg: string; iconColor: string }
> = {
  success: {
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    iconBg: "bg-green-500/10",
    iconColor: "text-green-400",
  },
  error: {
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    iconBg: "bg-red-500/10",
    iconColor: "text-red-400",
  },
  info: {
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
  },
};

const ModalIcon = ({ type }: { type: ModalType }) => {
  const config = modalConfig[type];

  const icons: Record<ModalType, React.ReactNode> = {
    success: <CheckCircle className="w-8 h-8" />,
    error: <AlertCircle className="w-8 h-8" />,
    info: <Info className="w-8 h-8" />,
  };

  return (
    <div
      className={`w-16 h-16 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-4 border ${config.borderColor}`}
    >
      <div className={config.iconColor}>{icons[type]}</div>
    </div>
  );
};

export const AuthModal = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
}: AuthModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      <div
        className="relative bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-300"
        >
          <X size={24} />
        </button>
        <div className="text-center">
          <ModalIcon type={type} />
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400 mb-6">{message}</p>
          <div className="space-y-3">
            {actionText && onAction && (
              <button
                onClick={onAction}
                className="w-full py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
              >
                {actionText}
              </button>
            )}
            {secondaryActionText && onSecondaryAction && (
              <button
                onClick={onSecondaryAction}
                className="w-full py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-all duration-300"
              >
                {secondaryActionText}
              </button>
            )}
            {!actionText && !secondaryActionText && (
              <button
                onClick={onClose}
                className="w-full py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
              >
                Got it
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
