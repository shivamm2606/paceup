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

      // Immediately remove this session from every matching cache entry
      queryClient.setQueriesData(
        { queryKey: ["AllWorkoutSessions"] },
        (old: unknown) => {
          if (!old || typeof old !== "object") return old;
          const data = old as { sessions?: { _id: string }[] };
          if (!data.sessions) return old;
          return {
            ...data,
            sessions: data.sessions.filter((s) => s._id !== sessionId),
          };
        },
      );

      // Also remove the individual session query
      queryClient.removeQueries({ queryKey: ["session", sessionId] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["AllWorkoutSessions"] });
      toast.success("Workout discarded");
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["AllWorkoutSessions"] });
      toast.error("Failed to discard workout");
    },
  });
};
