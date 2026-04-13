"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComplete(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isComplete) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse"
          style={{ top: "20%", left: "10%" }}
        ></div>
        <div
          className="absolute w-[700px] h-[700px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse"
          style={{ bottom: "10%", right: "10%", animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10">
        <h1 className="text-4xl font-bold tracking-tighter animate-pulse">
          Loading...
        </h1>
      </div>
    </div>
  );
}
