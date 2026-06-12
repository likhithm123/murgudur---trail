import { requestReturn } from "@/lib/orders-db";
import { returnSchema } from "@/lib/validators";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = returnSchema.parse(await request.json());
    const order = await requestReturn(id, body.email, body.reason, body.proofUrl);
    return Response.json(order);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Return failed";
    return Response.json({ message }, { status: 400 });
  }
}
