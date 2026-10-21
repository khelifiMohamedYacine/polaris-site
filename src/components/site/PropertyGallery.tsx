"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { ImageKind, PropertyImage } from "@/types/database";
import { imageUrl } from "@/lib/storage";
import { ArrowIcon } from "./icons";

type Labels = Record<ImageKind, string> & { previous: string; next: string };

/** Apartment (interior) photos open first; the building photos are one tab away. Swipe on phones. */
export function PropertyGallery({
  images,
  alt,
  labels,
}: {
  images: PropertyImage[];
  alt: string;
  labels: Labels;
}) {
  const byKind: Record<ImageKind, PropertyImage[]> = {
    interior: images.filter((img) => img.kind === "interior"),
    building: images.filter((img) => img.kind === "building"),
  };
  const kinds = (["interior", "building"] as const).filter((k) => byKind[k].length > 0);

  const [kind, setKind] = useState<ImageKind>(kinds[0] ?? "interior");
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const shown = byKind[kind];

  if (shown.length === 0) {
    return (
      <div className="aspect-[4/3] sm:aspect-[16/10] rounded-xl bg-navy/5 flex items-center justify-center">
        <span className="font-display text-xl text-navy/30">POLARIS Construction</span>
      </div>
    );
  }

  const go = (step: number) => setActive((i) => (i + step + shown.length) % shown.length);

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    // Swiping towards the reading direction's start shows the next photo.
    const rtl = document.documentElement.dir === "rtl";
    go((dx < 0) !== rtl ? 1 : -1);
  }

  const arrowClass =
    "absolute top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-navy shadow-lg backdrop-blur transition hover:bg-white cursor-pointer";

  return (
    <div>
      {kinds.length > 1 && (
        <div className="mb-3 flex gap-1 rounded-full bg-navy/5 p-1 w-fit max-w-full overflow-x-auto" role="tablist">
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
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                k === kind ? "bg-navy text-ivory" : "text-navy/70 hover:text-navy"
              }`}
            >
              {labels[k]} <span className="opacity-60">({byKind[k].length})</span>
            </button>
          ))}
        </div>
      )}

      <div
        className="relative aspect-[4/3] sm:aspect-[16/10] rounded-xl overflow-hidden bg-navy-light select-none"
        onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
        onTouchEnd={onTouchEnd}
      >
        <Image
          key={shown[active].id}
          src={imageUrl(shown[active].id)}
          alt={shown[active].caption || alt}
          fill
          priority
          className="object-cover"
          sizes="(min-width: 1024px) 800px, 100vw"
        />
        {shown.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} className={`${arrowClass} start-3`} aria-label={labels.previous}>
              <ArrowIcon back />
            </button>
            <button type="button" onClick={() => go(1)} className={`${arrowClass} end-3`} aria-label={labels.next}>
              <ArrowIcon />
            </button>
            <span className="absolute bottom-3 end-3 rounded-full bg-navy/75 px-3 py-1 text-xs font-medium text-ivory backdrop-blur" dir="ltr">
              {active + 1} / {shown.length}
            </span>
          </>
        )}
      </div>

      {shown.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 snap-x">
          {shown.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-20 sm:h-20 sm:w-28 shrink-0 snap-start rounded-lg overflow-hidden ring-2 transition-opacity cursor-pointer ${
                i === active ? "ring-gold" : "ring-transparent opacity-60 hover:opacity-100"
              }`}
              aria-label={`${alt} ${i + 1}`}
            >
              <Image src={imageUrl(img.id)} alt="" fill className="object-cover" sizes="112px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
