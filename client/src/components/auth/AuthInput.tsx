interface AuthInputProps {
  icon: React.ReactNode;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rightAction?: React.ReactNode;
  prefix?: React.ReactNode;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export function AuthInput({
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
  rightAction,
  prefix,
  className = "",
  onKeyDown,
  onFocus,
  onBlur,
}: AuthInputProps) {
  return (
    <div className="relative">
      <div className="absolute left-[14px] top-1/2 -translate-y-1/2 pointer-events-none">
        {icon}
      </div>
      {prefix && (
        <span className="absolute left-[40px] top-1/2 -translate-y-1/2 text-[#2e2e3a] text-[14px] font-mono pointer-events-none select-none">
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full bg-[#111116] border border-[#1e1e28] text-[#f0f0f5] ${prefix ? "pl-[58px]" : "pl-[40px]"} ${rightAction ? "pr-[44px]" : "pr-[14px]"} py-[13px] rounded-[14px] text-[14px] placeholder-[#2e2e3a] focus:outline-none focus:border-[rgba(71,184,255,0.45)] focus:bg-[#12121a] transition-all duration-150 ${className}`}
      />
      {rightAction && (
        <div className="absolute right-[14px] top-1/2 -translate-y-1/2">
          {rightAction}
        </div>
      )}
    </div>
  );
}
