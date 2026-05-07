import { useState } from "react";
import { useCurrentUser } from "../../hooks/user/useCurrentUser";
import { useUpdateUserInfo } from "../../hooks/user/useUpdateUserInfo";
import { useUpdateAccount } from "../../hooks/user/useUpdateAccount";
import {
  SheetWrapper,
  FormField,
  SelectField,
  SectionLabel,
  SaveButton,
} from "./SheetWrapper";

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentary" },
  { value: "lightly_active", label: "Lightly Active" },
  { value: "moderately_active", label: "Moderately Active" },
  { value: "very_active", label: "Very Active" },
] as const;

const GOAL_OPTIONS = [
  { value: "lose_weight", label: "Lose Weight" },
  { value: "maintain", label: "Maintain" },
  { value: "lean_bulk", label: "Lean Bulk" },
  { value: "bulk", label: "Bulk" },
] as const;

interface Props {
  onClose: () => void;
}

export function EditProfileSheet({ onClose }: Props) {
  const { data: user } = useCurrentUser();
  const { mutate: updateUserInfo, isPending: isUpdatingInfo } =
    useUpdateUserInfo();
  const { mutate: updateAccount, isPending: isUpdatingAccount } =
    useUpdateAccount();
  const isPending = isUpdatingInfo || isUpdatingAccount;

  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [height, setHeight] = useState(
    user?.userInfo?.height?.toString() ?? "",
  );
  const [currentWeight, setCurrentWeight] = useState(
    user?.userInfo?.currentWeight?.toString() ?? "",
  );
  const [targetWeight, setTargetWeight] = useState(
    user?.userInfo?.targetWeight?.toString() ?? "",
  );
  const [dob, setDob] = useState(() => {
    const d = user?.userInfo?.dateOfBirth;
    return d ? new Date(d).toISOString().slice(0, 10) : "";
  });
  const [activityLevel, setActivityLevel] = useState(
    user?.userInfo?.activityLevel ?? "",
  );
  const [goal, setGoal] = useState(user?.userInfo?.goal ?? "");

  const handleSave = () => {
    // diff
    const accountData: Record<string, string> = {};
    if (name.trim() && name.trim() !== user?.name)
      accountData.name = name.trim();
    if (username.trim() && username.trim() !== user?.username)
      accountData.username = username.trim();
    if (email.trim() && email.trim() !== user?.email)
      accountData.email = email.trim();

    const infoData: Record<string, number | string> = {};
    if (height && parseFloat(height) > 0) infoData.height = parseFloat(height);
    if (currentWeight && parseFloat(currentWeight) > 0)
      infoData.currentWeight = parseFloat(currentWeight);
    if (targetWeight && parseFloat(targetWeight) > 0)
      infoData.targetWeight = parseFloat(targetWeight);
    if (dob) infoData.dateOfBirth = dob;
    if (activityLevel) infoData.activityLevel = activityLevel;
    if (goal) infoData.goal = goal;

    if (Object.keys(accountData).length > 0) updateAccount(accountData);
    if (Object.keys(infoData).length > 0) updateUserInfo(infoData as any);

    onClose();
  };

  return (
    <SheetWrapper title="Edit Profile" subtitle="Settings" onClose={onClose}>
      {/* Form */}
      <div className="overflow-y-auto flex-1 -mx-1.5 px-1.5 space-y-4">
        <SectionLabel>Account</SectionLabel>
        <FormField
          label="Name"
          value={name}
          onChange={setName}
          placeholder="Your name"
        />
        <FormField
          label="Username"
          value={username}
          onChange={setUsername}
          placeholder="username"
        />
        <FormField
          label="Email"
          value={email}
          onChange={setEmail}
          placeholder="email@example.com"
          type="email"
        />

        <SectionLabel>Body</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          <FormField
            label="Height (cm)"
            value={height}
            onChange={setHeight}
            placeholder="175"
            type="number"
          />
          <FormField
            label="Weight (kg)"
            value={currentWeight}
            onChange={setCurrentWeight}
            placeholder="80"
            type="number"
          />
          <FormField
            label="Target (kg)"
            value={targetWeight}
            onChange={setTargetWeight}
            placeholder="75"
            type="number"
          />
        </div>
        <FormField
          label="Date of Birth"
          value={dob}
          onChange={setDob}
          type="date"
        />

        <SectionLabel>Goals</SectionLabel>
        <SelectField
          label="Activity Level"
          value={activityLevel}
          onChange={setActivityLevel}
          options={ACTIVITY_OPTIONS}
        />
        <SelectField
          label="Fitness Goal"
          value={goal}
          onChange={setGoal}
          options={GOAL_OPTIONS}
        />
      </div>

      <SaveButton
        onClick={handleSave}
        disabled={isPending}
        label="Save Changes"
        pendingLabel="Saving…"
      />
    </SheetWrapper>
  );
}
