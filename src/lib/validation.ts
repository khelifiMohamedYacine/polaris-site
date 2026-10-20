import { z } from "zod";

export const inquirySchema = z.object({
  propertyId: z.string().uuid().nullable(),
  fullName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .min(6)
    .max(30)
    .regex(/^[0-9+()\s.-]+$/),
  email: z.union([z.string().trim().email(), z.literal("")]).optional(),
  message: z.string().trim().min(5).max(2000),
  locale: z.enum(["fr", "ar"]),
  // Honeypot field: real visitors never fill this in.
  website: z.string().max(0).optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export const propertySchema = z.object({
  city: z.string().trim().min(2).max(120),
  neighborhood: z.string().trim().max(120).optional().or(z.literal("")),
  address: z.string().trim().max(250).optional().or(z.literal("")),
  status: z.enum(["available", "few_left", "sold_out"]),
  isNew: z.boolean(),
  unitsAvailable: z.coerce.number().int().min(0).max(9999).optional(),
  price: z.coerce.number().min(0).optional(),
  priceCurrency: z.literal("DZD"),
  showPrice: z.boolean(),
  publicationStatus: z.enum(["draft", "published", "archived"]),
  nameFr: z.string().trim().min(2).max(160),
  shortDescriptionFr: z.string().trim().max(300).optional().or(z.literal("")),
  descriptionFr: z.string().trim().max(5000).optional().or(z.literal("")),
  nameAr: z.string().trim().max(160).optional().or(z.literal("")),
  shortDescriptionAr: z.string().trim().max(300).optional().or(z.literal("")),
  descriptionAr: z.string().trim().max(5000).optional().or(z.literal("")),
});

export type PropertyInput = z.infer<typeof propertySchema>;
