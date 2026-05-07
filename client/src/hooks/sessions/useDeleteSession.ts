import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import { toast } from "sonner";

export const useDeleteSession = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      api.delete(`/workout-session/${sessionId}`).then((r) => r.data),

    onMutate: async () => {
      // Cancel any in-flight refetches so they don't overwrite our removal
      await queryClient.cancelQueries({ queryKey: ["session", sessionId] });
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["session", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["AllWorkoutSessions"] });
      toast.success("Workout discarded");
    },
    onError: () => {
      toast.error("Failed to discard workout");
    },
  });
};
