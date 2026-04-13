import { useAuthContext } from "@/components/AuthProvider";

export const useAuth = () => {
  return useAuthContext();
};
