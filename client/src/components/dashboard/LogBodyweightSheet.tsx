import { useState } from "react";
import { useBodyweightLog } from "../../hooks/bodyweight/useBodyweightLog";
import { useLogBodyweight } from "../../hooks/bodyweight/useLogBodyweight";
import { useDeleteBodyweightEntry } from "../../hooks/bodyweight/useDeleteBodyweightEntry";
import { toast } from "sonner";

type WeightUnit = "kg" | "lbs";

interface Props {
  onClose: () => void;
}

export function LogBodyweightSheet({ onClose }: Props) {
  const { data: bodyweightData } = useBodyweightLog();
  const { mutate: logBodyweight, isPending: isLogging } = useLogBodyweight();
  const { mutate: deleteEntry } = useDeleteBodyweightEntry();

  const [closing, setClosing] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const recentLogs = (bodyweightData?.entries ?? []).slice(0, 7);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 250);
  };

  const handleLog = () => {
    const weight = parseFloat(weightInput);
    if (!weight || weight <= 0) return toast.error("Enter a valid weight");
    logBodyweight({ weight, unit }, { onSuccess: () => setWeightInput("") });
  };

  const handleDelete = (id: string) => {
    if (deletingId === id) {
      deleteEntry(id, { onSuccess: () => setDeletingId(null) });
    } else {
      setDeletingId(id);
    }
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
              Tracking
            </p>
            <h2 className="text-[24px] font-black text-[#f0f0f5] tracking-[-0.04em] leading-[1.1] m-0">
              Log Bodyweight
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

        {/* Unit Toggle */}
        <div className="flex px-1.5 mb-3 shrink-0">
          <div className="inline-flex bg-[#13131a] border border-[#1e1e28] rounded-[10px] p-[3px]">
            {(["kg", "lbs"] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`px-4 py-[6px] rounded-[8px] text-[12px] font-extrabold tracking-[0.02em] transition-all duration-150 ${
                  unit === u
                    ? "bg-[#1e1e28] text-[#f0f0f5] shadow-sm"
                    : "text-[#55556a] hover:text-[#8b8b9a]"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Input Row */}
        <div className="flex gap-2 px-1.5 shrink-0">
          <div className="flex-1 relative">
            <input
              type="number"
              inputMode="decimal"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder={`Enter weight in ${unit}`}
              autoFocus
              className="w-full bg-[#13131a] border border-[#1e1e28] rounded-[12px] px-4 py-[12px] text-[14px] text-[#f0f0f5] placeholder-[#44445a] outline-none focus:border-[#2a2a38] transition-colors pr-12"
              onKeyDown={(e) => e.key === "Enter" && handleLog()}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#44445a]">
              {unit}
            </span>
          </div>
          <button
            onClick={handleLog}
            disabled={isLogging || !weightInput}
            className={`px-6 py-[12px] rounded-[12px] text-[14px] font-extrabold tracking-tight transition-all duration-150 ${
              isLogging || !weightInput
                ? "bg-[#1a1a24] text-[#44445a] cursor-not-allowed"
                : "bg-[#4ade80] text-[#0b0b10] hover:bg-[#5ae88d] active:scale-[0.96]"
            }`}
          >
            {isLogging ? "…" : "Log"}
          </button>
        </div>

        {/* Recent Logs */}
        <div className="overflow-y-auto flex-1 mt-5 -mx-1.5 px-1.5">
          <p className="text-[11px] font-bold text-[#44445a] tracking-[0.08em] uppercase mb-2.5">
            Recent Entries
          </p>

          {recentLogs.length === 0 ? (
            <div className="bg-[#121216] border border-[#1a1a20] rounded-[14px] p-6 flex flex-col items-center justify-center gap-2">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                className="text-[#2a2a38]"
              >
                <path
                  d="M12 2v20M2 12h20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <p className="text-[13px] text-[#44445a]">
                No entries yet - log your first weigh-in above
              </p>
            </div>
          ) : (
            <div className="bg-[#121216] border border-[#1a1a20] rounded-[14px] overflow-hidden">
              {recentLogs.map((log, i) => (
                <div
                  key={log._id}
                  className={`flex items-center justify-between px-4 py-[12px] ${
                    i < recentLogs.length - 1 ? "border-b border-[#1a1a20]" : ""
                  }`}
                >
                  <div>
                    <p className="text-[14px] font-bold text-[#f0f0f5] tabular-nums">
                      {log.weight}{" "}
                      <span className="text-[11px] font-semibold text-[#6b6b80]">
                        {log.unit}
                      </span>
                    </p>
                    <p className="text-[11px] text-[#44445a] mt-0.5">
                      {new Date(log.date).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(log._id)}
                    className={`text-[11px] font-bold px-2.5 py-[5px] rounded-[8px] transition-all duration-150 ${
                      deletingId === log._id
                        ? "bg-[rgba(239,68,68,0.1)] text-[#ef4444] border border-[rgba(239,68,68,0.2)]"
                        : "text-[#44445a] hover:text-[#8b8b9a]"
                    }`}
                  >
                    {deletingId === log._id ? "Confirm?" : "Delete"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
