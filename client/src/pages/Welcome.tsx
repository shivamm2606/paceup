import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function useInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    const installedHandler = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setPrompt(null);
  };

  return { canInstall: !!prompt, install, installed };
}

function isStandalonePwa() {
  const iosStandalone =
    "standalone" in window.navigator &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true;

  return (
    window.matchMedia("(display-mode: standalone)").matches || iosStandalone
  );
}

function useStandalonePwa() {
  const [standalone, setStandalone] = useState(isStandalonePwa);

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const update = () => setStandalone(isStandalonePwa());

    media.addEventListener("change", update);
    window.addEventListener("appinstalled", update);

    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("appinstalled", update);
    };
  }, []);

  return standalone;
}

function DesktopView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { canInstall, install, installed } = useInstallPrompt();
  const appUrl = window.location.origin;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, appUrl, {
        width: 140,
        margin: 2,
        color: { dark: "#111113", light: "#ffffff" },
      });
    }
  }, [appUrl]);

  const features = [
    {
      icon: "🏋️",
      title: "Workout Tracking",
      desc: "Log every set, rep and weight. Build a complete training history.",
    },
    {
      icon: "📋",
      title: "Smart Templates",
      desc: "Create reusable workout templates for Push, Pull, Legs and more.",
    },
    {
      icon: "⚖️",
      title: "Bodyweight Log",
      desc: "Track your weight over time and visualise your progress curve.",
    },
    {
      icon: "🔥",
      title: "Calorie Goals",
      desc: "Auto-calculated TDEE targets based on your stats and activity.",
    },
  ];

  const upcoming = [
    {
      icon: "📊",
      title: "Progress Charts",
      desc: "Visualise strength gains with interactive graphs per exercise.",
    },
    {
      icon: "🏆",
      title: "Personal Records",
      desc: "Automatic PR detection and celebration when you hit new bests.",
    },
    {
      icon: "🥗",
      title: "Nutrition Log",
      desc: "Track meals, macros and calories - manage all your food in one place.",
    },
    {
      icon: "🤖",
      title: "AI Suggestions",
      desc: "Smart workout recommendations based on your training history.",
    },
  ];

  const installSteps = [
    {
      platform: "iPhone",
      icon: "",
      steps: [
        "Open in Safari",
        "Tap the Share button ↑",
        "Scroll down → 'Add to Home Screen'",
        "Tap 'Add' - done!",
      ],
    },
    {
      platform: "Android",
      icon: "",
      steps: [
        "Open in Chrome",
        "Tap ⋮ menu (top-right)",
        "Tap 'Add to Home screen'",
        "Tap 'Install' - done!",
      ],
    },
  ];

  return (
    <div
      id="top"
      className="min-h-screen bg-[#080809] text-white font-[DM_Sans,sans-serif] relative overflow-hidden"
    >
      {/* Grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Glow blobs */}
      <div className="fixed -top-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(71,184,255,0.07)_0%,transparent_70%)] pointer-events-none z-0" />
      <div className="fixed -bottom-[150px] -left-[150px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(71,184,255,0.05)_0%,transparent_70%)] pointer-events-none z-0" />

      <div className="relative z-[1]">
        {/* Nav */}
        <nav className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#1a1a1f] sm:px-8 lg:px-16">
          <a
            href="#top"
            className="group flex items-center gap-2.5 text-white no-underline"
            aria-label="RepUp home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-[rgba(61,161,212,0.24)] bg-[rgba(61,161,212,0.08)] shadow-[0_0_28px_rgba(61,161,212,0.08)]">
              <img
                src="/repup-icon-192.png"
                alt="RepUp Logo"
                className="w-[19px] h-[19px] object-contain"
              />
            </span>
            <span className="font-[Sora,sans-serif] text-[1.3rem] font-extrabold leading-none tracking-normal sm:text-[1.45rem]">
              Rep<span className="text-[#3da1d4]">Up</span>
            </span>
          </a>
          <a
            href="https://github.com/shivamm2606/rep-up"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-white no-underline text-sm opacity-60 transition-opacity duration-200 hover:opacity-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
        </nav>

        {/* Hero */}
        <section className="grid grid-cols-1 gap-10 items-start pt-8 px-5 pb-4 max-w-[1200px] mx-auto sm:px-8 lg:grid-cols-2 lg:gap-12 lg:px-16">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[rgba(71,184,255,0.08)] border border-[rgba(71,184,255,0.2)] rounded-full px-4 py-1.5 text-[0.78rem] text-[#3da1d4] tracking-[0.1em] uppercase mb-8 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3da1d4] animate-[pulse_2s_infinite]" />
              Progressive Web App
            </div>

            <h1 className="font-[Bebas_Neue,sans-serif]! text-[clamp(3.5rem,18vw,7rem)] leading-[0.9] mb-4 tracking-[0.02em] lg:text-[clamp(4rem,7vw,7rem)]">
              TRACK EVERY
              <br />
              <span className="text-[#3da1d4]">REP.</span>
              <br />
              GET STRONGER.
            </h1>

            <p className="text-[rgba(255,255,255,0.55)] text-[1rem] leading-[1.7] max-w-[42ch] mb-8 sm:text-[1.1rem] lg:mb-12">
              RepUp is a mobile-first gym tracker built for lifters. Log
              workouts, monitor progress, and hit your goals - one session at a
              time.
            </p>

            {/* Mobile notice + QR */}
            <div className="bg-[#111113] border border-[#222228] rounded-2xl px-5 py-5 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:px-8 sm:py-6 sm:gap-8">
              <div>
                <p className="text-[rgba(255,255,255,0.9)] font-semibold mb-1.5 text-[0.95rem]">
                  Built for mobile
                </p>
                <p className="text-[rgba(255,255,255,0.4)] text-[0.825rem] leading-[1.6] max-w-[28ch]">
                  Open on your phone or scan the QR code to install RepUp as an
                  app.
                </p>
                {canInstall && !installed && (
                  <button
                    onClick={install}
                    className="mt-4 rounded-full bg-[#3da1d4] px-5 py-2.5 text-[0.78rem] font-bold text-white shadow-[0_0_24px_rgba(71,184,255,0.18)] transition-colors duration-200 hover:bg-[#4db5e6]"
                  >
                    Install App
                  </button>
                )}
              </div>
              <div className="shrink-0 p-1.5 bg-white rounded-xl self-center sm:self-auto">
                <canvas ref={canvasRef} className="block rounded-md" />
              </div>
            </div>
          </div>

          {/* Right - phone mockup */}
          <div className="flex justify-center">
            <div className="w-[240px] h-[480px] rounded-[36px] border-2 border-[#222228] overflow-hidden relative bg-[#080809] shadow-[0_30px_60px_rgba(0,0,0,0.5),0_0_0_1px_#111113] sm:w-[260px] sm:h-[520px]">
              {/* Notch */}
              <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-[80px] h-[22px] bg-[#080809] rounded-full z-10 border-[1.5px] border-[#222228]" />
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80')`,
                }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.1)_40%,rgba(0,0,0,0.88)_100%)]" />
              <div className="absolute bottom-12 left-6 right-6">
                <p className="text-[rgba(255,255,255,0.6)] text-[0.65rem] tracking-[0.15em] uppercase mb-1 font-[DM_Sans,sans-serif]">
                  Welcome to
                </p>
                <p className="font-[Bebas_Neue,sans-serif]! text-[2.8rem] leading-none text-white mb-3">
                  Rep<span className="text-[#3da1d4]">Up.</span>
                </p>
                <div className="bg-[#3da1d4] text-white rounded-full px-5 py-2.5 text-[0.75rem] font-bold inline-flex items-center gap-1.5 font-[DM_Sans,sans-serif]">
                  Get Started →
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Install as App */}
        <section
          id="install"
          className="pt-8 px-5 pb-12 max-w-[1200px] mx-auto sm:px-8 lg:px-16 lg:pb-16"
        >
          <p className="text-[rgba(255,255,255,0.3)] text-[0.75rem] tracking-[0.2em] uppercase mb-2 font-semibold">
            Install as app
          </p>
          <p className="text-[rgba(255,255,255,0.45)] text-[0.9rem] mb-8 leading-[1.6]">
            RepUp works like a native app - no app store needed. Here's how to
            install it:
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {installSteps.map((p) => (
              <div
                key={p.platform}
                className="bg-[#111113] border border-[#222228] rounded-2xl p-5 transition-colors duration-200 hover:border-[rgba(71,184,255,0.25)] sm:p-7"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="text-2xl">{p.icon}</span>
                  <span className="font-bold text-[0.95rem] text-white">
                    {p.platform}
                  </span>
                </div>
                <ol className="m-0 pl-5 list-none">
                  {p.steps.map((step, i) => (
                    <li
                      key={i}
                      className="text-[rgba(255,255,255,0.5)] text-[0.825rem] leading-[1.7] mb-1 relative pl-1"
                    >
                      <span className="absolute -left-5 text-[#3da1d4] font-bold text-[0.75rem]">
                        {i + 1}.
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        {/* Features grid */}
        <section
          id="features"
          className="pt-8 px-5 pb-12 max-w-[1200px] mx-auto sm:px-8 lg:px-16 lg:pb-16"
        >
          <p className="text-[rgba(255,255,255,0.3)] text-[0.75rem] tracking-[0.2em] uppercase mb-8 font-semibold">
            What's inside
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-[#111113] border border-[#222228] rounded-2xl p-5 transition-all duration-200 cursor-default hover:border-[rgba(71,184,255,0.3)] hover:-translate-y-1 sm:p-7"
              >
                <span className="text-[1.75rem] block mb-4">{f.icon}</span>
                <p className="font-bold text-[0.95rem] mb-2 text-white">
                  {f.title}
                </p>
                <p className="text-[rgba(255,255,255,0.4)] text-[0.825rem] leading-[1.6]">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming features */}
        <section className="px-5 pb-12 max-w-[1200px] mx-auto sm:px-8 lg:px-16 lg:pb-16">
          <div className="inline-flex items-center gap-2 bg-[rgba(245,180,60,0.08)] border border-[rgba(245,180,60,0.2)] rounded-full px-4 py-1.5 text-[0.75rem] text-[#f5b43c] tracking-[0.15em] uppercase mb-8 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f5b43c] animate-[pulse_2s_infinite]" />
            Coming Soon
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {upcoming.map((f) => (
              <div
                key={f.title}
                className="bg-[#111113] border border-[#1a1a1f] rounded-2xl p-5 relative overflow-hidden transition-all duration-200 cursor-default hover:border-[rgba(245,180,60,0.25)] hover:-translate-y-1 sm:p-7"
              >
                <span className="text-[1.75rem] block mb-4 grayscale-[0.3]">
                  {f.icon}
                </span>
                <p className="font-bold text-[0.95rem] mb-2 text-[rgba(255,255,255,0.7)]">
                  {f.title}
                </p>
                <p className="text-[rgba(255,255,255,0.3)] text-[0.825rem] leading-[1.6]">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#1a1a1f] px-5 py-8 sm:px-8 lg:px-16">
          <div className="mx-auto grid max-w-[1200px] gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <a
                href="#top"
                className="mb-3 inline-flex items-center gap-2.5 text-white no-underline"
                aria-label="RepUp home"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[rgba(61,161,212,0.2)] bg-[rgba(61,161,212,0.07)]">
                  <img
                    src="/repup-icon-192.png"
                    alt="RepUp Logo"
                    className="w-[17px] h-[17px] object-contain"
                  />
                </span>
                <span className="font-[Sora,sans-serif] text-[1.15rem] font-extrabold leading-none tracking-normal">
                  Rep<span className="text-[#3da1d4]">Up</span>
                </span>
              </a>
              <p className="max-w-[34ch] text-[0.86rem] leading-[1.7] text-[rgba(255,255,255,0.42)]">
                Mobile-first workout tracking for sets, templates, bodyweight,
                and calorie goals.
              </p>
            </div>

            <div>
              <p className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[rgba(255,255,255,0.28)]">
                Essential
              </p>
              <div className="flex flex-col gap-2 text-[0.84rem] text-[rgba(255,255,255,0.44)]">
                <span>Installable PWA</span>
                <span>Works on iOS and Android</span>
                <span>No app store required</span>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-8 flex max-w-[1200px] flex-col gap-2 border-t border-[#15151b] pt-5 text-[0.76rem] text-[rgba(255,255,255,0.26)] sm:flex-row sm:items-center sm:justify-between">
            <span>Built by Shivam.</span>
            <span>Track hard. Recover well. Repeat.</span>
          </div>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap');
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

function MobileLanding() {
  const navigate = useNavigate();
  const { canInstall, install, installed } = useInstallPrompt();

  return (
    <div className="h-svh w-full overflow-hidden bg-black relative font-[DM_Sans,sans-serif]">
      <div
        className="absolute inset-0 bg-cover bg-[center_top]"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.08)_35%,rgba(0,0,0,0.7)_65%,rgba(0,0,0,0.93)_100%)]" />

      <div
        className="absolute inset-0 flex flex-col justify-end"
        style={{
          padding:
            "env(safe-area-inset-top) 1.75rem calc(3rem + env(safe-area-inset-bottom))",
        }}
      >
        <p className="text-[rgba(255,255,255,0.65)] text-[0.85rem] tracking-[0.18em] uppercase font-medium mb-1">
          Welcome to
        </p>

        <h1 className="font-[Bebas_Neue,sans-serif]! text-[clamp(3.5rem,18vw,5rem)] leading-[0.95] mb-5 tracking-[0.02em]">
          <span className="text-white">Rep</span>
          <span className="text-[#3da1d4]">Up.</span>
        </h1>

        <p className="text-[rgba(255,255,255,0.7)] text-[clamp(0.875rem,4vw,1rem)] leading-[1.65] mb-9 max-w-[30ch]">
          Track every rep. Log every session.
          <br />
          Watch yourself get stronger -<br />
          one lift at a time.
        </p>

        <button
          onClick={() => navigate("/register")}
          className="w-full p-4 bg-[#3da1d4] text-white border-none rounded-full text-base font-bold font-[DM_Sans,sans-serif] tracking-[0.02em] cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_32px_rgba(71,184,255,0.3)] mb-3.5"
        >
          Get Started →
        </button>

        {canInstall && !installed && (
          <button
            onClick={install}
            className="w-full py-3.5 bg-[rgba(255,255,255,0.08)] text-white border border-[rgba(255,255,255,0.15)] rounded-full text-[0.9rem] font-semibold font-[DM_Sans,sans-serif] cursor-pointer flex items-center justify-center gap-2 backdrop-blur-[8px] mb-3.5"
          >
            <span>📲</span> Install App
          </button>
        )}

        <p className="text-center text-[rgba(255,255,255,0.45)] text-sm">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="bg-transparent border-none text-[#3da1d4] font-bold text-sm font-[DM_Sans,sans-serif] cursor-pointer p-0"
          >
            Log in
          </button>
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
}

export default function LandingPage() {
  const isPwaStandalone = useStandalonePwa();

  return isPwaStandalone ? <MobileLanding /> : <DesktopView />;
}
