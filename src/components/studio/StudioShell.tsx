import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useRef, useState } from "react";

import { Blueprint } from "./Blueprint";
import { EstimatePanel } from "./EstimatePanel";
import { HouseholdProfile } from "./HouseholdProfile";
import { MobileEstimateBar } from "./MobileEstimateBar";
import { MoodBoard } from "./MoodBoard";
import { PriorityWorkspace } from "./PriorityWorkspace";
import { RoomManager } from "./RoomManager";
import { ServiceConfigurator } from "./ServiceConfigurator";
import { StudioProgress } from "./StudioProgress";
import { StyleProfile } from "./StyleProfile";
import { SurfaceProfile } from "./SurfaceProfile";
import { useStudioTransfer } from "./StudioTransferProvider";
import { Button } from "@/components/ui/button";
import { createRoom, initialStudioState, studioSteps } from "@/config/studio";
import { studioBookingDraft, studioReviewFlags } from "@/lib/studio";
import type { RoomType, StudioRoom, StudioState, StudioStepId } from "@/types/studio";

function freshState(): StudioState {
  return structuredClone(initialStudioState);
}

export function StudioShell() {
  const [state, setState] = useState<StudioState>(freshState);
  const [step, setStep] = useState<StudioStepId>("spaces");
  const [completed, setCompleted] = useState<StudioStepId[]>([]);
  const roomSequence = useRef(10);
  const { setDraft } = useStudioTransfer();

  const stepIndex = studioSteps.findIndex((item) => item.id === step);
  const reviewFlags = studioReviewFlags(state);

  function updateState(patch: Partial<StudioState>) {
    setState((current) => ({ ...current, ...patch }));
  }

  function updateRoom(id: string, patch: Partial<StudioRoom>) {
    setState((current) => ({
      ...current,
      rooms: current.rooms.map((room) => (room.id === id ? { ...room, ...patch } : room)),
    }));
  }

  function addRoom(type: RoomType) {
    roomSequence.current += 1;
    setState((current) => ({
      ...current,
      rooms: [...current.rooms, createRoom(type, roomSequence.current)],
    }));
  }

  function removeRoom(id: string) {
    setState((current) => ({
      ...current,
      rooms: current.rooms.filter((room) => room.id !== id),
    }));
  }

  function goTo(next: StudioStepId) {
    if (next !== step) setCompleted((items) => [...new Set([...items, step])]);
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goNext() {
    const next = studioSteps[stepIndex + 1];
    if (next) goTo(next.id);
  }

  function goBack() {
    const previous = studioSteps[stepIndex - 1];
    if (previous) goTo(previous.id);
  }

  function transferToBooking() {
    setDraft(studioBookingDraft(state));
  }

  return (
    <section className="brand-dark relative overflow-hidden bg-background pb-28 text-foreground lg:pb-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_5%,rgba(226,194,122,0.14),transparent_24%),radial-gradient(circle_at_0%_70%,rgba(255,255,255,0.045),transparent_26%)]" aria-hidden="true" />
      <div className="container-page relative py-8 md:py-12 lg:py-14">
        <div className="mb-8 grid gap-6 border-b border-gold/20 pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1.5 text-xs font-semibold text-gold-soft">
              <Sparkles className="size-3.5" aria-hidden="true" /> Tranquility Studio
            </div>
            <p className="mt-5 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-moss">Your space. Your standards.</p>
            <h1 className="mt-3 text-4xl leading-[0.98] text-ink md:text-6xl lg:text-[4.75rem]">Customize your cleaning experience.</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Configure rooms, cleaning priorities, materials, household preferences, protected areas, and approved service options in one guided workspace.
            </p>
          </div>
          <div className="max-w-sm rounded-2xl border border-gold/20 bg-card/70 p-4 text-xs leading-relaxed text-muted-foreground shadow-soft">
            Studio is a frontend planning tool. Photos stay on your device in this version, and nothing is presented as stored or analyzed when it is not.
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[13rem_minmax(0,1fr)_20rem] xl:grid-cols-[14rem_minmax(0,1fr)_21rem]">
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="luxury-panel rounded-2xl p-3">
              <StudioProgress current={step} completed={completed} onSelect={goTo} />
            </div>
          </aside>

          <div className="min-w-0 rounded-3xl border border-gold/20 bg-card/70 p-5 shadow-lift backdrop-blur-sm md:p-7">
            {step === "spaces" && (
              <>
                <ServiceConfigurator
                  service={state.service}
                  frequency={state.frequency}
                  squareFeet={state.squareFeet}
                  extras={state.extras}
                  onServiceChange={(service) => updateState({ service })}
                  onFrequencyChange={(frequency) => updateState({ frequency })}
                  onSquareFeetChange={(squareFeet) => updateState({ squareFeet })}
                  onExtrasChange={(extras) => updateState({ extras })}
                />
                <RoomManager rooms={state.rooms} onAdd={addRoom} onUpdate={updateRoom} onRemove={removeRoom} />
              </>
            )}

            {step === "priorities" && <PriorityWorkspace rooms={state.rooms} onUpdate={updateRoom} />}

            {step === "style" && (
              <>
                <StyleProfile
                  selectedStyles={state.selectedStyles}
                  primaryStyle={state.primaryStyle}
                  paletteId={state.paletteId}
                  customColors={state.customColors}
                  onStylesChange={(selectedStyles) => updateState({ selectedStyles })}
                  onPrimaryChange={(primaryStyle) => updateState({ primaryStyle })}
                  onPaletteChange={(paletteId) => updateState({ paletteId })}
                  onCustomColorsChange={(customColors) => updateState({ customColors })}
                />
                <MoodBoard state={state} />
              </>
            )}

            {step === "surfaces" && (
              <SurfaceProfile
                materials={state.materials}
                productPreferences={state.productPreferences}
                productNotes={state.productNotes}
                onMaterialsChange={(materials) => updateState({ materials })}
                onProductPreferencesChange={(productPreferences) => updateState({ productPreferences })}
                onProductNotesChange={(productNotes) => updateState({ productNotes })}
              />
            )}

            {step === "household" && (
              <HouseholdProfile
                household={state.household}
                protectedItems={state.protectedItems}
                protectedNotes={state.protectedNotes}
                generalNotes={state.generalNotes}
                onHouseholdChange={(household) => updateState({ household })}
                onProtectedItemsChange={(protectedItems) => updateState({ protectedItems })}
                onProtectedNotesChange={(protectedNotes) => updateState({ protectedNotes })}
                onGeneralNotesChange={(generalNotes) => updateState({ generalNotes })}
              />
            )}

            {step === "blueprint" && (
              <>
                <Blueprint state={state} />
                <div className="mt-10 rounded-2xl border border-gold/20 bg-sand p-6">
                  <p className="eyebrow">Next step</p>
                  <h2 className="mt-2 text-3xl">Turn your plan into a service request.</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    Cleaning type, frequency, room quantities, approved add-ons, and square footage can transfer into the service request through temporary in-memory state. Names, addresses, photos, and household notes are not transferred or stored.
                  </p>
                  {reviewFlags.length > 0 && (
                    <p className="mt-4 text-sm font-medium text-moss">
                      Your plan has {reviewFlags.length} review {reviewFlags.length === 1 ? "item" : "items"}. A custom quote may be the better path.
                    </p>
                  )}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Button asChild size="lg" onClick={transferToBooking}>
                      <Link to="/booking">Continue to Request Service</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="border-gold/35">
                      <Link to="/quote">Request Custom Quote</Link>
                    </Button>
                  </div>
                </div>
              </>
            )}

            <div className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6">
              <Button type="button" variant="ghost" disabled={stepIndex === 0} onClick={goBack} className="gap-2">
                <ArrowLeft className="size-4" aria-hidden="true" /> Back
              </Button>
              {stepIndex < studioSteps.length - 1 && (
                <Button type="button" size="lg" onClick={goNext} className="gap-2">
                  Continue <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>

          <div className="hidden min-w-0 lg:block">
            <EstimatePanel state={state} />
          </div>
        </div>
      </div>

      <MobileEstimateBar state={state} />
    </section>
  );
}
