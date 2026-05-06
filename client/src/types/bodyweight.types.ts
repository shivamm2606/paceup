export interface IBodyweightLog {
  _id: string;
  userId: string;
  weight: number;
  unit: "kg" | "lbs";
  date: string;
  notes?: string;
}

export interface PaginatedBodyweights {
  entries: IBodyweightLog[];
  total: number;
  page: number;
  totalPages: number;
}

export interface LogBodyweightPayload {
  weight: number;
  unit: "kg" | "lbs";
  date?: Date;
  notes?: string;
}
