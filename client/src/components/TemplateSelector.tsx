import { useGetTemplates } from "../hooks/workoutTemplate/useGetTemplates";
import { useCreateSession } from "../hooks/sessions/useCreateSession";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface Props {
  onBack: () => void;
  onClose: () => void;
}

export const TemplateSelector = ({ onBack, onClose }: Props) => {
  const { data: templates, isLoading, isError } = useGetTemplates();
  const { mutate: createSession, isPending } = useCreateSession();
  const navigate = useNavigate();
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(
    null,
  );

  const handleSelectTemplate = (templateId: string) => {
    setPendingTemplateId(templateId);
    createSession(
      { templateUsed: templateId },
      {
        onSuccess: (response) => {
          onClose();
          navigate(`/workout/${response._id}`);
        },
        onSettled: () => {
          setPendingTemplateId(null);
        },
      },
    );
  };

  return (
    <div
      onClick={isPending ? undefined : onClose}
      className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/60 backdrop-blur-sm"
    >
      <style>{`
        @keyframes sheetUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[520px] mx-auto bg-[#0d0d12] border-t border-l border-r border-[#1e1e28] rounded-t-[28px] px-5 pb-[90px] max-h-[80vh] flex flex-col"
        style={{ animation: "sheetUp 0.34s cubic-bezier(0.22, 1.08, 0.36, 1)" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-[14px] pb-2 shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#2a2a36]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-1.5 pt-2.5 pb-5 shrink-0">
          <div>
            <p className="text-[11px] font-bold text-[#44445a] tracking-[0.1em] uppercase mb-1.5">
              New Workout
            </p>
            <h2 className="text-[28px] font-black text-[#f0f0f5] tracking-[-0.04em] leading-[1.1] m-0">
              Pick a routine
            </h2>
          </div>
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-[12px] bg-[#13131a] border border-[#1e1e28] flex items-center justify-center text-[#8b8b9a] hover:text-[#f0f0f5] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 12H5M11 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <p className="text-[13px] text-[#44445a]">Loading templates...</p>
            </div>
          )}

          {isError && (
            <div className="flex items-center justify-center py-16">
              <p className="text-[13px] text-[#ef4444]">
                Failed to load templates
              </p>
            </div>
          )}

          {!isLoading && !isError && (!templates || templates.length === 0) && (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <div className="w-12 h-12 rounded-2xl bg-[#13131a] border border-[#1e1e28] flex items-center justify-center mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="3"
                    width="8"
                    height="8"
                    rx="2"
                    stroke="#44445a"
                    strokeWidth="1.8"
                  />
                  <rect
                    x="13"
                    y="3"
                    width="8"
                    height="8"
                    rx="2"
                    stroke="#44445a"
                    strokeWidth="1.8"
                  />
                  <rect
                    x="3"
                    y="13"
                    width="8"
                    height="8"
                    rx="2"
                    stroke="#44445a"
                    strokeWidth="1.8"
                  />
                  <rect
                    x="13"
                    y="13"
                    width="8"
                    height="8"
                    rx="2"
                    stroke="#44445a"
                    strokeWidth="1.8"
                  />
                </svg>
              </div>
              <p className="text-[14px] font-bold text-[#f0f0f5]">
                No templates yet
              </p>
              <p className="text-[12px] text-[#44445a] text-center">
                Create templates to start workouts faster
              </p>
            </div>
          )}

          {!isLoading && !isError && templates && templates.length > 0 && (
            <div className="flex flex-col gap-3 pb-10">
              {templates.map((template) => {
                const isThisPending = pendingTemplateId === template._id;
                return (
                  <button
                    key={template._id}
                    onClick={() => handleSelectTemplate(template._id)}
                    disabled={isPending}
                    className="w-full bg-[#13131a] hover:bg-[#15151d] hover:border-[#2a2a38] border border-[#1e1e28] rounded-[18px] p-[16px] text-left transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[15px] font-extrabold text-[#f0f0f5] tracking-tight">
                          {template.name}
                        </p>
                        <p className="text-[12px] text-[#44445a] mt-1">
                          {template.exercises.length} exercise
                          {template.exercises.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="w-7 h-7 rounded-[9px] bg-[#1a1a24] border border-[#24242e] flex items-center justify-center shrink-0">
                        {isThisPending ? (
                          <svg
                            className="animate-spin"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="#44445a"
                              strokeWidth="2.5"
                            />
                            <path
                              d="M12 2a10 10 0 0 1 10 10"
                              stroke="#7b9dff"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 14 14"
                            fill="none"
                          >
                            <path
                              d="M3 7h8M7 3l4 4-4 4"
                              stroke="#55556a"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
