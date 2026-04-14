"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import RegisterServiceWorker from "./register-sw";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);

  return (
    <>
      <RegisterServiceWorker />
    </>
  );
}
