export interface UserInfo {
  height?: number;
  currentWeight?: number;
  targetWeight?: number;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  activityLevel?: string;
  goal?: string;
  dailyCalorieGoal?: number;
  isCalorieGoalAutoCalculated?: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  userInfo?: UserInfo;
}

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
