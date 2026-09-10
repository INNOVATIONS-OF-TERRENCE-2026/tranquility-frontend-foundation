import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useRef, useState } from "react";

import { Blueprint } from "./Blueprint";
import { EstimatePanel } from "./EstimatePanel";
import { HouseholdProfile } from "./HouseholdProfile";
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
    <section className="section pt-8 md:pt-12">
      <div className="container-page">
        <div className="mb-8 flex flex-col gap-5 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-moss/35 bg-accent/45 px-3 py-1.5 text-xs font-semibold text-moss">
              <Sparkles className="size-3.5" aria-hidden="true" /> Tranquility Studio
            </div>
            <h1 className="mt-4 text-4xl leading-tight md:text-6xl">Design your cleaning experience around the way you actually live.</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Build a visual room plan, organize cleaning priorities, document surfaces and household preferences, then leave with a personalized Home Care Blueprint.
            </p>
          </div>
          <div className="max-w-sm rounded-xl border border-border bg-sand p-4 text-xs leading-relaxed text-muted-foreground">
            Studio is a frontend planning tool. It does not upload photos, store household information, perform AI analysis, or add unapproved pricing.
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)_20rem] xl:grid-cols-[14rem_minmax(0,1fr)_21rem]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <StudioProgress current={step} completed={completed} onSelect={goTo} />
          </aside>

          <div className="min-w-0">
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
                <div className="mt-10 rounded-2xl border border-border bg-sand p-6">
                  <p className="eyebrow">Next step</p>
                  <h2 className="mt-2 text-2xl">Turn your plan into a service request</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    Cleaning type, frequency, room quantities, approved add-ons, and square footage can move into the service request through temporary in-memory state. Names, addresses, photos, and household notes are not transferred or stored.
                  </p>
                  {reviewFlags.length > 0 && (
                    <p className="mt-4 text-sm font-medium text-oak">
                      Your plan has {reviewFlags.length} review {reviewFlags.length === 1 ? "item" : "items"}. A custom quote may be the better path.
                    </p>
                  )}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Button asChild size="lg" onClick={transferToBooking}>
                      <Link to="/booking">Continue to Request Service</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
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

          <div className="min-w-0">
            <EstimatePanel state={state} />
          </div>
        </div>
      </div>
    </section>
  );
}
