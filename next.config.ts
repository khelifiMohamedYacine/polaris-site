import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Let phones on the same Wi-Fi load dev scripts (menu, forms…) via this PC's
// local IP — Next.js blocks other origins in dev by default. Dev-only setting.
const localIps = Object.values(networkInterfaces())
  .flat()
  .filter((net) => net && net.family === "IPv4" && !net.internal)
  .map((net) => net!.address);

const nextConfig: NextConfig = {
  allowedDevOrigins: localIps,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Database drivers load native/WASM files at runtime — keep them out of the bundle.
  serverExternalPackages: ["pg", "@electric-sql/pglite"],
};

export default withNextIntl(nextConfig);
