interface AuthHeaderProps {
  icon: React.ReactNode;
  subtitle: string;
  title: React.ReactNode;
  description?: React.ReactNode;
}

export function AuthHeader({
  icon,
  subtitle,
  title,
  description,
}: AuthHeaderProps) {
  return (
    <div className="mb-8">
      <div className="w-[56px] h-[56px] rounded-[18px] bg-[rgba(71,184,255,0.08)] border border-[rgba(71,184,255,0.18)] flex items-center justify-center mb-6">
        {icon}
      </div>

      <p className="text-[11px] font-bold text-[#44445a] tracking-[0.12em] uppercase mb-2">
        {subtitle}
      </p>
      <h1 className="text-[34px] font-black tracking-[-0.04em] leading-[1.05]">
        {title}
      </h1>
      {description && (
        <p className="text-[13px] text-[#6b6b80] mt-3 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
