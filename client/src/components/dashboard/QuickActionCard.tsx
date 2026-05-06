interface QuickActionCardProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export function QuickActionCard({
  icon,
  label,
  onClick,
}: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-[#121216] border border-[#1a1a20] rounded-[16px] p-4 min-h-[108px] flex flex-col justify-between text-left transition-all duration-150 active:scale-[0.97]"
    >
      <div className="flex items-start justify-between">
        <div className="w-8 h-8 rounded-[9px] bg-[#1a1a20] border border-[#1f1f26] flex items-center justify-center">
          {icon}
        </div>
        <div className="w-6 h-6 rounded-[7px] bg-[#1a1a20] flex items-center justify-center">
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 7h8M7 3l4 4-4 4"
              stroke="#8b8b9a"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <p className="text-[13px] font-extrabold tracking-[-0.01em]">{label}</p>
    </button>
  );
}
