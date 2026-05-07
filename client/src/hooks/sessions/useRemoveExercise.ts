import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";

export const useRemoveExercise = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exerciseId: string) =>
      api
        .delete(`/workout-session/${sessionId}/exercise/${exerciseId}`)
        .then((r) => r.data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
    },
  });
};
