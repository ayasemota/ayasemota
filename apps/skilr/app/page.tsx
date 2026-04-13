"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Preloader } from "@/components/Preloader";

export default function Home() {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isLoggedIn) {
        router.push("/dashboard");
      } else {
        router.push("/auth");
      }
    }
  }, [isLoggedIn, loading, router]);

  return <Preloader />;
}
