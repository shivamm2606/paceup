import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";
import type { ApiSuccessResponse } from "../../types/apiErrorResponse";
import type {
  PaginatedSessions,
  ISetLog,
} from "../../types/workoutSession.types";

/**
 * Fetches recent completed sessions and builds a lookup map
 * of exerciseId -> last performed sets for that exercise.
 */
export function usePreviousExerciseData() {
  const query = useQuery({
    queryKey: ["previousExerciseData"],
    queryFn: async () => {
      const res = await api.get("/workout-session/?page=1&limit=20");
      const data = (res.data as ApiSuccessResponse<PaginatedSessions>).data;
      return data.sessions;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Build a map: exerciseId -> sets from the most recent completed session
  const previousMap = new Map<string, ISetLog[]>();

  if (query.data) {
    const completed = query.data.filter((s) => s.status === "completed");
    // Iterate newest first — only keep the first (most recent) occurrence
    for (const session of completed) {
      for (const ex of session.exercises) {
        const exId =
          typeof ex.exerciseId === "string"
            ? ex.exerciseId
            : (ex.exerciseId as unknown as { _id: string })._id;
        if (!previousMap.has(exId) && ex.sets.length > 0) {
          previousMap.set(exId, ex.sets);
        }
      }
    }
  }

  return { previousMap, isLoading: query.isLoading };
}
