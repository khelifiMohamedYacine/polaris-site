"use client";

import { useState } from "react";
import Image from "next/image";
import type { PropertyImage } from "@/types/database";
import { getPublicImageUrl } from "@/lib/storage";

export function PropertyGallery({
  images,
  alt,
}: {
  images: PropertyImage[];
  alt: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
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
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-navy-light">
        <Image
          src={getPublicImageUrl(images[active].storage_path)}
          alt={images[active].caption || alt}
          fill
          priority
          className="object-cover"
          sizes="(min-width: 1024px) 760px, 100vw"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 sm:grid-cols-6 gap-2">
          {images.map((img, i) => (
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
                src={getPublicImageUrl(img.storage_path)}
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
