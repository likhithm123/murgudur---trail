import { cancelOrder } from "@/lib/store";
import { z } from "zod";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { email, reason } = z.object({ email: z.string().email(), reason: z.string().min(3) }).parse(await request.json());
  const order = cancelOrder(id, email, reason);
  return Response.json(order);
}
