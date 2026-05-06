import { useState } from "react";
import { useChangePassword } from "../../hooks/user/useChangePassword";
import { SheetWrapper, FormField, SaveButton } from "./SheetWrapper";

interface Props {
  onClose: () => void;
}

export function ChangePasswordSheet({ onClose }: Props) {
  const { mutate: changePassword, isPending } = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return setError("All fields are required");
    }
    if (newPassword.length < 8) {
      return setError("New password must be at least 8 characters");
    }
    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match");
    }

    changePassword({ currentPassword, newPassword }, { onSuccess: onClose });
  };

  return (
    <SheetWrapper title="Change Password" subtitle="Security" onClose={onClose}>
      <div className="overflow-y-auto flex-1 -mx-1.5 px-1.5 space-y-4">
        <FormField
          label="Current Password"
          value={currentPassword}
          onChange={setCurrentPassword}
          placeholder="Enter current password"
          type="password"
        />
        <FormField
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
          placeholder="At least 8 characters"
          type="password"
        />
        <FormField
          label="Confirm New Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Re-enter new password"
          type="password"
        />

        {error && (
          <p
            className="text-[12px] font-bold text-[#ef4444] px-1"
            style={{ animation: "fadeSlideUp 0.2s ease-out" }}
          >
            {error}
          </p>
        )}
      </div>

      <SaveButton
        onClick={handleSave}
        disabled={isPending}
        label="Change Password"
        pendingLabel="Changing…"
      />
    </SheetWrapper>
  );
}
