"use client";

interface ProgressIndicatorProps {
  total: number;
  current: number;
}

export default function ProgressIndicator({
  total,
  current,
}: ProgressIndicatorProps) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`progress-dot ${
            i === current ? "active" : i < current ? "completed" : ""
          }`}
        />
      ))}
    </div>
  );
}
