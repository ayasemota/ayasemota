import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const useAutoRefresh = () => {
  const router = useRouter();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        router.refresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);
};
