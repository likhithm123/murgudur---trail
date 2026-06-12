import { cancelOrder } from "@/lib/orders-db";
import { z } from "zod";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { email, reason } = z.object({ email: z.string().email(), reason: z.string().min(3) }).parse(await request.json());
    const order = await cancelOrder(id, email, reason);
    return Response.json(order);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cancel failed";
    return Response.json({ message }, { status: 400 });
  }
}
