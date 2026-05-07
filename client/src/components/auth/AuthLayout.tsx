import { useNavigate } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
  onBack?: () => void;
  hideBack?: boolean;
}

export function AuthLayout({ children, onBack, hideBack }: AuthLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100svh] bg-[#08080c] text-[#f0f0f5] px-5 relative overflow-hidden">
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

      <div
        className="w-full max-w-[400px] mx-auto relative z-10"
        style={{
          paddingTop: "calc(16px + env(safe-area-inset-top))",
          paddingBottom: "calc(40px + env(safe-area-inset-bottom))",
        }}
      >
        {!hideBack && (
          <button
            onClick={onBack ?? (() => navigate(-1))}
            className="mt-2 mb-8 flex items-center gap-2 text-[#44445a] hover:text-[#f0f0f5] transition-colors duration-150 group"
          >
            <div className="w-8 h-8 rounded-[10px] bg-[#111116] border border-[#1e1e28] flex items-center justify-center group-hover:border-[#2a2a38] transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M9 2L4 7l5 5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-[13px] font-semibold">Back</span>
          </button>
        )}
        {hideBack && <div className="mt-2 mb-8 h-8" />}

        {children}
      </div>
    </div>
  );
}
