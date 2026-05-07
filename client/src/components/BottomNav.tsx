import { useLocation, useNavigate } from "react-router-dom";

const ACTIVE_COLOR = "#4ade80";
const INACTIVE_COLOR = "#6b6b80";

const navItems = [
  {
    label: "Home",
    path: "/dashboard",
    icon: (color: string) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        stroke={color}
      >
        <path
          d="M3 9.5L11 3l8 6.5V19a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
  {
    label: "Templates",
    path: "/templates",
    icon: (color: string) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        stroke={color}
      >
        <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth="1.6" />
        <rect x="12" y="3" width="7" height="7" rx="1.5" strokeWidth="1.6" />
        <rect x="3" y="12" width="7" height="7" rx="1.5" strokeWidth="1.6" />
        <rect x="12" y="12" width="7" height="7" rx="1.5" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    label: "History",
    path: "/history",
    icon: (color: string) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        stroke={color}
      >
        <path d="M4 17V5" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M4 17h14" strokeWidth="1.6" strokeLinecap="round" />
        <path
          d="M6.5 14l3-3 3 2.5 3.5-4"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="6.5" cy="14" r="1" strokeWidth="1.6" />
        <circle cx="9.5" cy="11" r="1" strokeWidth="1.6" />
        <circle cx="12.5" cy="13.5" r="1" strokeWidth="1.6" />
        <circle cx="16" cy="9.5" r="1" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    label: "Profile",
    path: "/profile",
    icon: (color: string) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        stroke={color}
      >
        <circle cx="11" cy="8" r="3.5" strokeWidth="1.6" />
        <path
          d="M4 19c0-3.314 3.134-6 7-6s7 2.686 7 6"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#1f1f26] bg-[#14141b]/95 backdrop-blur-md shadow-[0_-8px_20px_rgba(0,0,0,0.35)]">
      <div className="mx-auto grid w-full max-w-[560px] grid-cols-4 px-[16px] pt-[6px] pb-1" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {navItems.map((item) => {
          const active =
            pathname === item.path || pathname.startsWith(item.path + "/");
          const color = active ? ACTIVE_COLOR : INACTIVE_COLOR;

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`
                w-full flex flex-col items-center justify-center
                gap-[5px] min-h-[56px]
                bg-transparent border-none
                cursor-pointer
                active:scale-95
                transition-all duration-150
                ${active ? "-translate-y-[2px]" : ""}
              `}
            >
              {/* ICON */}
              <div className="transition-all duration-200">
                {item.icon(color)}
              </div>

              {/* LABEL */}
              <span
                className={`
                  w-full text-center text-[10px] font-extrabold uppercase tracking-[0.12em] leading-[1]
                  transition-colors
                  ${active ? "text-[#4ade80]" : "text-[#6b6b80]"}
                `}
              >
                {item.label}
              </span>

              {/* UNDERLINE */}
              <span
                className={`
                  w-[16px] h-[2px] rounded-full bg-[#4ade80]
                  transition-transform duration-200 origin-center
                  ${active ? "scale-x-100" : "scale-x-0"}
                `}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
