import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";
import type { ApiSuccessResponse } from "../../types/apiErrorResponse";
import type { IWorkoutSession } from "../../types/workoutSession.types";

export const useSession = (sessionId: string) => {
  return useQuery({
    queryKey: ["session", sessionId],
    queryFn: (): Promise<ApiSuccessResponse<IWorkoutSession>> =>
      api
        .get(`/workout-session/${sessionId}`)
        .then((r) => r.data as ApiSuccessResponse<IWorkoutSession>),
    select: (response) => response.data,
    enabled: !!sessionId,
  });
};
