import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { StudioBookingDraft } from "@/types/studio";

interface StudioTransferContextValue {
  draft: StudioBookingDraft | null;
  setDraft: (draft: StudioBookingDraft) => void;
  clearDraft: () => void;
}

const StudioTransferContext = createContext<StudioTransferContextValue | null>(null);

export function StudioTransferProvider({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useState<StudioBookingDraft | null>(null);
  const value = useMemo<StudioTransferContextValue>(
    () => ({
      draft,
      setDraft: setDraftState,
      clearDraft: () => setDraftState(null),
    }),
    [draft],
  );

  return <StudioTransferContext.Provider value={value}>{children}</StudioTransferContext.Provider>;
}

export function useStudioTransfer() {
  const context = useContext(StudioTransferContext);
  if (!context) throw new Error("useStudioTransfer must be used within StudioTransferProvider");
  return context;
}
