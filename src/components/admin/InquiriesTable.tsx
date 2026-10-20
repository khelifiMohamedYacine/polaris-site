"use client";

import { useMemo, useState, useTransition } from "react";
import { updateInquiryStatus, addInquiryNote } from "@/lib/actions/inquiries-admin";
import type { Inquiry, InquiryNote, InquiryStatus } from "@/types/database";

const STATUS_OPTIONS: { value: InquiryStatus; label: string }[] = [
  { value: "new", label: "Nouvelle" },
  { value: "contacted", label: "Contactée" },
  { value: "visit_planned", label: "Visite prévue" },
  { value: "completed", label: "Terminée" },
  { value: "spam", label: "Indésirable" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-DZ", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function downloadCsv(inquiries: Inquiry[], propertyNames: Record<string, string>) {
  const header = ["Référence", "Date", "Nom", "Téléphone", "E-mail", "Projet", "Statut", "Message"];
  const rows = inquiries.map((i) => [
    i.reference,
    formatDate(i.created_at),
    i.full_name,
    i.phone,
    i.email ?? "",
    i.property_id ? propertyNames[i.property_id] ?? "" : "",
    i.status,
    (i.message ?? "").replace(/\n/g, " "),
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `demandes-polaris-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function InquiryRow({
  inquiry,
  propertyName,
  notes,
}: {
  inquiry: Inquiry;
  propertyName: string;
  notes: InquiryNote[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="bg-white rounded-xl ring-1 ring-line overflow-hidden">
      <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
        <div className="md:w-40 shrink-0">
          <p className="text-xs text-navy/40">{inquiry.reference}</p>
          <p className="text-xs text-navy/50">{formatDate(inquiry.created_at)}</p>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-navy">{inquiry.full_name}</p>
          <p className="text-sm text-navy/60">
            {inquiry.phone}
            {inquiry.email ? ` · ${inquiry.email}` : ""}
          </p>
          {propertyName && (
            <p className="text-sm text-gold mt-0.5">{propertyName}</p>
          )}
        </div>

        <select
          defaultValue={inquiry.status}
          disabled={isPending}
          onChange={(e) =>
            startTransition(() =>
              updateInquiryStatus(inquiry.id, e.target.value as InquiryStatus),
            )
          }
          className="rounded-full border border-line px-3 py-1.5 text-sm bg-white"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-sm text-navy/60 hover:text-gold cursor-pointer"
        >
          {expanded ? "Masquer ▲" : "Détails ▼"}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-line bg-ivory/40 p-4 md:p-5">
          {inquiry.message && (
            <p className="text-sm text-navy/80 whitespace-pre-line mb-4">
              {inquiry.message}
            </p>
          )}

          <p className="text-xs uppercase tracking-wide text-navy/40 mb-2">
            Notes internes
          </p>
          <div className="space-y-2 mb-3">
            {notes.map((note) => (
              <div key={note.id} className="text-sm bg-white rounded-lg p-3 ring-1 ring-line">
                <p className="text-navy/80">{note.note}</p>
                <p className="text-xs text-navy/40 mt-1">{formatDate(note.created_at)}</p>
              </div>
            ))}
            {notes.length === 0 && (
              <p className="text-sm text-navy/40">Aucune note pour le moment.</p>
            )}
          </div>

          <div className="flex gap-2">
            <input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Ajouter une note..."
              className="flex-1 rounded-lg border border-line px-3 py-2 text-sm bg-white"
            />
            <button
              type="button"
              disabled={isPending || !noteText.trim()}
              onClick={() =>
                startTransition(async () => {
                  await addInquiryNote(inquiry.id, noteText);
                  setNoteText("");
                })
              }
              className="rounded-lg bg-navy text-ivory text-sm px-4 py-2 disabled:opacity-50 cursor-pointer"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function InquiriesTable({
  inquiries,
  propertyNames,
  notesByInquiry,
}: {
  inquiries: Inquiry[];
  propertyNames: Record<string, string>;
  notesByInquiry: Record<string, InquiryNote[]>;
}) {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return inquiries.filter((i) => {
      if (statusFilter && i.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !i.full_name.toLowerCase().includes(q) &&
          !i.phone.includes(q) &&
          !i.reference.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [inquiries, statusFilter, search]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, téléphone, référence..."
          className="rounded-full border border-line px-4 py-2 text-sm bg-white min-w-[240px]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-full border border-line px-4 py-2 text-sm bg-white"
        >
          <option value="">Tous les statuts</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => downloadCsv(filtered, propertyNames)}
          className="ml-auto rounded-full bg-navy text-ivory text-sm px-5 py-2 cursor-pointer"
        >
          Exporter en CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-navy/60">Aucune demande ne correspond.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((inquiry) => (
            <InquiryRow
              key={inquiry.id}
              inquiry={inquiry}
              propertyName={inquiry.property_id ? propertyNames[inquiry.property_id] ?? "" : ""}
              notes={notesByInquiry[inquiry.id] ?? []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
