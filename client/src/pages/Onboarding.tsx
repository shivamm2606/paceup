import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUpdateUserInfo } from "../hooks/user/useUpdateUserInfo";
import { getErrorMessage } from "../utils/getErrorMessage";
import { AuthLayout } from "../components/auth/AuthLayout";
import { AuthAlert } from "../components/auth/AuthAlert";
import useAuthStore from "../store/authStore";

type Gender = "male" | "female" | "other";
type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active";
type Goal = "lose_weight" | "maintain" | "lean_bulk" | "bulk";

const TOTAL_STEPS = 3;

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-[6px] rounded-full transition-all duration-300 ${
            i === current
              ? "w-6 bg-[#47b8ff]"
              : i < current
                ? "w-[6px] bg-[rgba(71,184,255,0.4)]"
                : "w-[6px] bg-[#1e1e28]"
          }`}
        />
      ))}
    </div>
  );
}

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 rounded-[14px] border text-[14px] font-semibold transition-all duration-150 ${
        selected
          ? "bg-[rgba(71,184,255,0.08)] border-[rgba(71,184,255,0.35)] text-[#f0f0f5]"
          : "bg-[#111116] border-[#1e1e28] text-[#8b8b9a] hover:border-[#2a2a38]"
      }`}
    >
      {children}
    </button>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  unit,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-[12px] font-semibold text-[#8b8b9a] mb-2 block">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#111116] border border-[#1e1e28] text-[#f0f0f5] px-4 py-[13px] pr-14 rounded-[14px] text-[14px] placeholder-[#2e2e3a] focus:outline-none focus:border-[rgba(71,184,255,0.45)] focus:bg-[#12121a] transition-all duration-150"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-[#44445a]">
          {unit}
        </span>
      </div>
    </div>
  );
}

function StepAbout({
  gender,
  setGender,
  dob,
  setDob,
}: {
  gender: Gender | null;
  setGender: (g: Gender) => void;
  dob: string;
  setDob: (d: string) => void;
}) {
  return (
    <div>
      <div className="mb-8">
        <p className="text-[11px] font-bold text-[#44445a] tracking-[0.12em] uppercase mb-2">
          Step 1 of {TOTAL_STEPS}
        </p>
        <h1 className="text-[30px] font-black tracking-[-0.04em] leading-[1.1]">
          About <span className="text-[#47b8ff]">you</span>
        </h1>
        <p className="text-[13px] text-[#6b6b80] mt-2 leading-relaxed">
          This helps us personalize your experience.
        </p>
      </div>

      <div className="mb-6">
        <label className="text-[12px] font-semibold text-[#8b8b9a] mb-3 block">
          Gender
        </label>
        <div className="space-y-2">
          {[
            { value: "male" as Gender, label: "♂ Male" },
            { value: "female" as Gender, label: "♀ Female" },
            { value: "other" as Gender, label: "⚧ Other" },
          ].map((opt) => (
            <OptionButton
              key={opt.value}
              selected={gender === opt.value}
              onClick={() => setGender(opt.value)}
            >
              {opt.label}
            </OptionButton>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[12px] font-semibold text-[#8b8b9a] mb-2 block">
          Date of Birth
        </label>
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full bg-[#111116] border border-[#1e1e28] text-[#f0f0f5] px-4 py-[13px] rounded-[14px] text-[14px] focus:outline-none focus:border-[rgba(71,184,255,0.45)] focus:bg-[#12121a] transition-all duration-150"
          style={{ colorScheme: "dark" }}
        />
      </div>
    </div>
  );
}

function StepBodyStats({
  height,
  setHeight,
  currentWeight,
  setCurrentWeight,
  targetWeight,
  setTargetWeight,
}: {
  height: string;
  setHeight: (v: string) => void;
  currentWeight: string;
  setCurrentWeight: (v: string) => void;
  targetWeight: string;
  setTargetWeight: (v: string) => void;
}) {
  return (
    <div>
      <div className="mb-8">
        <p className="text-[11px] font-bold text-[#44445a] tracking-[0.12em] uppercase mb-2">
          Step 2 of {TOTAL_STEPS}
        </p>
        <h1 className="text-[30px] font-black tracking-[-0.04em] leading-[1.1]">
          Body <span className="text-[#47b8ff]">stats</span>
        </h1>
        <p className="text-[13px] text-[#6b6b80] mt-2 leading-relaxed">
          Used for calorie calculations and progress tracking.
        </p>
      </div>

      <div className="space-y-4">
        <NumberInput
          label="Height"
          value={height}
          onChange={setHeight}
          unit="cm"
          placeholder="175"
        />
        <NumberInput
          label="Current Weight"
          value={currentWeight}
          onChange={setCurrentWeight}
          unit="kg"
          placeholder="75"
        />
        <NumberInput
          label="Target Weight"
          value={targetWeight}
          onChange={setTargetWeight}
          unit="kg"
          placeholder="70"
        />
      </div>
    </div>
  );
}

function StepGoal({
  activityLevel,
  setActivityLevel,
  goal,
  setGoal,
}: {
  activityLevel: ActivityLevel | null;
  setActivityLevel: (a: ActivityLevel) => void;
  goal: Goal | null;
  setGoal: (g: Goal) => void;
}) {
  return (
    <div>
      <div className="mb-8">
        <p className="text-[11px] font-bold text-[#44445a] tracking-[0.12em] uppercase mb-2">
          Step 3 of {TOTAL_STEPS}
        </p>
        <h1 className="text-[30px] font-black tracking-[-0.04em] leading-[1.1]">
          Your <span className="text-[#47b8ff]">goal</span>
        </h1>
        <p className="text-[13px] text-[#6b6b80] mt-2 leading-relaxed">
          We'll auto-calculate your daily calorie target.
        </p>
      </div>

      <div className="mb-6">
        <label className="text-[12px] font-semibold text-[#8b8b9a] mb-3 block">
          Activity Level
        </label>
        <div className="space-y-2">
          {[
            {
              value: "sedentary" as ActivityLevel,
              label: "🪑 Sedentary",
              desc: "Little or no exercise",
            },
            {
              value: "lightly_active" as ActivityLevel,
              label: "🚶 Lightly Active",
              desc: "1–3 days/week",
            },
            {
              value: "moderately_active" as ActivityLevel,
              label: "🏃 Moderately Active",
              desc: "3–5 days/week",
            },
            {
              value: "very_active" as ActivityLevel,
              label: "🔥 Very Active",
              desc: "6–7 days/week",
            },
          ].map((opt) => (
            <OptionButton
              key={opt.value}
              selected={activityLevel === opt.value}
              onClick={() => setActivityLevel(opt.value)}
            >
              <span>{opt.label}</span>
              <span className="block text-[11px] text-[#6b6b80] font-normal mt-0.5">
                {opt.desc}
              </span>
            </OptionButton>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[12px] font-semibold text-[#8b8b9a] mb-3 block">
          Fitness Goal
        </label>
        <div className="space-y-2">
          {[
            { value: "lose_weight" as Goal, label: "⬇️ Lose Weight" },
            { value: "maintain" as Goal, label: "⚖️ Maintain" },
            { value: "lean_bulk" as Goal, label: "💪 Lean Bulk" },
            { value: "bulk" as Goal, label: "⬆️ Bulk" },
          ].map((opt) => (
            <OptionButton
              key={opt.value}
              selected={goal === opt.value}
              onClick={() => setGoal(opt.value)}
            >
              {opt.label}
            </OptionButton>
          ))}
        </div>
      </div>
    </div>
  );
}

function Onboarding() {
  const navigate = useNavigate();
  const { mutate: updateUserInfo, error, isPending } = useUpdateUserInfo();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [step, setStep] = useState(0);

  const [gender, setGender] = useState<Gender | null>(null);
  const [dob, setDob] = useState("");
  const [height, setHeight] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(
    null,
  );
  const [goal, setGoal] = useState<Goal | null>(null);

  const canProceedStep0 = !!gender && !!dob;
  const canProceedStep1 = !!height && !!currentWeight && !!targetWeight;
  const canProceedStep2 = !!activityLevel && !!goal;

  const canProceed = [canProceedStep0, canProceedStep1, canProceedStep2][step];

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
      return;
    }

    updateUserInfo(
      {
        gender: gender!,
        dateOfBirth: dob,
        height: parseFloat(height),
        currentWeight: parseFloat(currentWeight),
        targetWeight: parseFloat(targetWeight),
        activityLevel: activityLevel!,
        goal: goal!,
      },
      {
        onSuccess: (data) => {
          setAuth(data.data);
          navigate("/dashboard", { replace: true });
        },
      },
    );
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  };

  return (
    <AuthLayout
      onBack={step > 0 ? handleBack : undefined}
      hideBack={step === 0}
    >
      <StepDots current={step} total={TOTAL_STEPS} />

      {error && <AuthAlert variant="error" message={getErrorMessage(error)} />}

      {step === 0 && (
        <StepAbout
          gender={gender}
          setGender={setGender}
          dob={dob}
          setDob={setDob}
        />
      )}
      {step === 1 && (
        <StepBodyStats
          height={height}
          setHeight={setHeight}
          currentWeight={currentWeight}
          setCurrentWeight={setCurrentWeight}
          targetWeight={targetWeight}
          setTargetWeight={setTargetWeight}
        />
      )}
      {step === 2 && (
        <StepGoal
          activityLevel={activityLevel}
          setActivityLevel={setActivityLevel}
          goal={goal}
          setGoal={setGoal}
        />
      )}

      <button
        type="button"
        onClick={handleNext}
        disabled={!canProceed || isPending}
        className="w-full mt-8 relative overflow-hidden bg-[#3a9fe0] hover:bg-[#4daef0] disabled:bg-[#0f1e2e] disabled:text-[#2a4a6a] text-white font-black text-[15px] tracking-[-0.01em] py-[14px] rounded-[16px] transition-all duration-200 disabled:cursor-not-allowed"
        style={{
          boxShadow:
            !canProceed || isPending
              ? "none"
              : "0 0 24px rgba(71,184,255,0.15)",
        }}
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2.5"
                opacity="0.3"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            Saving...
          </span>
        ) : step < TOTAL_STEPS - 1 ? (
          "Continue"
        ) : (
          "Finish Setup"
        )}
      </button>
    </AuthLayout>
  );
}

export default Onboarding;
