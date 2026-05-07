import { useState, useMemo } from "react";
import { useCurrentUser } from "../hooks/user/useCurrentUser";
import { useLogout } from "../hooks/auth/useLogout";
import { useWorkoutSessions } from "../hooks/sessions/useWorkoutSessions";
import { EditProfileSheet } from "../components/profile/EditProfileSheet";
import { ChangePasswordSheet } from "../components/profile/ChangePasswordSheet";
import { DeleteAccountSheet } from "../components/profile/DeleteAccountSheet";

// helper

const LABELS: Record<string, string> = {
  lose_weight: "Lose Weight",
  maintain: "Maintain",
  lean_bulk: "Lean Bulk",
  bulk: "Bulk",
  sedentary: "Sedentary",
  lightly_active: "Lightly Active",
  moderately_active: "Moderately Active",
  very_active: "Very Active",
};

function formatLabel(key?: string) {
  return key ? (LABELS[key] ?? key) : "-";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// main

function Profile() {
  const { data: user } = useCurrentUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { data: sessions } = useWorkoutSessions();

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const userInfo = user?.userInfo;
  const totalSessions = sessions?.sessions?.length ?? 0;
  const goalLabel = useMemo(
    () => formatLabel(userInfo?.goal),
    [userInfo?.goal],
  );

  const handleLogout = () =>
    confirmLogout ? logout() : setConfirmLogout(true);

  return (
    <div
      className="bg-[#0b0b10] bg-[radial-gradient(140%_90%_at_50%_0%,_rgba(70,80,120,0.16),_rgba(11,11,16,0)_55%),linear-gradient(180deg,_rgba(12,12,18,1)_0%,_rgba(10,10,16,1)_100%)] text-[#f4f4f6] min-h-screen"
      style={{ paddingBottom: "calc(82px + env(safe-area-inset-bottom))" }}
    >
      {/* Header */}
      <div
        className="px-5 pb-2"
        style={{ paddingTop: "calc(24px + env(safe-area-inset-top))" }}
      >
        <p className="text-[11px] font-bold text-[#44445a] tracking-[0.1em] uppercase mb-1.5">
          Account
        </p>
        <h1 className="text-[30px] font-black text-[#f0f0f5] tracking-[-0.04em] leading-[1.1] m-0">
          Profile
        </h1>
      </div>

      <div className="space-y-5 px-5 pt-4">
        {/* Hero Profile Card */}
        <div className="relative bg-[#121216] border border-[#1a1a20] rounded-[20px] overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[280px] h-[120px] bg-[radial-gradient(ellipse_at_center,_rgba(123,157,255,0.06)_0%,_transparent_70%)] pointer-events-none" />

          <div className="relative flex flex-col items-center pt-7 pb-6 px-5">
            {/* Avatar */}
            <div
              className="w-[76px] h-[76px] rounded-full flex items-center justify-center mb-4"
              style={{
                background:
                  "linear-gradient(135deg, #7b9dff 0%, #4ade80 50%, #7b9dff 100%)",
                padding: "2.5px",
              }}
            >
              <div className="w-full h-full rounded-full bg-[#121216] flex items-center justify-center">
                <span className="text-[22px] font-black text-[#7b9dff] tracking-tight select-none">
                  {user?.name ? getInitials(user.name) : "?"}
                </span>
              </div>
            </div>

            {/* Name & Email */}
            <p className="text-[18px] font-extrabold text-[#f0f0f5] tracking-tight text-center leading-tight">
              {user?.name ?? "-"}
            </p>
            <p className="text-[12px] text-[#6b6b80] mt-1 text-center">
              {user?.email ?? "-"}
            </p>
            {user?.username && (
              <p className="text-[11px] text-[#44445a] mt-0.5 text-center">
                @{user.username}
              </p>
            )}

            {/* Quick stats */}
            <div className="flex items-center gap-8 mt-5">
              <MiniStat label="Workouts" value={`${totalSessions}`} />
              <div className="w-px h-6 bg-[#1e1e28]" />
              <MiniStat label="Goal" value={goalLabel} />
            </div>
          </div>
        </div>

        {/* Body Stats */}
        <div>
          <SectionLabel>Body Stats</SectionLabel>
          <div className="grid grid-cols-3 gap-[10px]">
            <StatTile label="Height" value={userInfo?.height} unit="cm" />
            <StatTile
              label="Weight"
              value={userInfo?.currentWeight}
              unit="kg"
            />
            <StatTile label="Target" value={userInfo?.targetWeight} unit="kg" />
          </div>
          <div className="grid grid-cols-3 gap-[10px] mt-[10px]">
            <StatTile
              label="Calories"
              value={
                userInfo?.dailyCalorieGoal
                  ? Math.round(userInfo.dailyCalorieGoal)
                  : undefined
              }
              unit="kcal"
            />
            <InfoTile label="Goal" value={formatLabel(userInfo?.goal)} />
            <InfoTile
              label="Activity"
              value={formatLabel(userInfo?.activityLevel)}
            />
          </div>
        </div>

        {/* Settings */}
        <div>
          <SectionLabel>Settings</SectionLabel>
          <div className="bg-[#121216] border border-[#1a1a20] rounded-[16px] overflow-hidden">
            <MenuItem
              icon={<EditIcon />}
              label="Edit Profile"
              onClick={() => setShowEditProfile(true)}
              showBorder
            />
            <MenuItem
              icon={<LockIcon />}
              label="Change Password"
              onClick={() => setShowChangePassword(true)}
            />
          </div>
        </div>

        {/* Account Actions */}
        <div>
          <SectionLabel>Account</SectionLabel>
          <div className="flex flex-col gap-[8px]">
            <DangerButton
              icon={<LogoutIcon />}
              label="Logout"
              confirmLabel="Tap again to confirm logout"
              isConfirming={confirmLogout}
              disabled={isLoggingOut}
              onClick={handleLogout}
            />
            <DangerButton
              icon={<TrashIcon />}
              label="Delete Account"
              confirmLabel="Delete Account"
              isConfirming={false}
              disabled={false}
              onClick={() => setShowDeleteAccount(true)}
              variant="destructive"
            />
          </div>
        </div>

        {/* App Version */}
        <div className="flex justify-center pt-2 pb-4">
          <p className="text-[11px] text-[#33334a]">RepUp v1.0.0</p>
        </div>
      </div>

      {/* Sheets */}
      {showEditProfile && (
        <EditProfileSheet onClose={() => setShowEditProfile(false)} />
      )}
      {showChangePassword && (
        <ChangePasswordSheet onClose={() => setShowChangePassword(false)} />
      )}
      {showDeleteAccount && (
        <DeleteAccountSheet onClose={() => setShowDeleteAccount(false)} />
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-semibold text-[#8b8b9a] mb-[10px] tracking-[0.04em]">
      {children}
    </p>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <p className="text-[16px] font-extrabold text-[#f0f0f5] tabular-nums leading-none">
        {value}
      </p>
      <p className="text-[10px] font-semibold text-[#55556a] tracking-[0.04em] uppercase">
        {label}
      </p>
    </div>
  );
}

function StatTile({
  label,
  value,
  unit,
}: {
  label: string;
  value?: number;
  unit: string;
}) {
  const display = value != null ? `${value}` : "-";
  return (
    <div className="bg-[#121216] border border-[#1a1a20] rounded-[14px] p-[14px]">
      <p className="text-[10px] font-bold text-[#44445a] tracking-[0.06em] uppercase mb-1.5">
        {label}
      </p>
      <div className="flex items-baseline gap-0.5">
        <p className="text-[20px] font-black text-[#f0f0f5] tabular-nums leading-none">
          {display}
        </p>
        {display !== "-" && (
          <span className="text-[10px] font-semibold text-[#55556a]">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#121216] border border-[#1a1a20] rounded-[14px] p-[14px]">
      <p className="text-[10px] font-bold text-[#44445a] tracking-[0.06em] uppercase mb-1.5">
        {label}
      </p>
      <p className="text-[13px] font-bold text-[#f0f0f5] leading-none truncate">
        {value}
      </p>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  showBorder = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  showBorder?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-[15px] text-[#8b8b9a] hover:bg-[#15151d] transition-all duration-150 active:scale-[0.98] ${
        showBorder ? "border-b border-[#1a1a20]" : ""
      }`}
    >
      {icon}
      <span className="text-[13px] font-bold text-[#e0e0ea] tracking-tight flex-1 text-left">
        {label}
      </span>
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
        <path
          d="M5 3l4 4-4 4"
          stroke="#44445a"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function DangerButton({
  icon,
  label,
  confirmLabel,
  isConfirming,
  disabled,
  onClick,
  variant = "warning",
}: {
  icon: React.ReactNode;
  label: string;
  confirmLabel: string;
  isConfirming: boolean;
  disabled: boolean;
  onClick: () => void;
  variant?: "warning" | "destructive";
}) {
  const confirmColors =
    variant === "destructive"
      ? "bg-[rgba(239,68,68,0.06)] border-[rgba(239,68,68,0.15)] text-[#ef4444]"
      : "bg-[rgba(251,191,36,0.06)] border-[rgba(251,191,36,0.15)] text-[#fbbf24]";

  const defaultColors =
    variant === "destructive"
      ? "bg-[#121216] border-[#1a1a20] text-[#6b6b80] hover:bg-[#15151d] hover:border-[#2a2a38]"
      : "bg-[#121216] border-[#1a1a20] text-[#8b8b9a] hover:bg-[#15151d] hover:border-[#2a2a38]";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-[14px] rounded-[14px] border transition-all duration-150 active:scale-[0.98] ${
        isConfirming ? confirmColors : defaultColors
      }`}
    >
      {icon}
      <span className="text-[13px] font-bold tracking-tight flex-1 text-left">
        {isConfirming ? confirmLabel : label}
      </span>
    </button>
  );
}

// icons

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M16.474 5.408l2.118 2.118m-.756-3.982L12.109 9.27a2.118 2.118 0 00-.58 1.082L11 13l2.648-.53a2.118 2.118 0 001.082-.58l5.727-5.727a1.853 1.853 0 10-2.621-2.621z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 15v3a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="11"
        width="18"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M7 11V7a5 5 0 0110 0v4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default Profile;
