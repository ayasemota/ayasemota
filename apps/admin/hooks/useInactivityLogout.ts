import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export const useInactivityLogout = (timeoutMinutes: number = 30) => {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const resetTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(
        () => {
          localStorage.removeItem("adminAuth");
          localStorage.removeItem("loginTime");
          router.replace("/login");
        },
        timeoutMinutes * 60 * 1000,
      );
    };

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleActivity = () => {
      resetTimer();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    resetTimer();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [router, timeoutMinutes]);
};
