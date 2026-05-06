import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import { toast } from "sonner";

export const useDeleteBodyweightEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bodyweightId: string) =>
      api.delete(`/bodyweight/${bodyweightId}`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["AllBodyweightLogs"] });
      toast.success("Entry deleted");
    },
    onError: () => {
      toast.error("Failed to delete entry");
    },
  });
};
