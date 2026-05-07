import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import { toast } from "sonner";

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
      api.patch(`/workout-session/${sessionId}/complete`, data ?? {}).then((r) => r.data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["AllWorkoutSessions"] });
      toast.success("Workout completed!");
    },
    onError: () => {
      toast.error("Failed to complete workout");
    },
  });
};
