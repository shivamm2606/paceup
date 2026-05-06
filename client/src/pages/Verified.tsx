import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const REDIRECT_SECONDS = 4;

function Verified() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    if (countdown <= 0) {
      navigate("/login", { replace: true });
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown, navigate]);

  const progress = ((REDIRECT_SECONDS - countdown) / REDIRECT_SECONDS) * 100;

  return (
    <div className="min-h-[100svh] bg-[#08080c] text-[#f0f0f5] px-5 relative overflow-hidden flex items-center justify-center">
      {/* Background effects — same as auth pages */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[500px] h-[280px] rounded-full bg-[rgba(71,184,255,0.06)] blur-[90px]" />
        <div className="absolute bottom-[-40px] right-[-60px] w-[280px] h-[280px] rounded-full bg-[rgba(71,184,255,0.04)] blur-[80px]" />
      </div>
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-[340px]">
        {/* Small icon */}
        <div
          className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center mb-5"
          style={{
            background: "rgba(71, 184, 255, 0.08)",
            border: "1px solid rgba(71, 184, 255, 0.15)",
            animation: "scaleIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            style={{ animation: "checkPop 0.35s ease-out 0.4s both" }}
          >
            <path
              d="M5 13l4 4L19 7"
              stroke="#47b8ff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Text */}
        <div style={{ animation: "fadeUp 0.4s ease-out 0.3s both" }}>
          <p className="text-[11px] font-bold text-[#44445a] tracking-[0.12em] uppercase mb-2">
            Verification complete
          </p>
          <h1 className="text-[26px] font-black text-[#f0f0f5] tracking-[-0.04em] leading-[1.15] mb-2">
            You're all <span className="text-[#47b8ff]">set.</span>
          </h1>
          <p className="text-[13px] text-[#6b6b80] leading-relaxed">
            Your email has been verified. Sign in to get started.
          </p>
        </div>

        {/* Button */}
        <div
          className="w-full mt-7"
          style={{ animation: "fadeUp 0.4s ease-out 0.55s both" }}
        >
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="w-full py-[14px] rounded-[16px] bg-[#3a9fe0] hover:bg-[#4daef0] text-white font-black text-[15px] tracking-[-0.01em] transition-all duration-200 active:scale-[0.98]"
            style={{ boxShadow: "0 0 24px rgba(71,184,255,0.15)" }}
          >
            Continue to Login
          </button>
        </div>

        {/* Progress */}
        <div
          className="w-full mt-4"
          style={{ animation: "fadeUp 0.4s ease-out 0.7s both" }}
        >
          <div className="w-full h-[2px] bg-[#1a1a24] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#47b8ff]/30 rounded-full"
              style={{ width: `${progress}%`, transition: "width 1s linear" }}
            />
          </div>
          <p className="text-[11px] text-[#44445a] mt-2">
            Redirecting in{" "}
            <span className="text-[#47b8ff]/50 font-bold tabular-nums">
              {countdown}s
            </span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.7); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes checkPop {
          0% { opacity: 0; transform: scale(0.5); }
          70% { transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Verified;
