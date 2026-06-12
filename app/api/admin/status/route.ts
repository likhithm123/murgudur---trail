import { requireAdmin } from "@/lib/users-db";
import { updateOrderStatus } from "@/lib/orders-db";
import { pushDeliveryUpdate } from "@/lib/delivery";
import { statusSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    await requireAdmin(request.headers.get("x-user-email"));
    const body = statusSchema.parse(await request.json());
    const order = await updateOrderStatus(body.orderId, body.status, body.note);
    const delivery = await pushDeliveryUpdate(order, body.status);
    return Response.json({ order, delivery });
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
}
