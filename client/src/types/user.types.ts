export interface UpdateUserInfoPayload {
  height?: number;
  currentWeight?: number;
  targetWeight?: number;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  activityLevel?:
    | "sedentary"
    | "lightly_active"
    | "moderately_active"
    | "very_active";
  goal?: "lose_weight" | "maintain" | "lean_bulk" | "bulk";
}
