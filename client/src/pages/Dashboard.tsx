import { useBodyweightLog } from "../hooks/bodyweight/useBodyweightLog";
import { useCurrentUser } from "../hooks/user/useCurrentUser";
import { useWorkoutSessions } from "../hooks/sessions/useWorkoutSessions";
import { getGreeting } from "../utils/getGreeting";
import { useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect, useRef } from "react";
import { StartWorkoutModal } from "../components/StartWorkoutModal";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { WorkoutCTA } from "../components/dashboard/WorkoutCTA";
import { StatCard } from "../components/dashboard/StatCard";
import { QuickActionCard } from "../components/dashboard/QuickActionCard";
import { LastSessionCard } from "../components/dashboard/LastSessionCard";

const QUOTES = [
  { text: "ready to lift?" },
  { text: "go harder than yesterday." },
  { text: "don't skip today." },
  { text: "push one more rep." },
  { text: "show up and do the work." },
  { text: "you've got more in you." },
  { text: "earn your rest today." },
  { text: "stay consistent." },
  { text: "keep the streak alive." },
  { text: "no excuses today." },
  { text: "lock in and train." },
  { text: "make this session count." },
];

function getDailyQuote() {
  const todayKey = new Date().toDateString();

  const stored = localStorage.getItem("dailyQuote");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.date === todayKey) return parsed.quote;
    } catch {
      localStorage.removeItem("dailyQuote");
    }
  }

  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  localStorage.setItem(
    "dailyQuote",
    JSON.stringify({ date: todayKey, quote: randomQuote }),
  );

  return randomQuote;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-semibold text-[#8b8b9a] mb-[10px] tracking-[0.04em]">
      {children}
    </p>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { data: sessions, isFetched } = useWorkoutSessions();
  const { data: bwLogs } = useBodyweightLog();

  const latestBW = bwLogs?.entries?.[0];

  const [dailyQuote] = useState(getDailyQuote);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);

  const allSessions = useMemo(() => sessions?.sessions ?? [], [sessions]);

  // auto-resume active workout
  const hasCheckedResume = useRef(false);
  useEffect(() => {
    if (!isFetched || hasCheckedResume.current) return;
    hasCheckedResume.current = true;
    const active = allSessions.find((s) => s.status === "active");
    if (active) navigate(`/workout/${active._id}`, { replace: true });
  }, [allSessions, isFetched, navigate]);

  const lastSession = useMemo(
    () =>
      [...allSessions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )[0] ?? null,
    [allSessions],
  );

  const { weeklyCount, diff } = useMemo(() => {
    const now = new Date();
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
    const oneWeekAgo = new Date(now.getTime() - ONE_WEEK);

    const weeklySessions = allSessions.filter(
      (s) => new Date(s.date) >= oneWeekAgo,
    );

    const prevWeekSessions = allSessions.filter((s) => {
      const d = new Date(s.date);
      return d < oneWeekAgo && d >= new Date(oneWeekAgo.getTime() - ONE_WEEK);
    });

    const weeklyCount = weeklySessions.length;
    const prevWeekCount = prevWeekSessions.length;
    const diff = weeklyCount - prevWeekCount;

    return { weeklyCount, diff };
  }, [allSessions]);

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  const streak = useMemo(() => {
    if (allSessions.length === 0) return 0;
    const days = new Set(
      allSessions.map((s) => new Date(s.date).toDateString()),
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let count = 0;
    let i = days.has(today.toDateString()) ? 0 : 1;
    while (true) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (!days.has(d.toDateString())) break;
      count++;
      i++;
    }
    return count;
  }, [allSessions]);

  const bwLoggedToday = useMemo(() => {
    if (!latestBW) return false;
    const today = new Date().toDateString();
    return new Date(latestBW.date).toDateString() === today;
  }, [latestBW]);

  const bwSubtitle = latestBW
    ? bwLoggedToday
      ? "logged today"
      : `logged ${new Date(latestBW.date).toLocaleDateString()}`
    : "no log yet";

  return (
    <div
      className="bg-[#0b0b10] bg-[radial-gradient(140%_90%_at_50%_0%,_rgba(70,80,120,0.16),_rgba(11,11,16,0)_55%),linear-gradient(180deg,_rgba(12,12,18,1)_0%,_rgba(10,10,16,1)_100%)] text-[#f4f4f6] min-h-screen"
      style={{ paddingBottom: "calc(82px + env(safe-area-inset-bottom))" }}
    >
      <div style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <DashboardHeader
          greeting={getGreeting()}
          userName={user?.name ?? "-"}
          date={formattedDate}
          quote={dailyQuote.text}
          streak={streak}
        />
      </div>

      <div className="space-y-5 px-4 py-[18px]">
        <div>
          <SectionLabel>Today</SectionLabel>
          <WorkoutCTA onStart={() => setShowWorkoutModal(true)} />
        </div>

        <div>
          <SectionLabel>This Week</SectionLabel>
          <div className="grid grid-cols-2 gap-[10px]">
            <StatCard
              label="Sessions"
              value={weeklyCount}
              unit="/ wk"
              subtitle={`${diff >= 0 ? `+${diff}` : diff} from last week`}
              subtitleColor={diff >= 0 ? "text-[#3ddc97]" : "text-[#ef4444]"}
            />
            <StatCard
              label="Bodyweight"
              value={latestBW?.weight ?? "-"}
              unit={latestBW?.unit ?? "kg"}
              subtitle={bwSubtitle}
            />
          </div>
        </div>

        <div>
          <SectionLabel>Quick Actions</SectionLabel>
          <div className="grid grid-cols-2 gap-[10px]">
            <QuickActionCard
              label="View Templates"
              onClick={() => navigate("/templates")}
              icon={
                <svg width="15" height="15" viewBox="0 0 22 22" fill="none">
                  <rect
                    x="3"
                    y="3"
                    width="7"
                    height="7"
                    rx="1.5"
                    stroke="#8b8b9a"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="12"
                    y="3"
                    width="7"
                    height="7"
                    rx="1.5"
                    stroke="#8b8b9a"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="3"
                    y="12"
                    width="7"
                    height="7"
                    rx="1.5"
                    stroke="#8b8b9a"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="12"
                    y="12"
                    width="7"
                    height="7"
                    rx="1.5"
                    stroke="#8b8b9a"
                    strokeWidth="1.5"
                  />
                </svg>
              }
            />
            <QuickActionCard
              label="Log Bodyweight"
              onClick={() => navigate("/bodyweight")}
              icon={
                <svg width="15" height="15" viewBox="0 0 22 22" fill="none">
                  <rect
                    x="3"
                    y="8"
                    width="16"
                    height="11"
                    rx="2"
                    stroke="#8b8b9a"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 8C8 5.79 9.79 4 12 4s4 1.79 4 4"
                    stroke="#8b8b9a"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 12v2"
                    stroke="#8b8b9a"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="14.5" r="0.75" fill="#8b8b9a" />
                </svg>
              }
            />
          </div>
        </div>

        <div>
          <SectionLabel>Last Session</SectionLabel>
          <LastSessionCard session={lastSession} />
        </div>
      </div>

      {showWorkoutModal && (
        <StartWorkoutModal onClose={() => setShowWorkoutModal(false)} />
      )}
    </div>
  );
}

export default Dashboard;
