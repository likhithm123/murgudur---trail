import { getSalesSummary, requireAdmin } from "@/lib/store";

export function GET(request: Request) {
  try { requireAdmin(request.headers.get("x-user-email")); } catch { return new Response("Forbidden", { status: 403 }); }
  return Response.json(getSalesSummary());
}
