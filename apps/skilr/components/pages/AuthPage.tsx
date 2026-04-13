import { useState, useEffect } from "react";
import { Logo } from "../Logo";
import { PinInput } from "../PinInput";
import { AuthModal } from "../AuthModal";

interface ModalState {
  isOpen: boolean;
  type: "success" | "error" | "info";
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

interface AuthPageProps {
  onSignIn: (pin: string) => Promise<void>;
}

export const AuthPage = ({
  onSignIn,
}: AuthPageProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [signInForm, setSignInForm] = useState({
    pin: "",
  });

  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSignIn(signInForm.pin);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred during sign in.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-dvh bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-400">
              Enter your PIN to continue
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
            <form id="signin-form" onSubmit={handleSignInSubmit} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                </div>
                <PinInput
                  value={signInForm.pin}
                  onChange={(val) =>
                    setSignInForm({
                      ...signInForm,
                      pin: val,
                    })
                  }
                  isLoading={loading}
                  onComplete={() => {
                    if (signInForm.pin.length === 6) {
                      handleSignInSubmit({ preventDefault: () => {} } as React.FormEvent);
                    }
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center">
                  {successMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        actionText={modal.actionText}
        onAction={modal.onAction}
        secondaryActionText={modal.secondaryActionText}
        onSecondaryAction={modal.onSecondaryAction}
      />
    </>
  );
};
