import { useState } from "react";
import { useGetTemplates } from "../hooks/workoutTemplate/useGetTemplates";
import { useCurrentUser } from "../hooks/user/useCurrentUser";
import { TemplateCard } from "../components/templates/TemplateCard";
import { TemplateDetailSheet } from "../components/templates/TemplateDetailSheet";
import { CreateTemplateSheet } from "../components/templates/CreateTemplateSheet";
import type {
  WorkoutTemplate,
  PopulatedExercise,
} from "../types/workoutTemplate.types";

type Tab = "default" | "mine";

function Templates() {
  const { data: templates, isLoading, isError } = useGetTemplates();
  const { data: user } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<Tab>("default");
  const [selectedTemplate, setSelectedTemplate] =
    useState<WorkoutTemplate | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editTemplate, setEditTemplate] = useState<WorkoutTemplate | null>(
    null,
  );
  const [search, setSearch] = useState("");

  const defaultTemplates = (templates ?? []).filter(
    (template) => template.userId !== user?._id,
  );
  const myTemplates = (templates ?? []).filter(
    (template) => template.userId === user?._id,
  );

  const tabList = activeTab === "default" ? defaultTemplates : myTemplates;

  const isTemplateMatch = (template: WorkoutTemplate, query: string) => {
    if (template.name.toLowerCase().includes(query)) return true;
    return template.exercises.some((ex) => {
      const populated =
        typeof ex.exerciseId === "object"
          ? (ex.exerciseId as PopulatedExercise)
          : null;
      return (
        populated &&
        (populated.name.toLowerCase().includes(query) ||
          populated.muscleGroup.toLowerCase().includes(query))
      );
    });
  };

  const searchQuery = search.trim().toLowerCase();
  const displayed = searchQuery
    ? tabList.filter((template) => isTemplateMatch(template, searchQuery))
    : tabList;

  const handleEdit = (template: WorkoutTemplate) => {
    setSelectedTemplate(null);
    setTimeout(() => setEditTemplate(template), 280);
  };

  return (
    <div className="bg-[#0b0b10] bg-[radial-gradient(140%_90%_at_50%_0%,_rgba(70,80,120,0.16),_rgba(11,11,16,0)_55%),linear-gradient(180deg,_rgba(12,12,18,1)_0%,_rgba(10,10,16,1)_100%)] text-[#f4f4f6] min-h-screen pb-[82px]">
      {/* Header */}
      <div className="px-5 pt-[56px] pb-2">
        <p className="text-[11px] font-bold text-[#44445a] tracking-[0.1em] uppercase mb-1.5">
          Library
        </p>
        <h1 className="text-[30px] font-black text-[#f0f0f5] tracking-[-0.04em] leading-[1.1] m-0">
          Templates
        </h1>
        {templates && (
          <p className="text-[13px] text-[#6b6b80] mt-1.5">
            {templates.length} template{templates.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Tab Bar */}
      <div className="px-5 pt-3 pb-1">
        <div className="flex gap-[6px] p-[3px] bg-[#13131a] rounded-[14px] border border-[#1a1a20]">
          {(["default", "mine"] as Tab[]).map((tab) => {
            const isActive = activeTab === tab;
            const label = tab === "default" ? "Default" : "My Templates";
            const count =
              tab === "default" ? defaultTemplates.length : myTemplates.length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  flex-1 py-[9px] rounded-[11px] text-[12px] font-extrabold tracking-tight
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-[rgba(123,157,255,0.12)] text-[#7b9dff] shadow-[0_1px_4px_rgba(123,157,255,0.08)]"
                      : "bg-transparent text-[#6b6b80] hover:text-[#8b8b9a]"
                  }
                `}
              >
                {label}
                {count > 0 && (
                  <span
                    className={`ml-1.5 text-[10px] font-bold tabular-nums ${isActive ? "text-[#7b9dff]/60" : "text-[#44445a]"}`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="px-5 pt-3">
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="11" cy="11" r="7" stroke="#44445a" strokeWidth="2" />
            <path
              d="M20 20l-4-4"
              stroke="#44445a"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, exercise, or muscle…"
            className="w-full bg-[#13131a] border border-[#1e1e28] rounded-[12px] pl-10 pr-4 py-[10px] text-[13px] text-[#f0f0f5] placeholder-[#44445a] outline-none focus:border-[#2a2a38] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#44445a] hover:text-[#8b8b9a] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-4">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-[13px] text-[#44445a]">Loading templates…</p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <p className="text-[14px] font-bold text-[#f0f0f5]">
              Failed to load templates
            </p>
            <p className="text-[12px] text-[#6b6b80]">
              Check your connection and try again
            </p>
          </div>
        )}

        {!isLoading && !isError && displayed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            {search ? (
              <>
                <div className="w-14 h-14 rounded-[18px] bg-[#13131a] border border-[#1e1e28] flex items-center justify-center mb-1">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="11"
                      cy="11"
                      r="7"
                      stroke="#44445a"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M20 20l-4-4"
                      stroke="#44445a"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <p className="text-[15px] font-bold text-[#f0f0f5]">
                  No results
                </p>
                <p className="text-[12px] text-[#55556a] text-center max-w-[220px]">
                  No templates matching "{search}"
                </p>
              </>
            ) : activeTab === "mine" ? (
              <>
                <button
                  onClick={() => setShowCreate(true)}
                  className="w-14 h-14 rounded-[18px] bg-[#13131a] border border-[#1e1e28] flex items-center justify-center mb-1 hover:bg-[#1a1a24] hover:border-[#2a2a38] transition-all duration-150 active:scale-[0.95]"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="#7b9dff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <p className="text-[15px] font-bold text-[#f0f0f5]">
                  No custom templates yet
                </p>
                <p className="text-[12px] text-[#55556a] text-center max-w-[220px]">
                  Tap the + to create your first template
                </p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-[18px] bg-[#13131a] border border-[#1e1e28] flex items-center justify-center mb-1">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
                <p className="text-[15px] font-bold text-[#f0f0f5]">
                  No default templates
                </p>
                <p className="text-[12px] text-[#55556a] text-center max-w-[220px]">
                  Default templates will appear here
                </p>
              </>
            )}
          </div>
        )}

        {!isLoading && !isError && displayed.length > 0 && (
          <div className="flex flex-col gap-[10px]">
            {displayed.map((template) => (
              <TemplateCard
                key={template._id}
                template={template}
                onClick={() => setSelectedTemplate(template)}
              />
            ))}
          </div>
        )}
      </div>

      {/* fab */}
      {activeTab === "mine" && myTemplates.length > 0 && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-[90px] right-5 w-12 h-12 rounded-full bg-[#7b9dff] flex items-center justify-center shadow-[0_4px_16px_rgba(123,157,255,0.3)] hover:bg-[#8daeff] active:scale-[0.93] transition-all duration-150 z-40"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="#0b0b10"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}

      {/* Detail Sheet */}
      {selectedTemplate && (
        <TemplateDetailSheet
          template={selectedTemplate}
          isOwner={selectedTemplate.userId === user?._id}
          onClose={() => setSelectedTemplate(null)}
          onEdit={handleEdit}
        />
      )}

      {/* Create Sheet */}
      {showCreate && (
        <CreateTemplateSheet onClose={() => setShowCreate(false)} />
      )}

      {/* Edit Sheet */}
      {editTemplate && (
        <CreateTemplateSheet
          editTemplate={editTemplate}
          onClose={() => setEditTemplate(null)}
        />
      )}
    </div>
  );
}

export default Templates;
