"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { getPublicImageUrl, STORAGE_BUCKET } from "@/lib/storage";
import {
  attachPropertyImage,
  removePropertyImage,
  setCoverImage,
  moveImage,
} from "@/lib/actions/properties";
import type { PropertyImage } from "@/types/database";

export function ImageUploader({
  propertyId,
  images,
}: {
  propertyId: string;
  images: PropertyImage[];
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const sorted = [...images].sort((a, b) => {
    if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1;
    return a.sort_order - b.sort_order;
  });

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    const supabase = createClient();

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 8 * 1024 * 1024) {
          setError("Chaque photo doit faire moins de 8 Mo.");
          continue;
        }
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${propertyId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, file, { cacheControl: "3600", upsert: false });

        if (uploadError) {
          setError("Échec de l'envoi d'une photo. Merci de réessayer.");
          continue;
        }

        await attachPropertyImage(propertyId, path);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-navy/20 bg-white px-6 py-10 text-center cursor-pointer hover:border-gold transition-colors">
        <span className="text-3xl" aria-hidden="true">📷</span>
        <span className="text-sm font-medium text-navy">
          {uploading ? "Envoi en cours..." : "Cliquez pour ajouter des photos"}
        </span>
        <span className="text-xs text-navy/50">JPG ou PNG, 8 Mo max par photo</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {sorted.length > 0 && (
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {sorted.map((img, i) => (
            <div
              key={img.id}
              className="relative rounded-xl overflow-hidden ring-1 ring-line bg-white"
            >
              <div className="relative aspect-square">
                <Image
                  src={getPublicImageUrl(img.storage_path)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="200px"
                />
                {img.is_cover && (
                  <span className="absolute top-2 left-2 rounded-full bg-gold px-2 py-0.5 text-[11px] font-semibold text-white">
                    Couverture
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 p-2 text-xs">
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={i === 0 || isPending}
                    onClick={() => startTransition(() => moveImage(img.id, propertyId, "up"))}
                    className="px-2 py-1 rounded bg-navy/5 hover:bg-navy/10 disabled:opacity-30 cursor-pointer"
                    aria-label="Monter"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={i === sorted.length - 1 || isPending}
                    onClick={() => startTransition(() => moveImage(img.id, propertyId, "down"))}
                    className="px-2 py-1 rounded bg-navy/5 hover:bg-navy/10 disabled:opacity-30 cursor-pointer"
                    aria-label="Descendre"
                  >
                    ↓
                  </button>
                </div>
                <div className="flex gap-1">
                  {!img.is_cover && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => startTransition(() => setCoverImage(img.id, propertyId))}
                      className="px-2 py-1 rounded bg-navy/5 hover:bg-navy/10 cursor-pointer"
                    >
                      Définir
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => startTransition(() => removePropertyImage(img.id, propertyId))}
                    className="px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
