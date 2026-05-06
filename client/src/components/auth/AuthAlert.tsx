interface AuthAlertProps {
  variant: "error" | "success";
  message: string;
}

const config = {
  error: {
    bg: "bg-[rgba(239,68,68,0.08)]",
    border: "border-[rgba(239,68,68,0.25)]",
    text: "text-[#ef4444]",
    icon: (
      <>
        <circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="1.5" />
        <path d="M8 5v3.5M8 10.5v.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
  },
  success: {
    bg: "bg-[rgba(71,184,255,0.08)]",
    border: "border-[rgba(71,184,255,0.2)]",
    text: "text-[#3da1d4]",
    icon: (
      <>
        <circle cx="8" cy="8" r="7" stroke="#3da1d4" strokeWidth="1.5" />
        <path d="M5 8l2 2 4-4" stroke="#3da1d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
};

export function AuthAlert({ variant, message }: AuthAlertProps) {
  const c = config[variant];

  return (
    <div className={`flex items-start gap-3 ${c.bg} border ${c.border} rounded-[14px] px-4 py-3 mb-5`}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="shrink-0 mt-[1px]"
      >
        {c.icon}
      </svg>
      <p className={`text-[12px] ${c.text} leading-relaxed`}>
        {message}
      </p>
    </div>
  );
}
