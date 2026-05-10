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

const CheckIcon = ({ done }: { done: boolean }) => (
  <div className="relative w-3 h-3 shrink-0 mt-[1px]">
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      className={`absolute inset-0 transition-all duration-300 ${
        done ? "scale-50 opacity-0" : "scale-100 opacity-100"
      }`}
    >
      <circle cx="12" cy="12" r="9" stroke="#44445a" strokeWidth="1.8" />
    </svg>
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      className={`absolute inset-0 transition-all duration-300 delay-75 ${
        done ? "scale-100 opacity-100" : "scale-50 opacity-0"
      }`}
    >
      <circle cx="12" cy="12" r="10" fill="rgba(71,184,255,0.15)" />
      <path
        d="M8 12.5l3 3 5-6"
        stroke="#3da1d4"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

function PasswordValidation({ password, isFocused }: { password: string; isFocused: boolean }) {
  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const allMet = requirements.every((r) => r.met);
  const shouldShow = (isFocused || password.length > 0) && !allMet;

  return (
    <div
      className={`overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        shouldShow ? "max-h-[140px] opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
      }`}
    >
      <div className="p-2.5 px-3 rounded-[12px] border border-[#1e1e28] bg-[#111116] flex flex-wrap gap-y-2 gap-x-4">
        {requirements.map((req, i) => (
          <div key={i} className="flex items-center gap-1.5 w-[calc(50%-1rem)] min-w-[135px]">
            <CheckIcon done={req.met} />
            <span
              className={`text-[11px] font-medium leading-tight tracking-tight transition-colors duration-300 ${
                req.met
                  ? "text-[#6b6b80] line-through decoration-[#6b6b80]/50"
                  : "text-[#d0d0d5]"
              }`}
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
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
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
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
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
            placeholder="Password"
            rightAction={
              <PasswordToggle
                show={showPassword}
                onToggle={() => setShowPassword((p) => !p)}
              />
            }
          />
          <PasswordValidation password={password} isFocused={isPasswordFocused} />
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
