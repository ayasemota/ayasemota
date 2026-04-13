"use client";

import { useEffect, useState } from "react";

interface CompletionScreenProps {
  status: "submitting" | "success" | "error";
  onRetry?: () => void;
}

export default function CompletionScreen({ status, onRetry }: CompletionScreenProps) {
  const [phase, setPhase] = useState<"entering" | "visible">("entering");

  useEffect(() => {
    const timer = setTimeout(() => setPhase("visible"), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-10 px-6">
      <div
        className={`text-center transition-all duration-1000 ${
          phase === "entering"
            ? "opacity-0 translate-y-8"
            : "opacity-100 translate-y-0"
        }`}
      >
        <div className="mb-8">
          <div
            className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center animate-pulse-slow ${
              status === "success"
                ? "bg-emerald-500/20 text-emerald-400"
                : status === "error"
                ? "bg-red-500/20 text-red-400"
                : "bg-indigo-500/20 text-indigo-400"
            }`}
          >
            {status === "success" ? (
              <svg
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : status === "error" ? (
              <svg
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-10 h-10 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-light text-white/90 mb-4">
          {status === "success"
            ? "Registration Complete"
            : status === "error"
            ? "Registration Failed"
            : "Submitting..."}
        </h2>

        <div className="text-lg text-white/60 max-w-md mx-auto mb-8 leading-relaxed">
          {status === "success" ? (
            "Your registration was successful! Your details have been submitted securely. Proceed to your dashboard below to complete your setup."
          ) : status === "error" ? (
            "We encountered an unexpected error while trying to submit your registration. Please check your connection and try again, or reach out to support."
          ) : (
            "Please wait while we securely submit your details to the database."
          )}
        </div>

        {status === "error" && onRetry && (
          <button
            onClick={onRetry}
            className="px-8 py-3 bg-red-500/20 border border-red-500/50 rounded-full text-white/90 hover:bg-red-500/30 transition-all duration-300"
          >
            Try Again
          </button>
        )}

        {status === "success" && (
          <a
            href="https://ayz-skilr.vercel.app/"
            className="inline-block px-8 py-3 bg-indigo-500/20 border border-indigo-500/50 rounded-full text-indigo-100 hover:bg-indigo-500/30 transition-all duration-300 font-medium"
          >
            Go to Dashboard →
          </a>
        )}
      </div>
    </div>
  );
}