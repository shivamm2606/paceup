import { useState } from "react";

interface Props {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onClose: () => void;
}

export function SheetWrapper({ title, subtitle, children, onClose }: Props) {
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 250);
  };

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-[60] flex flex-col justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-250 ${closing ? "opacity-0" : "opacity-100"}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="sheet-panel w-full max-w-[520px] mx-auto bg-[#0d0d12] border-t border-l border-r border-[#1e1e28] rounded-t-[28px] px-5 pb-[90px] max-h-[90vh] flex flex-col"
        style={{
          animation: closing
            ? "sheetDown 0.25s ease-in forwards"
            : "sheetUp 0.34s cubic-bezier(0.22, 1.08, 0.36, 1)",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-[14px] pb-2 shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#2a2a36]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-1.5 pt-2.5 pb-5 shrink-0">
          <div>
            <p className="text-[11px] font-bold text-[#44445a] tracking-[0.1em] uppercase mb-1.5">
              {subtitle}
            </p>
            <h2 className="text-[24px] font-black text-[#f0f0f5] tracking-[-0.04em] leading-[1.1] m-0">
              {title}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-[12px] bg-[#13131a] border border-[#1e1e28] flex items-center justify-center text-[#8b8b9a] hover:text-[#f0f0f5] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

// form component
export function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-[#55556a] mb-1.5 tracking-[0.04em]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#13131a] border border-[#1e1e28] rounded-[10px] px-3 py-[9px] text-[13px] text-[#f0f0f5] placeholder-[#33334a] outline-none focus:border-[#2a2a38] transition-colors"
      />
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-[#55556a] mb-1.5 tracking-[0.04em]">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#13131a] border border-[#1e1e28] rounded-[10px] px-3 py-[9px] text-[13px] text-[#f0f0f5] outline-none focus:border-[#2a2a38] transition-colors appearance-none"
      >
        <option value="">Select…</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold text-[#44445a] tracking-[0.08em] uppercase pt-2">
      {children}
    </p>
  );
}

export function SaveButton({
  onClick,
  disabled,
  label,
  pendingLabel,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  pendingLabel: string;
}) {
  return (
    <div className="shrink-0 pt-5 pb-2">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full py-[15px] rounded-[14px] text-[15px] font-extrabold tracking-tight transition-all duration-150 ${
          disabled
            ? "bg-[#7b9dff]/40 text-[#0b0b10]/60 cursor-not-allowed"
            : "bg-[#7b9dff] text-[#0b0b10] hover:bg-[#8daeff] active:scale-[0.98]"
        }`}
      >
        {disabled ? pendingLabel : label}
      </button>
    </div>
  );
}
