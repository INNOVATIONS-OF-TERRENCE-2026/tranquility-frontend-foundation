import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type AdminRow = { id: string; title: string; subtitle: string; status: string; date: string; raw: Record<string, unknown> };

export function AdminTable({ rows, onEdit, onDelete }: { rows: AdminRow[]; onEdit: (row: AdminRow) => void; onDelete: (row: AdminRow) => void }) {
  if (!rows.length) return <p className="py-10 text-center text-sm text-muted-foreground">No records yet.</p>;
  return <Table><TableHeader><TableRow><TableHead>Contact</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="w-24 text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{rows.map((row) => <TableRow key={row.id}><TableCell><span className="block font-semibold text-ink">{row.title}</span><span className="text-xs text-muted-foreground">{row.subtitle}</span></TableCell><TableCell><Badge variant="outline">{row.status}</Badge></TableCell><TableCell>{row.date}</TableCell><TableCell><div className="flex justify-end gap-1"><Button type="button" size="icon" variant="ghost" onClick={() => onEdit(row)} aria-label={`Edit ${row.title}`}><Pencil /></Button><Button type="button" size="icon" variant="ghost" onClick={() => onDelete(row)} aria-label={`Delete ${row.title}`}><Trash2 /></Button></div></TableCell></TableRow>)}</TableBody></Table>;
}
