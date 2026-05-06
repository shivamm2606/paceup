import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useBodyweightHistory } from "../hooks/bodyweight/useBodyweightHistory";
import { useLogBodyweight } from "../hooks/bodyweight/useLogBodyweight";
import { useDeleteBodyweightEntry } from "../hooks/bodyweight/useDeleteBodyweightEntry";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { IBodyweightLog } from "../types/bodyweight.types";

// constants

type WeightUnit = "kg" | "lbs";
type TimeRange = "1W" | "1M" | "3M" | "6M" | "ALL";

const KG_TO_LBS = 2.20462;

const TIME_RANGES: { key: TimeRange; label: string; days: number }[] = [
  { key: "1W", label: "1W", days: 7 },
  { key: "1M", label: "1M", days: 30 },
  { key: "3M", label: "3M", days: 90 },
  { key: "6M", label: "6M", days: 180 },
  { key: "ALL", label: "All", days: Infinity },
];

// helper

function convertWeight(
  weight: number,
  from: WeightUnit,
  to: WeightUnit,
): number {
  if (from === to) return weight;
  return +(from === "kg" ? weight * KG_TO_LBS : weight / KG_TO_LBS).toFixed(1);
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

function formatFullDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function sortByDateAsc(logs: IBodyweightLog[]) {
  return [...logs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

function filterByDays(logs: IBodyweightLog[], days: number) {
  if (days === Infinity) return logs;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return logs.filter((log) => new Date(log.date) >= cutoff);
}

// main

function Bodyweight() {
  const navigate = useNavigate();
  const { data: bwData } = useBodyweightHistory(100);
  const { mutate: logBodyweight, isPending: isLogging } = useLogBodyweight();
  const { mutate: deleteEntry } = useDeleteBodyweightEntry();

  const [weightInput, setWeightInput] = useState("");
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [timeRange, setTimeRange] = useState<TimeRange>("1M");
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);

  // Data
  const entries = bwData?.entries ?? [];
  const allLogs = useMemo(() => sortByDateAsc(entries), [entries]);

  const days = TIME_RANGES.find((r) => r.key === timeRange)?.days ?? Infinity;
  const filteredLogs = useMemo(
    () => filterByDays(allLogs, days),
    [allLogs, days],
  );

  const chartData = useMemo(
    () =>
      filteredLogs.map((log) => ({
        weight: convertWeight(log.weight, log.unit, unit),
        label: formatShortDate(log.date),
        fullDate: formatFullDate(log.date),
      })),
    [filteredLogs, unit],
  );

  const weightDelta = useMemo(() => {
    if (chartData.length < 2) return null;
    return +(
      chartData[chartData.length - 1].weight - chartData[0].weight
    ).toFixed(1);
  }, [chartData]);

  const recentLogs = entries.slice(0, 20);
  const latestEntry = recentLogs[0];
  const latestWeight = latestEntry
    ? convertWeight(latestEntry.weight, latestEntry.unit, unit)
    : undefined;

  // Actions
  const handleLog = () => {
    const weight = parseFloat(weightInput);
    if (!weight || weight <= 0) return toast.error("Enter a valid weight");
    logBodyweight({ weight, unit }, { onSuccess: () => setWeightInput("") });
  };

  const handleDelete = (id: string) => {
    if (deletingEntryId === id) {
      deleteEntry(id, { onSuccess: () => setDeletingEntryId(null) });
    } else {
      setDeletingEntryId(id);
    }
  };

  return (
    <div className="bg-[#0b0b10] bg-[radial-gradient(140%_90%_at_50%_0%,_rgba(70,80,120,0.16),_rgba(11,11,16,0)_55%),linear-gradient(180deg,_rgba(12,12,18,1)_0%,_rgba(10,10,16,1)_100%)] text-[#f4f4f6] min-h-screen pb-[82px]">
      {/* Header */}
      <div className="px-5 pt-[56px] pb-2">
        <div className="flex items-center gap-3 mb-1.5">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-[10px] bg-[#13131a] border border-[#1e1e28] flex items-center justify-center text-[#8b8b9a] hover:text-[#f0f0f5] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div>
            <p className="text-[11px] font-bold text-[#44445a] tracking-[0.1em] uppercase">
              Tracking
            </p>
            <h1 className="text-[26px] font-black text-[#f0f0f5] tracking-[-0.04em] leading-[1.1] m-0">
              Bodyweight
            </h1>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-5 pt-3">
        {/* Current Weight Hero */}
        <HeroCard
          latestWeight={latestWeight}
          unit={unit}
          weightDelta={weightDelta}
        />

        {/* Chart */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <SectionLabel>Trend</SectionLabel>
            <SegmentedControl
              options={TIME_RANGES.map((r) => ({ key: r.key, label: r.label }))}
              selected={timeRange}
              onChange={(key) => setTimeRange(key as TimeRange)}
            />
          </div>
          <WeightChart chartData={chartData} unit={unit} />
        </div>

        {/* Log Input */}
        <div>
          <SectionLabel>Log Entry</SectionLabel>

          <div className="mb-3">
            <SegmentedControl
              options={[
                { key: "kg", label: "kg" },
                { key: "lbs", label: "lbs" },
              ]}
              selected={unit}
              onChange={(key) => setUnit(key as WeightUnit)}
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="number"
                inputMode="decimal"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder={`Enter weight in ${unit}`}
                className="w-full bg-[#13131a] border border-[#2a2a38] rounded-[12px] px-4 py-[12px] text-[14px] text-[#f0f0f5] placeholder-[#44445a] outline-none focus:border-[#4a4a5a] transition-colors pr-12"
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
        </div>

        {/* History */}
        <div>
          <SectionLabel>History</SectionLabel>
          <HistoryList
            logs={recentLogs}
            deletingId={deletingEntryId}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-semibold text-[#8b8b9a] mb-[10px] tracking-[0.04em]">
      {children}
    </p>
  );
}

function SegmentedControl({
  options,
  selected,
  onChange,
}: {
  options: { key: string; label: string }[];
  selected: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="inline-flex bg-[#13131a] border border-[#1e1e28] rounded-[10px] p-[3px]">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`px-3 py-[5px] rounded-[7px] text-[11px] font-extrabold tracking-[0.02em] transition-all duration-150 ${
            selected === opt.key
              ? "bg-[#1e1e28] text-[#f0f0f5] shadow-sm"
              : "text-[#55556a] hover:text-[#8b8b9a]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function HeroCard({
  latestWeight,
  unit,
  weightDelta,
}: {
  latestWeight?: number;
  unit: string;
  weightDelta: number | null;
}) {
  const deltaColor = !weightDelta
    ? ""
    : weightDelta > 0
      ? "bg-[rgba(239,68,68,0.08)] text-[#ef4444]"
      : weightDelta < 0
        ? "bg-[rgba(74,222,128,0.08)] text-[#4ade80]"
        : "bg-[rgba(139,139,154,0.08)] text-[#8b8b9a]";

  return (
    <div className="relative bg-[#121216] border border-[#1a1a20] rounded-[18px] p-5 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_rgba(74,222,128,0.04)_0%,_transparent_60%)] pointer-events-none" />
      <div className="relative flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold text-[#55556a] tracking-[0.06em] uppercase mb-2">
            Current Weight
          </p>
          <div className="flex items-baseline gap-1.5">
            <p className="text-[36px] font-black text-[#f0f0f5] tabular-nums leading-none">
              {latestWeight ?? "—"}
            </p>
            {latestWeight && (
              <span className="text-[14px] font-semibold text-[#55556a]">
                {unit}
              </span>
            )}
          </div>
        </div>
        {weightDelta !== null && (
          <div
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] ${deltaColor}`}
          >
            <DeltaArrow delta={weightDelta} />
            <span className="text-[12px] font-extrabold tabular-nums">
              {weightDelta > 0 ? "+" : ""}
              {weightDelta} {unit}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function DeltaArrow({ delta }: { delta: number }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      {delta > 0 ? (
        <path d="M5 2l3.5 5H1.5L5 2z" fill="currentColor" />
      ) : delta < 0 ? (
        <path d="M5 8L1.5 3h7L5 8z" fill="currentColor" />
      ) : (
        <path
          d="M1 5h8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

function WeightChart({ chartData, unit }: { chartData: any[]; unit: string }) {
  if (chartData.length < 2) {
    return (
      <div className="bg-[#121216] border border-[#1a1a20] rounded-[16px] p-4">
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-[13px] text-[#44445a]">
            Need at least 2 entries to show a trend
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121216] border border-[#1a1a20] rounded-[16px] p-4 overflow-hidden">
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
          >
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ade80" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1a1a24"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#55556a", fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={30}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#55556a", fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              domain={["dataMin - 1", "dataMax + 1"]}
              tickCount={5}
            />
            <Tooltip
              content={<ChartTooltip displayUnit={unit} />}
              trigger="click"
            />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="#4ade80"
              strokeWidth={2}
              fill="url(#weightGradient)"
              dot={{
                r: 3,
                fill: "#4ade80",
                stroke: "#121216",
                strokeWidth: 1.5,
              }}
              activeDot={{
                r: 6,
                stroke: "#4ade80",
                strokeWidth: 2,
                fill: "#121216",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, displayUnit }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-[#1a1a24] border border-[#24242e] rounded-[10px] px-3 py-2 shadow-xl">
      <p className="text-[11px] font-semibold text-[#8b8b9a] mb-0.5">
        {data.fullDate}
      </p>
      <p className="text-[16px] font-extrabold text-[#f0f0f5] tabular-nums">
        {data.weight}
        <span className="text-[11px] font-semibold text-[#55556a] ml-1">
          {displayUnit}
        </span>
      </p>
    </div>
  );
}

function HistoryList({
  logs,
  deletingId,
  onDelete,
}: {
  logs: IBodyweightLog[];
  deletingId: string | null;
  onDelete: (id: string) => void;
}) {
  if (logs.length === 0) {
    return (
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
          No entries yet — log your first weigh-in above
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#121216] border border-[#1a1a20] rounded-[14px] overflow-hidden">
      {logs.map((log, i) => {
        const isConfirming = deletingId === log._id;
        return (
          <div
            key={log._id}
            className={`flex items-center justify-between px-4 py-[12px] ${
              i < logs.length - 1 ? "border-b border-[#1a1a20]" : ""
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
                {formatFullDate(log.date)}
              </p>
            </div>
            <button
              onClick={() => onDelete(log._id)}
              className={`text-[11px] font-bold px-2.5 py-[5px] rounded-[8px] transition-all duration-150 ${
                isConfirming
                  ? "bg-[rgba(239,68,68,0.1)] text-[#ef4444] border border-[rgba(239,68,68,0.2)]"
                  : "text-[#44445a] hover:text-[#8b8b9a]"
              }`}
            >
              {isConfirming ? "Confirm?" : "Delete"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default Bodyweight;
