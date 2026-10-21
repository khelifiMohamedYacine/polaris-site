"use client";

import { useState } from "react";
import Image from "next/image";
import type { ImageKind, PropertyImage } from "@/types/database";
import { imageUrl } from "@/lib/storage";

/** Apartment (interior) photos open first; the building photos are one tab away. */
export function PropertyGallery({
  images,
  alt,
  labels,
}: {
  images: PropertyImage[];
  alt: string;
  labels: Record<ImageKind, string>;
}) {
  const byKind: Record<ImageKind, PropertyImage[]> = {
    interior: images.filter((img) => img.kind === "interior"),
    building: images.filter((img) => img.kind === "building"),
  };
  const kinds = (["interior", "building"] as const).filter((k) => byKind[k].length > 0);

  const [kind, setKind] = useState<ImageKind>(kinds[0] ?? "interior");
  const [active, setActive] = useState(0);

  const shown = byKind[kind];

  if (shown.length === 0) {
    return (
      <div className="aspect-[16/10] rounded-2xl bg-navy/5 ring-1 ring-line flex items-center justify-center">
        <span className="font-display text-xl text-navy/30">
          POLARIS Construction
        </span>
      </div>
    );
  }

  return (
    <div>
      {kinds.length > 1 && (
        <div className="mb-3 inline-flex rounded-full bg-navy/5 p-1" role="tablist">
          {kinds.map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={k === kind}
              onClick={() => {
                setKind(k);
                setActive(0);
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                k === kind ? "bg-navy text-ivory" : "text-navy/70 hover:text-navy"
              }`}
            >
              {labels[k]} ({byKind[k].length})
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-navy-light">
        <Image
          src={imageUrl(shown[active].id)}
          alt={shown[active].caption || alt}
          fill
          priority
          className="object-cover"
          sizes="(min-width: 1024px) 760px, 100vw"
        />
      </div>

      {shown.length > 1 && (
        <div className="mt-3 grid grid-cols-5 sm:grid-cols-6 gap-2">
          {shown.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={`relative aspect-square rounded-lg overflow-hidden ring-2 transition-opacity cursor-pointer ${
                i === active ? "ring-gold" : "ring-transparent opacity-70 hover:opacity-100"
              }`}
              aria-label={`${alt} ${i + 1}`}
            >
              <Image
                src={imageUrl(img.id)}
                alt=""
                fill
                className="object-cover"
                sizes="120px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
