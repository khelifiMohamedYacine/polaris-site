import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "ar"],
  defaultLocale: "fr",
  pathnames: {
    "/": "/",
    "/projets": {
      fr: "/projets",
      ar: "/projects",
    },
    "/projets/[slug]": {
      fr: "/projets/[slug]",
      ar: "/projects/[slug]",
    },
    "/a-propos": {
      fr: "/a-propos",
      ar: "/about",
    },
    "/contact": {
      fr: "/contact",
      ar: "/contact",
    },
  },
});

export type AppLocale = (typeof routing.locales)[number];
