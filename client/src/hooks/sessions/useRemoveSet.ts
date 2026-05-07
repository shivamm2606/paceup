import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";

interface RemoveSetArgs {
  exerciseId: string;
  setIndex: number;
}

export const useRemoveSet = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ exerciseId, setIndex }: RemoveSetArgs) =>
      api
        .delete(
          `/workout-session/${sessionId}/exercise/${exerciseId}/set/${setIndex}`,
        )
        .then((r) => r.data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
    },
  });
};
