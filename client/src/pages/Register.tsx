import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegister } from "../hooks/auth/useRegister";
import { getErrorMessage } from "../utils/getErrorMessage";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthHeader } from "../components/auth/AuthHeader";
import { AuthInput } from "../components/auth/AuthInput";
import { AuthSubmitButton } from "../components/auth/AuthSubmitButton";
import { AuthAlert } from "../components/auth/AuthAlert";

const EyeOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const EyeClosed = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <line
      x1="1"
      y1="1"
      x2="23"
      y2="23"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="7" r="3.5" stroke="#44445a" strokeWidth="1.5" />
    <path
      d="M3 18c0-3.3 3.1-6 7-6s7 2.7 7 6"
      stroke="#44445a"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const EmailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
    <rect
      x="2"
      y="4"
      width="16"
      height="12"
      rx="2"
      stroke="#44445a"
      strokeWidth="1.5"
    />
    <path
      d="M2 7l8 5 8-5"
      stroke="#44445a"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const UsernameIcon = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
    <path
      d="M4 6h12M4 10h8M4 14h6"
      stroke="#44445a"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
    <rect
      x="3"
      y="9"
      width="14"
      height="10"
      rx="2"
      stroke="#44445a"
      strokeWidth="1.5"
    />
    <path
      d="M7 9V6a3 3 0 016 0v3"
      stroke="#44445a"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const ConfirmLockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
    <rect
      x="3"
      y="9"
      width="14"
      height="10"
      rx="2"
      stroke="#44445a"
      strokeWidth="1.5"
    />
    <path
      d="M7 9V6a3 3 0 016 0v3"
      stroke="#44445a"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M9 14.5l1.5 1.5 2.5-2.5"
      stroke="#44445a"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function PasswordToggle({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-[#44445a] hover:text-[#8b8b9a] transition-colors"
    >
      {show ? <EyeClosed /> : <EyeOpen />}
    </button>
  );
}

function PasswordHint({ password }: { password: string }) {
  if (!password) return null;

  const hint =
    password.length < 8
      ? "Must be at least 8 characters"
      : !/[A-Z]/.test(password)
        ? "Must contain an uppercase letter"
        : !/[a-z]/.test(password)
          ? "Must contain a lowercase letter"
          : !/[0-9]/.test(password)
            ? "Must contain a number"
            : !/[^A-Za-z0-9]/.test(password)
              ? "Must contain a special character"
              : null;

  if (!hint) return null;

  return <p className="text-[11px] text-[#ef4444] mt-1.5 pl-1">{hint}</p>;
}

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { mutate: register, error, isPending } = useRegister();

  const handleSubmit = () => {
    setLocalError(null);
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    if (!termsAccepted) {
      setLocalError("Please accept the Terms & Conditions.");
      return;
    }
    register({ name, email, username, password });
  };

  const displayError = localError ?? (error ? getErrorMessage(error) : null);

  const isValid =
    name.trim() &&
    email.trim() &&
    username.trim() &&
    password &&
    confirmPassword &&
    termsAccepted;

  const confirmBorderClass =
    confirmPassword && confirmPassword !== password
      ? "border-[rgba(239,68,68,0.4)] focus:border-[rgba(239,68,68,0.6)]"
      : confirmPassword && confirmPassword === password
        ? "border-[rgba(71,184,255,0.4)] focus:border-[rgba(71,184,255,0.5)]"
        : "";

  return (
    <AuthLayout>
      <AuthHeader
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 12a5 5 0 100-10 5 5 0 000 10z"
              stroke="#3da1d4"
              strokeWidth="1.8"
            />
            <path
              d="M3 21c0-4 4-7 9-7s9 3 9 7"
              stroke="#3da1d4"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M19 8v4M17 10h4"
              stroke="#3da1d4"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        }
        subtitle="Get started"
        title={
          <>
            Build your
            <br />
            <span className="text-[#3da1d4]">best self.</span>
          </>
        }
        description="Track workouts, hit PRs, stay consistent."
      />

      {displayError && <AuthAlert variant="error" message={displayError} />}

      <div className="space-y-3 mb-5">
        <AuthInput
          icon={<UserIcon />}
          value={name}
          onChange={setName}
          placeholder="Full name"
        />
        <AuthInput
          icon={<EmailIcon />}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Email address"
        />
        <AuthInput
          icon={<UsernameIcon />}
          value={username}
          onChange={setUsername}
          placeholder="username"
          prefix="@"
          className="font-mono"
        />

        <div>
          <AuthInput
            icon={<LockIcon />}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={setPassword}
            placeholder="Password"
            rightAction={
              <PasswordToggle
                show={showPassword}
                onToggle={() => setShowPassword((p) => !p)}
              />
            }
          />
          <PasswordHint password={password} />
        </div>

        <AuthInput
          icon={<ConfirmLockIcon />}
          type={showConfirm ? "text" : "password"}
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Confirm password"
          className={confirmBorderClass}
          rightAction={
            <PasswordToggle
              show={showConfirm}
              onToggle={() => setShowConfirm((p) => !p)}
            />
          }
        />
      </div>

      <label className="flex items-start gap-3 mb-6 cursor-pointer group">
        <div
          onClick={() => setTermsAccepted((t) => !t)}
          className={`w-5 h-5 rounded-[6px] border flex items-center justify-center shrink-0 mt-[1px] transition-all duration-150 ${
            termsAccepted
              ? "bg-[#3da1d4] border-[#3da1d4]"
              : "bg-[#111116] border-[#1e1e28] group-hover:border-[#2a2a38]"
          }`}
        >
          {termsAccepted && (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6l3 3 5-5"
                stroke="#fff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <p className="text-[12px] text-[#6b6b80] leading-relaxed">
          I agree to the{" "}
          <span className="text-[#3da1d4] font-semibold">
            Terms & Conditions
          </span>{" "}
          and{" "}
          <span className="text-[#3da1d4] font-semibold">Privacy Policy</span>
        </p>
      </label>

      <AuthSubmitButton
        onClick={handleSubmit}
        disabled={isPending || !isValid}
        isPending={isPending}
        label="Create Account"
        pendingLabel="Creating account..."
      />

      <p className="text-[13px] text-[#44445a] text-center mt-6">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-[#3da1d4] font-bold hover:text-[#4db5e6] transition-colors"
        >
          Log in
        </button>
      </p>
    </AuthLayout>
  );
}

export default Register;
