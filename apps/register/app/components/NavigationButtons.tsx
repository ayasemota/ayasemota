"use client";

interface NavigationButtonsProps {
  onBack?: () => void;
  onRestart: () => void;
  showBack: boolean;
  showRestart: boolean;
}

export default function NavigationButtons({
  onBack,
  onRestart,
  showBack,
  showRestart,
}: NavigationButtonsProps) {
  return (
    <div className="fixed top-6 left-0 right-0 flex justify-between px-6 z-20">
      {showBack && onBack ? (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>
      ) : (
        <div />
      )}

      {showRestart ? (
        <button
          onClick={onRestart}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Restart
        </button>
      ) : (
        <div />
      )}
    </div>
  );
}
