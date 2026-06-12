import { getSalesSummary } from "@/lib/orders-db";
import { requireAdmin } from "@/lib/users-db";

export async function GET(request: Request) {
  try {
    await requireAdmin(request.headers.get("x-user-email"));
    return Response.json(await getSalesSummary());
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}
