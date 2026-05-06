interface AuthSubmitButtonProps {
  onClick: () => void;
  disabled: boolean;
  isPending: boolean;
  label: string;
  pendingLabel: string;
}

export function AuthSubmitButton({
  onClick,
  disabled,
  isPending,
  label,
  pendingLabel,
}: AuthSubmitButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full relative overflow-hidden bg-[#3a9fe0] hover:bg-[#4daef0] disabled:bg-[#0f1e2e] disabled:text-[#2a4a6a] text-white font-black text-[15px] tracking-[-0.01em] py-[14px] rounded-[16px] transition-all duration-200 disabled:cursor-not-allowed"
      style={{
        boxShadow: disabled ? "none" : "0 0 24px rgba(71,184,255,0.15)",
      }}
    >
      {isPending ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2.5"
              opacity="0.3"
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          {pendingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}
