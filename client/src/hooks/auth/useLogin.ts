import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post("/auth/login", data).then((r) => r.data),

    onSuccess: (data) => {
      const user = data.data;
      queryClient.setQueryData(["currentUser"], user);
      useAuthStore
        .getState()
        .setAuth(user, user.accessToken, user.refreshToken);

      if (!user.userInfo?.gender) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    },
    onError: (error: AxiosError<{ message: string }>, variables) => {
      if (error?.response?.data?.message === "Email not verified") {
        navigate("/verify-otp", { state: { email: variables.email } });
      }
    },
  });
};
