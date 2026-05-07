import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import { toast } from "sonner";

export const useDeleteSession = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      api.delete(`/workout-session/${sessionId}`).then((r) => r.data),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["session", sessionId] });
      await queryClient.cancelQueries({ queryKey: ["AllWorkoutSessions"] });

      // immediate delete
      queryClient.setQueriesData<{ sessions: { _id: string }[] }>(
        { queryKey: ["AllWorkoutSessions"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            sessions: old.sessions.filter((s) => s._id !== sessionId),
          };
        },
      );
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["session", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["AllWorkoutSessions"] });
      toast.success("Workout discarded");
    },
    onError: () => {
      // Refetch to restore the cache if delete failed
      queryClient.invalidateQueries({ queryKey: ["AllWorkoutSessions"] });
      toast.error("Failed to discard workout");
    },
  });
};
