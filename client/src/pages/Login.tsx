import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/auth/useLogin";
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

const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
    <rect
      x="3"
      y="9"
      width="14"
      height="10"
      rx="2"
      stroke="#44445a"
      strokeWidth="1.6"
    />
    <path
      d="M7 9V6a3 3 0 016 0v3"
      stroke="#44445a"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, error, isPending } = useLogin();

  const handleSubmit = () => {
    if (!email || !password || isPending) return;
    login({ email, password });
  };

  return (
    <AuthLayout>
      <AuthHeader
        icon={
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path
              d="M2 13h3M21 13h3M6 8v10M20 8v10M3 10v6M23 10v6M6 13h14"
              stroke="#3da1d4"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        }
        subtitle="Welcome back"
        title={
          <>
            Log back
            <br />
            <span className="text-[#3da1d4]">into RepUp.</span>
          </>
        }
        description="Your streaks, PRs, and progress are waiting."
      />

      {error && <AuthAlert variant="error" message={getErrorMessage(error)} />}

      <div className="space-y-3 mb-4">
        <AuthInput
          icon={<EmailIcon />}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Email address"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <AuthInput
          icon={<LockIcon />}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder="Password"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          rightAction={
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="text-[#44445a] hover:text-[#8b8b9a] transition-colors"
            >
              {showPassword ? <EyeClosed /> : <EyeOpen />}
            </button>
          }
        />
      </div>

      <div className="flex justify-end mb-6">
        <button
          type="button"
          onClick={() => navigate("/forgot-password")}
          className="text-[12px] font-semibold text-[#44445a] hover:text-[#3da1d4] transition-colors"
        >
          Forgot password?
        </button>
      </div>

      <AuthSubmitButton
        onClick={handleSubmit}
        disabled={isPending || !email || !password}
        isPending={isPending}
        label="Login"
        pendingLabel="Logging in..."
      />

      <p className="text-[13px] text-[#44445a] text-center mt-6">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="text-[#3da1d4] font-bold hover:text-[#4db5e6] transition-colors"
        >
          Sign up
        </button>
      </p>
    </AuthLayout>
  );
}

export default Login;
