import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";
import type { ApiSuccessResponse } from "../../types/apiErrorResponse";
import type { PaginatedBodyweights } from "../../types/bodyweight.types";

export const useBodyweightHistory = (limit = 100) => {
  return useQuery({
    queryKey: ["AllBodyweightLogs", limit],
    queryFn: (): Promise<ApiSuccessResponse<PaginatedBodyweights>> =>
      api
        .get(`/bodyweight/?limit=${limit}`)
        .then((r) => r.data as ApiSuccessResponse<PaginatedBodyweights>),
    select: (response) => response.data,
  });
};
