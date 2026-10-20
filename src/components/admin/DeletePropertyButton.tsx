"use client";

import { useState, useTransition } from "react";
import { deleteProperty } from "@/lib/actions/properties";

export function DeletePropertyButton({ propertyId, name }: { propertyId: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm font-medium text-red-600 hover:underline cursor-pointer"
      >
        Supprimer le projet
      </button>
    );
  }

  return (
    <div className="rounded-lg bg-red-50 ring-1 ring-red-600/20 p-4">
      <p className="text-sm text-red-700">
        Confirmer la suppression définitive de « {name} » ? Cette action est
        irréversible et supprimera aussi ses photos.
      </p>
      <div className="mt-3 flex gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => deleteProperty(propertyId))}
          className="rounded-full bg-red-600 text-white text-sm font-semibold px-5 py-2 disabled:opacity-60 cursor-pointer"
        >
          {isPending ? "Suppression..." : "Oui, supprimer"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-full bg-white ring-1 ring-line text-sm font-medium px-5 py-2 cursor-pointer"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
