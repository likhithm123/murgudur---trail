import { requireAdmin, updateOrderStatus } from "@/lib/store";
import { pushDeliveryUpdate } from "@/lib/delivery";
import { statusSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try { requireAdmin(request.headers.get("x-user-email")); } catch { return new Response("Forbidden", { status: 403 }); }
  const body = statusSchema.parse(await request.json());
  const order = updateOrderStatus(body.orderId, body.status, body.note);
  const delivery = await pushDeliveryUpdate(order, body.status);
  return Response.json({ order, delivery });
}
