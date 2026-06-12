import { requireAdmin, resolveReturn } from "@/lib/store";
import { resolveReturnSchema } from "@/lib/validators";

export async function POST(request: Request) {
  requireAdmin(request.headers.get("x-user-email"));
  const body = resolveReturnSchema.parse(await request.json());
  const order = resolveReturn(body.orderId, body.status, body.adminNote);
  return Response.json(order);
}
