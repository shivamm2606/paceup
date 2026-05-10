import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../utils/getErrorMessage";
import { useVerifyOtp } from "../hooks/auth/useVerifyOtp";
import { useResendOtp } from "../hooks/auth/useResendOtp";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthHeader } from "../components/auth/AuthHeader";
import { AuthAlert } from "../components/auth/AuthAlert";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 59;

const MailCheckIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <rect
      x="3"
      y="3"
      width="20"
      height="16"
      rx="3"
      stroke="#3da1d4"
      strokeWidth="1.8"
    />
    <path
      d="M3 9l10 7 10-7"
      stroke="#3da1d4"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M17 17l2 2 4-4"
      stroke="#3da1d4"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function VerifyOtp() {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(RESEND_COOLDOWN);
  const [resendSuccess, setResendSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hasSubmitted = useRef(false);

  const location = useLocation();
  const email: string | undefined = location.state?.email;
  const navigate = useNavigate();

  const { mutate: verifyOtp, error, isPending } = useVerifyOtp();
  const { mutate: resendOtp, isPending: isResending } = useResendOtp();

  useEffect(() => {
    if (!email) navigate("/register");
  }, [email, navigate]);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const otpValue = otp.join("");
  const isComplete = otp.every((d) => d !== "");

  const handleSubmit = useCallback(() => {
    if (!email || !isComplete || isPending) return;
    setResendSuccess(false);
    verifyOtp({ email, otp: otpValue });
  }, [email, isComplete, isPending, otpValue, verifyOtp]);

  useEffect(() => {
    if (isComplete && !isPending && !hasSubmitted.current) {
      hasSubmitted.current = true;
      const timeout = setTimeout(() => handleSubmit(), 0);
      return () => clearTimeout(timeout);
    }
  }, [isComplete, isPending, handleSubmit]);

  useEffect(() => {
    if (!isComplete) hasSubmitted.current = false;
  }, [isComplete]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, OTP_LENGTH - index);
      const newOtp = [...otp];
      for (let i = 0; i < digits.length; i++) {
        newOtp[index + i] = digits[i];
      }
      setOtp(newOtp);
      const nextFocus = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0)
      inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1)
      inputRefs.current[index + 1]?.focus();
  };

  const handleResend = () => {
    if (timer > 0 || isResending || !email) return;
    setResendSuccess(false);
    resendOtp(
      { email },
      {
        onSuccess: () => {
          setOtp(Array(OTP_LENGTH).fill(""));
          setTimer(RESEND_COOLDOWN);
          setResendSuccess(true);
          inputRefs.current[0]?.focus();
          setTimeout(() => setResendSuccess(false), 5000);
        },
      },
    );
  };

  const maskedEmail = email
    ? email.replace(
        /(.{2})(.*)(@.*)/,
        (_, a, b, c) => a + "*".repeat(Math.max(0, b.length)) + c,
      )
    : "";

  return (
    <AuthLayout>
      <AuthHeader
        icon={<MailCheckIcon />}
        subtitle="Verify email"
        title={
          <>
            Check your
            <br />
            <span className="text-[#3da1d4]">inbox.</span>
          </>
        }
        description={
          <>
            We sent a 6-digit code to{" "}
            <span className="text-[#f0f0f5] font-semibold">{maskedEmail}</span>
          </>
        }
      />

      {error && <AuthAlert variant="error" message={getErrorMessage(error)} />}
      {resendSuccess && (
        <AuthAlert
          variant="success"
          message="New code sent - check your inbox."
        />
      )}

      <div className="flex justify-center gap-2.5 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            id={`otp-${index}`}
            type="text"
            inputMode="numeric"
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={(e) => e.target.select()}
            maxLength={6}
            className={`
              w-[48px] h-[58px] rounded-[14px] border text-center text-[22px] font-black
              bg-[#111116] text-[#f0f0f5]
              focus:outline-none transition-all duration-150
              ${
                digit
                  ? "border-[rgba(71,184,255,0.4)] bg-[rgba(71,184,255,0.05)]"
                  : "border-[#1e1e28] focus:border-[rgba(71,184,255,0.4)] focus:bg-[#12121a]"
              }
            `}
            placeholder="·"
            style={{ caretColor: "#3da1d4" }}
          />
        ))}
      </div>

      <div className="text-center mb-6">
        {timer > 0 ? (
          <p className="text-[13px] text-[#44445a]">
            Resend code in{" "}
            <span className="text-[#3da1d4] font-bold tabular-nums">
              0:{String(timer).padStart(2, "0")}
            </span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-[13px] font-bold text-[#3da1d4] hover:text-[#4db5e6] disabled:text-[#2a4a6a] transition-colors"
          >
            {isResending ? "Sending..." : "Resend code"}
          </button>
        )}
      </div>

      {isPending && (
        <div className="flex items-center justify-center gap-2 py-3">
          <svg
            className="animate-spin"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="10" stroke="#2a4a6a" strokeWidth="2.5" />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="#3da1d4"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[13px] font-bold text-[#3da1d4]">
            Verifying...
          </span>
        </div>
      )}

      <p className="text-[13px] text-[#44445a] text-center mt-6">
        Already verified?{" "}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-[#3da1d4] font-bold hover:text-[#4db5e6] transition-colors"
        >
          Sign in
        </button>
      </p>
    </AuthLayout>
  );
}

export default VerifyOtp;
