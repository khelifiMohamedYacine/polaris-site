// Lightweight endpoint for the hosting platform's health check — no database access.
export function GET() {
  return Response.json({ status: "ok" });
}
