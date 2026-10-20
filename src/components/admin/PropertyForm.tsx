"use client";

import { useActionState } from "react";
import { updateProperty, type SavePropertyState } from "@/lib/actions/properties";
import type { Property, PropertyTranslation } from "@/types/database";

const initialState: SavePropertyState = { error: null };

const inputClass =
  "w-full rounded-lg border border-line bg-white px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold/50";
const labelClass = "block text-sm font-medium text-navy mb-1.5";

export function PropertyForm({
  property,
  translations,
}: {
  property: Property;
  translations: PropertyTranslation[];
}) {
  const fr = translations.find((t) => t.locale === "fr");
  const ar = translations.find((t) => t.locale === "ar");
  const action = updateProperty.bind(null, property.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-10">
      <section>
        <h2 className="font-display text-lg text-navy mb-4">Informations générales</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Ville *</label>
            <input name="city" required defaultValue={property.city} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Quartier</label>
            <input name="neighborhood" defaultValue={property.neighborhood ?? ""} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Adresse</label>
            <input name="address" defaultValue={property.address ?? ""} className={inputClass} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg text-navy mb-4">Disponibilité et prix</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Statut du projet</label>
            <select name="status" defaultValue={property.status} className={inputClass}>
              <option value="available">Disponible</option>
              <option value="few_left">Dernières disponibilités</option>
              <option value="sold_out">Vendu</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Appartements disponibles</label>
            <input
              name="unitsAvailable"
              type="number"
              min={0}
              defaultValue={property.units_available ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Prix (DZD)</label>
            <input
              name="price"
              type="number"
              min={0}
              step="1000"
              defaultValue={property.price ?? ""}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col justify-end gap-3 pb-1">
            <label className="flex items-center gap-2 text-sm text-navy">
              <input type="checkbox" name="showPrice" defaultChecked={property.show_price} className="h-4 w-4" />
              Afficher le prix publiquement
            </label>
            <label className="flex items-center gap-2 text-sm text-navy">
              <input type="checkbox" name="isNew" defaultChecked={property.is_new} className="h-4 w-4" />
              Marquer comme « Nouveau »
            </label>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg text-navy mb-4">Contenu en français</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Nom du projet *</label>
            <input name="nameFr" required defaultValue={fr?.name ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Description courte</label>
            <input
              name="shortDescriptionFr"
              defaultValue={fr?.short_description ?? ""}
              maxLength={300}
              className={inputClass}
              placeholder="Affichée sur la carte du projet"
            />
          </div>
          <div>
            <label className={labelClass}>Description complète</label>
            <textarea
              name="descriptionFr"
              rows={6}
              defaultValue={fr?.description ?? ""}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg text-navy mb-4">
          Contenu en arabe <span className="text-navy/40 font-normal">(optionnel)</span>
        </h2>
        <div className="space-y-4" dir="rtl">
          <div>
            <label className={labelClass}>اسم المشروع</label>
            <input name="nameAr" defaultValue={ar?.name ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>وصف مختصر</label>
            <input
              name="shortDescriptionAr"
              defaultValue={ar?.short_description ?? ""}
              maxLength={300}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>الوصف الكامل</label>
            <textarea
              name="descriptionAr"
              rows={6}
              defaultValue={ar?.description ?? ""}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg text-navy mb-4">Publication</h2>
        <select name="publicationStatus" defaultValue={property.publication_status} className={inputClass}>
          <option value="draft">Brouillon (invisible sur le site)</option>
          <option value="published">Publié (visible sur le site)</option>
          <option value="archived">Archivé (retiré du site)</option>
        </select>
      </section>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg p-3">
          Projet enregistré avec succès.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-gold rounded-full px-8 py-3 text-sm font-semibold tracking-wide disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
