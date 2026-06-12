import { resolveReturn } from "@/lib/orders-db";
import { requireAdmin } from "@/lib/users-db";
import { resolveReturnSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    await requireAdmin(request.headers.get("x-user-email"));
    const body = resolveReturnSchema.parse(await request.json());
    const order = await resolveReturn(body.orderId, body.status, body.adminNote);
    return Response.json(order);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Return update failed";
    return Response.json({ message }, { status: 400 });
  }
}
