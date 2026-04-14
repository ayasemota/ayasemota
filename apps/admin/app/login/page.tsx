"use client";

import { useRouter } from "next/navigation";
import PinLogin from "@/components/PinLogin";

export default function LoginPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/dashboard");
  };

  return <PinLogin onSuccess={handleSuccess} />;
}
