import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import { toast } from "sonner";
import type { ApiSuccessResponse } from "../../types/apiErrorResponse";
import type { PaginatedSessions } from "../../types/workoutSession.types";

interface ExerciseSetPayload {
  exerciseId: string;
  sets: Record<string, unknown>[];
  notes?: string;
}

export interface CompleteSessionPayload {
  exercises?: ExerciseSetPayload[];
}

export const useCompleteSession = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: CompleteSessionPayload) =>
      api
        .patch(`/workout-session/${sessionId}/complete`, data ?? {})
        .then((r) => r.data),

    onSuccess: () => {
      // Mark session as completed in the cached list so no auto resume on dashboard
      queryClient.setQueryData<ApiSuccessResponse<PaginatedSessions>>(
        ["AllWorkoutSessions"],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: {
              ...old.data,
              sessions: old.data.sessions.map((s) =>
                s._id === sessionId
                  ? { ...s, status: "completed" as const }
                  : s,
              ),
            },
          };
        },
      );

      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["AllWorkoutSessions"] });
      toast.success("Workout completed!");
    },
    onError: () => {
      toast.error("Failed to complete workout");
    },
  });
};
