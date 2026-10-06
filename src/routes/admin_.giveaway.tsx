import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Gift, RefreshCw, Shuffle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  getGiveawayAdmin,
  pickGiveawayWinner,
  updateGiveawayEntry,
} from "@/lib/giveaway-admin.functions";

export const Route = createFileRoute("/admin_/giveaway")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
  },
  head: () => ({
    meta: [
      { title: "Giveaway Workspace | Tranquility Level Cleaning" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: GiveawayAdminPage,
});

type Dashboard = Awaited<ReturnType<ReturnType<typeof useServerFn<typeof getGiveawayAdmin>>>>;

function GiveawayAdminPage() {
  const load = useServerFn(getGiveawayAdmin);
  const pickWinner = useServerFn(pickGiveawayWinner);
  const updateEntry = useServerFn(updateGiveawayEntry);
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [month, setMonth] = useState("");
  const [savingId, setSavingId] = useState("");

  const refresh = useCallback(async () => {
    try {
      const result = await load();
      setData(result);
      setError("");
      if (!month && result.entries.length) setMonth(result.entries[0]!.giveaway_month);
    } catch {
      setError("Giveaway records are unavailable. Confirm owner access.");
    }
  }, [load, month]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const months = useMemo(
    () => [...new Set((data?.entries ?? []).map((entry) => entry.giveaway_month))],
    [data],
  );

  const entries = useMemo(
    () => (data?.entries ?? []).filter((entry) => !month || entry.giveaway_month === month),
    [data, month],
  );

  const consentCount = useMemo(() => {
    const ids = new Set(entries.map((entry) => entry.id));
    return (data?.consents ?? []).filter((consent) => consent.source_entity_id && ids.has(consent.source_entity_id)).length;
  }, [data, entries]);

  async function selectWinner() {
    if (!month) return;
    setError("");
    try {
      await pickWinner({ data: { month } });
      await refresh();
    } catch (selectionError) {
      setError(
        selectionError instanceof Error ? selectionError.message : "Unable to select a winner.",
      );
    }
  }

  async function saveEntry(
    id: string,
    status: "new" | "selected" | "contacted" | "scheduled" | "completed" | "ineligible" | "declined",
    privateNotes: string,
  ) {
    setSavingId(id);
    try {
      await updateEntry({ data: { id, status, privateNotes } });
      await refresh();
    } finally {
      setSavingId("");
    }
  }

  return (
    <main className="min-h-screen bg-sand">
      <header className="border-b border-border bg-card">
        <div className="container-page flex min-h-20 items-center justify-between gap-4">
          <Link to="/">
            <Logo compact />
          </Link>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/admin">Owner workspace</Link>
            </Button>
            <Button variant="ghost" onClick={() => void refresh()}>
              <RefreshCw className="size-4" /> Refresh
            </Button>
          </div>
        </div>
      </header>

      <div className="container-page py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Private workspace</p>
            <h1 className="mt-2 text-4xl">Monthly giveaway</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Review monthly entries, documented marketing opt-ins, and select one eligible entry
              at random for a drawing month.
            </p>
          </div>
          <Button onClick={selectWinner} disabled={!month || entries.length === 0}>
            <Shuffle className="size-4" /> Select random winner
          </Button>
        </div>

        {error && (
          <p className="mt-6 rounded-lg border border-destructive/30 bg-card p-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {!data ? (
          <p className="mt-10 text-sm text-muted-foreground">Loading giveaway records...</p>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Entries shown</p>
                <p className="mt-2 font-display text-4xl text-ink">{entries.length}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Email opt-ins</p>
                <p className="mt-2 font-display text-4xl text-ink">
                  {entries.filter((entry) => entry.marketing_email_opt_in).length}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">SMS opt-ins</p>
                <p className="mt-2 font-display text-4xl text-ink">
                  {entries.filter((entry) => entry.marketing_sms_opt_in).length}
                </p>
              </div>
            </div>

            <div className="mt-6 max-w-sm">
              <Label>Drawing month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="mt-2 bg-card">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((value) => (
                    <SelectItem key={value} value={value}>
                      {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-2 text-xs text-muted-foreground">
                {consentCount} documented marketing consent record{consentCount === 1 ? "" : "s"} for
                this drawing.
              </p>
            </div>

            {entries.length === 0 ? (
              <div className="mt-10 rounded-2xl border border-border bg-card p-8 text-center">
                <Gift className="mx-auto size-6 text-moss" />
                <p className="mt-3 text-sm text-muted-foreground">No entries for this month yet.</p>
              </div>
            ) : (
              <div className="mt-8 grid gap-5">
                {entries.map((entry) => (
                  <GiveawayEntryCard
                    key={entry.id}
                    entry={entry}
                    saving={savingId === entry.id}
                    onSave={saveEntry}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function GiveawayEntryCard({
  entry,
  saving,
  onSave,
}: {
  entry: Dashboard["entries"][number];
  saving: boolean;
  onSave: (
    id: string,
    status: "new" | "selected" | "contacted" | "scheduled" | "completed" | "ineligible" | "declined",
    privateNotes: string,
  ) => Promise<void>;
}) {
  const [status, setStatus] = useState(entry.status);
  const [notes, setNotes] = useState(entry.private_notes ?? "");

  useEffect(() => {
    setStatus(entry.status);
    setNotes(entry.private_notes ?? "");
  }, [entry]);

  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.42fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl text-ink">{entry.entrant_name}</h2>
            {entry.status === "selected" && (
              <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-ink">
                Selected
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {entry.entrant_email} · {entry.entrant_phone} · {entry.city} {entry.zip}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Entry for: <span className="font-semibold text-ink">{entry.entry_for}</span>
            {entry.nominee_name ? ` · Nominee: ${entry.nominee_name}` : ""}
            {entry.nominee_relationship ? ` · ${entry.nominee_relationship}` : ""}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Category: <span className="font-semibold text-ink">{entry.need_category}</span>
          </p>
          <div className="mt-5 rounded-xl bg-sand p-4 text-sm leading-relaxed text-foreground">
            {entry.story}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-border px-3 py-1.5">
              Email marketing: {entry.marketing_email_opt_in ? "opted in" : "not opted in"}
            </span>
            <span className="rounded-full border border-border px-3 py-1.5">
              SMS marketing: {entry.marketing_sms_opt_in ? "opted in" : "not opted in"}
            </span>
            <span className="rounded-full border border-border px-3 py-1.5">
              Entered {new Date(entry.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["new", "selected", "contacted", "scheduled", "completed", "ineligible", "declined"].map(
                  (value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Private notes</Label>
            <Textarea
              className="mt-2 min-h-28"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
          <Button
            className="w-full"
            disabled={saving}
            onClick={() =>
              void onSave(
                entry.id,
                status as "new" | "selected" | "contacted" | "scheduled" | "completed" | "ineligible" | "declined",
                notes,
              )
            }
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </article>
  );
}
