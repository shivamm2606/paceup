import { useState } from "react";
import { useDeleteAccount } from "../../hooks/user/useDeleteAccount";
import { SheetWrapper, FormField } from "./SheetWrapper";

interface Props {
  onClose: () => void;
}

export function DeleteAccountSheet({ onClose }: Props) {
  const { mutate: deleteAccount, isPending } = useDeleteAccount();
  const [input, setInput] = useState("");
  const isConfirmed = input.trim() === "DELETE";

  const handleDelete = () => {
    if (!isConfirmed) return;
    deleteAccount();
  };

  return (
    <SheetWrapper
      title="Delete Account"
      subtitle="Danger Zone"
      onClose={onClose}
    >
      <div className="overflow-y-auto flex-1 -mx-1.5 px-1.5 space-y-4">
        {/* Warning */}
        <div className="bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.12)] rounded-[12px] p-4">
          <p className="text-[13px] font-bold text-[#ef4444] leading-relaxed">
            This action is permanent and cannot be undone.
          </p>
          <p className="text-[12px] text-[#ef4444]/70 mt-1.5 leading-relaxed">
            All your data including workouts, templates, and bodyweight logs
            will be permanently deleted.
          </p>
        </div>

        {/* Confirmation Input */}
        <div>
          <p className="text-[12px] text-[#8b8b9a] mb-3 leading-relaxed">
            Type <span className="font-extrabold text-[#f0f0f5]">DELETE</span>{" "}
            below to confirm.
          </p>
          <FormField
            label="Confirmation"
            value={input}
            onChange={setInput}
            placeholder="Type DELETE to confirm"
          />
        </div>
      </div>

      <div className="shrink-0 pt-5 pb-2">
        <button
          onClick={handleDelete}
          disabled={!isConfirmed || isPending}
          className={`w-full py-[15px] rounded-[14px] text-[15px] font-extrabold tracking-tight transition-all duration-150 ${
            !isConfirmed || isPending
              ? "bg-[#1a1a24] text-[#44445a] cursor-not-allowed"
              : "bg-[#ef4444] text-white hover:bg-[#dc2626] active:scale-[0.98]"
          }`}
        >
          {isPending ? "Deleting…" : "Delete My Account"}
        </button>
      </div>
    </SheetWrapper>
  );
}
