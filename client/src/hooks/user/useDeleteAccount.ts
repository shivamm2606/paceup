import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import useAuthStore from "../../store/authStore";
import { toast } from "sonner";

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => api.delete("/user/account").then((r) => r.data),
    onSuccess: () => {
      useAuthStore.getState().clearAuth();
      queryClient.clear();
      navigate("/", { replace: true });
      toast.success("Account deleted");
    },
    onError: () => {
      toast.error("Failed to delete account");
    },
  });
};
