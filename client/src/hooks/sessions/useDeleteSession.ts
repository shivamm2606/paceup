import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import { toast } from "sonner";
import type { ApiSuccessResponse } from "../../types/apiErrorResponse";
import type { PaginatedSessions } from "../../types/workoutSession.types";

export const useDeleteSession = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      api.delete(`/workout-session/${sessionId}`).then((r) => r.data),

    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["session", sessionId] });

      queryClient.setQueryData<ApiSuccessResponse<PaginatedSessions>>(
        ["AllWorkoutSessions"],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: {
              ...old.data,
              sessions: old.data.sessions.filter((s) => s._id !== sessionId),
              total: Math.max(0, old.data.total - 1),
            },
          };
        },
      );

      queryClient.invalidateQueries({ queryKey: ["AllWorkoutSessions"] });
      toast.success("Workout discarded");
    },
    onError: () => {
      toast.error("Failed to discard workout");
    },
  });
};
