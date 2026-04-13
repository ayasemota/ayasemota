"use client";

import { useEffect, useState } from "react";

interface WelcomeScreenProps {
  onComplete: () => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [phase, setPhase] = useState<
    "entering" | "visible" | "exiting" | "done"
  >("entering");

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase("visible"), 100);
    const visibleTimer = setTimeout(() => setPhase("exiting"), 3000);
    const exitTimer = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 3800);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(visibleTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center z-10 transition-opacity duration-700 ${
        phase === "entering"
          ? "opacity-0"
          : phase === "exiting"
          ? "opacity-0"
          : "opacity-100"
      }`}
    >
      <h1
        className={`text-4xl md:text-5xl font-light tracking-wide text-white/90 transition-all duration-700 ${
          phase === "entering"
            ? "translate-y-4 opacity-0"
            : phase === "exiting"
            ? "-translate-y-4 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        Welcome
      </h1>
      <p
        className={`mt-4 text-lg text-white/50 font-light transition-all duration-700 delay-200 ${
          phase === "entering"
            ? "translate-y-4 opacity-0"
            : phase === "exiting"
            ? "-translate-y-4 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        We&apos;re glad to have you.
      </p>
    </div>
  );
}
