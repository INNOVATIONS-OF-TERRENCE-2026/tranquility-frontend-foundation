import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarOff, LogOut, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminTable, type AdminRow } from "@/components/admin/AdminTable";
import { Logo } from "@/components/site/Logo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  createAvailabilityBlock,
  deleteAdminRecord,
  deleteAvailabilityBlock,
  deleteServiceCity,
  getAdminDashboard,
  updateAdminRecord,
  upsertServiceCity,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
  },
  head: () => ({
    meta: [
      { title: "Owner Workspace | Tranquility Level Cleaning" },
      { name: "description", content: "Private owner workspace." },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "Owner Workspace | Tranquility Level Cleaning" },
      { property: "og:description", content: "Private owner workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

type Section = "bookings" | "quotes" | "careers" | "inquiries";
type Dashboard = Awaited<ReturnType<ReturnType<typeof useServerFn<typeof getAdminDashboard>>>>;

function AdminPage() {
  const navigate = useNavigate();
  const loadDashboard = useServerFn(getAdminDashboard);
  const updateRecord = useServerFn(updateAdminRecord);
  const removeRecord = useServerFn(deleteAdminRecord);
  const addBlock = useServerFn(createAvailabilityBlock);
  const removeBlock = useServerFn(deleteAvailabilityBlock);
  const saveCityFn = useServerFn(upsertServiceCity);
  const removeCityFn = useServerFn(deleteServiceCity);
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<{ section: Section; row: AdminRow } | null>(null);
  const [deleting, setDeleting] = useState<{ section: Section; row: AdminRow } | null>(null);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [arrivalWindow, setArrivalWindow] = useState("");
  const [blockOpen, setBlockOpen] = useState(false);
  const [block, setBlock] = useState({
    startDate: "",
    endDate: "",
    serviceType: "all",
    arrivalWindow: "all",
    reason: "",
  });
  const [search, setSearch] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
  const [city, setCity] = useState({
    id: "",
    name: "",
    latitude: "",
    longitude: "",
    isActive: true,
    sortOrder: "100",
  });

  const refresh = useCallback(async () => {
    try {
      setData(await loadDashboard());
      setError("");
    } catch {
      setError("Owner access is unavailable. Sign in with the authorized account.");
    }
  }, [loadDashboard]);
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const tables = useMemo(() => {
    if (!data) return null;
    return {
      bookings: data.bookings.map((item) => ({
        id: item.id,
        title: item.customer_name,
        subtitle: `${item.customer_email} · ${item.service_type}`,
        status: item.status,
        date: `${item.service_date} · ${item.arrival_window}`,
        raw: item as unknown as Record<string, unknown>,
      })),
      quotes: data.quotes.map((item) => ({
        id: item.id,
        title: item.name,
        subtitle: `${item.email} · ${item.property_type}`,
        status: item.status,
        date: new Date(item.created_at).toLocaleDateString(),
        raw: item as unknown as Record<string, unknown>,
      })),
      careers: data.careers.map((item) => ({
        id: item.id,
        title: item.full_name,
        subtitle: `${item.email} · ${item.city}`,
        status: item.status,
        date: new Date(item.created_at).toLocaleDateString(),
        raw: item as unknown as Record<string, unknown>,
      })),
      inquiries: data.inquiries.map((item) => ({
        id: item.id,
        title: item.name,
        subtitle: `${item.email} · ${item.service_type}`,
        status: item.status,
        date: new Date(item.created_at).toLocaleDateString(),
        raw: item as unknown as Record<string, unknown>,
      })),
    };
  }, [data]);

  function openEdit(section: Section, row: AdminRow) {
    setEditing({ section, row });
    setStatus(row.status);
    setNotes(String(row.raw["private_notes"] ?? ""));
    setServiceDate(String(row.raw["service_date"] ?? ""));
    setArrivalWindow(String(row.raw["arrival_window"] ?? ""));
  }
  async function saveEdit(event: React.FormEvent) {
    event.preventDefault();
    if (!editing) return;
    await updateRecord({
      data: {
        section: editing.section,
        id: editing.row.id,
        status,
        privateNotes: notes,
        serviceDate: editing.section === "bookings" ? serviceDate : undefined,
        arrivalWindow:
          editing.section === "bookings"
            ? (arrivalWindow as "morning" | "midday" | "afternoon")
            : undefined,
      },
    });
    setEditing(null);
    await refresh();
  }
  async function confirmDelete() {
    if (!deleting) return;
    await removeRecord({ data: { section: deleting.section, id: deleting.row.id } });
    setDeleting(null);
    await refresh();
  }
  async function saveBlock(event: React.FormEvent) {
    event.preventDefault();
    await addBlock({
      data: {
        startDate: block.startDate,
        endDate: block.endDate || block.startDate,
        serviceType:
          block.serviceType === "all" ? null : (block.serviceType as "standard" | "deep" | "move"),
        arrivalWindow:
          block.arrivalWindow === "all"
            ? null
            : (block.arrivalWindow as "morning" | "midday" | "afternoon"),
        reason: block.reason,
      },
    });
    setBlockOpen(false);
    await refresh();
  }
  async function saveCity(event: React.FormEvent) {
    event.preventDefault();
    await saveCityFn({
      data: {
        id: city.id || undefined,
        name: city.name,
        latitude: Number(city.latitude),
        longitude: Number(city.longitude),
        isActive: city.isActive,
        sortOrder: Number(city.sortOrder) || 0,
      },
    });
    setCityOpen(false);
    await refresh();
  }
  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }

  const term = search.trim().toLowerCase();
  const filterRows = (rows: AdminRow[]) =>
    term
      ? rows.filter((row) =>
          `${row.title} ${row.subtitle} ${row.status} ${row.date}`.toLowerCase().includes(term),
        )
      : rows;

  const today = new Date().toISOString().slice(0, 10);
  const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const upcoming = (data?.bookings ?? [])
    .filter(
      (item) =>
        item.service_date >= today && item.service_date <= weekEnd && item.status !== "cancelled",
    )
    .sort((a, b) => a.service_date.localeCompare(b.service_date));
  const todays = upcoming.filter((item) => item.service_date === today);

  const demand = (() => {
    const map = new Map<string, { bookings: number; quotes: number; inquiries: number }>();
    const bump = (raw: string | null | undefined, key: "bookings" | "quotes" | "inquiries") => {
      const name = (raw ?? "").trim();
      if (!name) return;
      const entry = map.get(name) ?? { bookings: 0, quotes: 0, inquiries: 0 };
      entry[key] += 1;
      map.set(name, entry);
    };
    for (const item of data?.bookings ?? []) bump(item.city, "bookings");
    for (const item of data?.quotes ?? []) bump(item.city, "quotes");
    for (const item of data?.careers ?? []) bump(item.city, "inquiries");


    return [...map.entries()]
      .map(([name, counts]) => ({ name, ...counts, total: counts.bookings + counts.quotes }))
      .sort((a, b) => b.total - a.total);
  })();

  return (
    <main className="min-h-screen bg-sand">
      <header className="border-b border-border bg-card">
        <div className="container-page flex min-h-20 items-center justify-between gap-4">
          <Link to="/">
            <Logo compact />
          </Link>
          <Button type="button" variant="ghost" onClick={signOut}>
            <LogOut /> Sign out
          </Button>
        </div>
      </header>
      <div className="container-page py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Private workspace</p>
            <h1 className="mt-2 text-4xl">Bookings and leads</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage requests, follow-ups, notes, and schedule availability.
            </p>
          </div>
          <Button onClick={() => setBlockOpen(true)}>
            <CalendarOff /> Block availability
          </Button>
        </div>
        {error && (
          <p
            className="mt-6 rounded-lg border border-destructive/30 bg-card p-4 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}
        {!data ? (
          <p className="mt-10 text-sm text-muted-foreground">Loading private records…</p>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Booking requests", data.bookings.length],
                ["Quotes", data.quotes.length],
                ["Careers", data.careers.length],
                ["Inquiries", data.inquiries.length],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-lg border bg-card p-5">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-2 font-display text-4xl text-ink">{value}</p>
                </div>
              ))}
            </div>
            {tables && (
              <Tabs defaultValue="bookings" className="mt-8">
                <TabsList className="h-auto w-full justify-start overflow-x-auto bg-card p-1">
                  <TabsTrigger value="bookings">Bookings</TabsTrigger>
                  <TabsTrigger value="quotes">Quotes</TabsTrigger>
                  <TabsTrigger value="careers">Careers</TabsTrigger>
                  <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
                  <TabsTrigger value="availability">Availability</TabsTrigger>
                </TabsList>
                {(["bookings", "quotes", "careers", "inquiries"] as Section[]).map((section) => (
                  <TabsContent
                    key={section}
                    value={section}
                    className="mt-5 rounded-lg border bg-card p-3"
                  >
                    <AdminTable
                      rows={tables[section]}
                      onEdit={(row) => openEdit(section, row)}
                      onDelete={(row) => setDeleting({ section, row })}
                    />
                  </TabsContent>
                ))}
                <TabsContent value="availability" className="mt-5 rounded-lg border bg-card p-5">
                  {data.blocks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No availability blocks.</p>
                  ) : (
                    <div className="space-y-3">
                      {data.blocks.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="font-semibold">
                              {item.start_date} to {item.end_date}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.service_type ?? "All services"} ·{" "}
                              {item.arrival_window ?? "All day"} · {item.reason ?? "No note"}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              await removeBlock({ data: { id: item.id } });
                              await refresh();
                            }}
                          >
                            Reopen
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </>
        )}
      </div>
      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage record</DialogTitle>
            <DialogDescription>Update status, schedule, and private owner notes.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={saveEdit}>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(editing?.section === "bookings"
                    ? ["pending", "confirmed", "completed", "cancelled"]
                    : ["new", "reviewing", "contacted", "closed"]
                  ).map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editing?.section === "bookings" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Date</Label>
                  <Input
                    className="mt-2"
                    type="date"
                    value={serviceDate}
                    onChange={(event) => setServiceDate(event.target.value)}
                  />
                </div>
                <div>
                  <Label>Arrival</Label>
                  <Select value={arrivalWindow} onValueChange={setArrivalWindow}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">8–11 AM</SelectItem>
                      <SelectItem value="midday">11 AM–2 PM</SelectItem>
                      <SelectItem value="afternoon">2–5 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div>
              <Label>Private notes</Label>
              <Textarea
                className="mt-2"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={5}
              />
            </div>
            <Button type="submit" className="w-full">
              Save changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block availability</DialogTitle>
            <DialogDescription>
              Close one window or a full day across one or all services.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={saveBlock}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Start date</Label>
                <Input
                  className="mt-2"
                  type="date"
                  required
                  value={block.startDate}
                  onChange={(event) => setBlock({ ...block, startDate: event.target.value })}
                />
              </div>
              <div>
                <Label>End date</Label>
                <Input
                  className="mt-2"
                  type="date"
                  value={block.endDate}
                  onChange={(event) => setBlock({ ...block, endDate: event.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Service</Label>
              <Select
                value={block.serviceType}
                onValueChange={(value) => setBlock({ ...block, serviceType: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All services</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="deep">Deep</SelectItem>
                  <SelectItem value="move">Move</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Window</Label>
              <Select
                value={block.arrivalWindow}
                onValueChange={(value) => setBlock({ ...block, arrivalWindow: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All day</SelectItem>
                  <SelectItem value="morning">8–11 AM</SelectItem>
                  <SelectItem value="midday">11 AM–2 PM</SelectItem>
                  <SelectItem value="afternoon">2–5 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Private reason</Label>
              <Input
                className="mt-2"
                value={block.reason}
                onChange={(event) => setBlock({ ...block, reason: event.target.value })}
              />
            </div>
            <Button type="submit" className="w-full">
              <Plus /> Add block
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. Use a closed or cancelled status when you need to preserve
              history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={confirmDelete}
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
