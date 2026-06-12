import { requestReturn } from "@/lib/store";
import { returnSchema } from "@/lib/validators";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = returnSchema.parse(await request.json());
  const order = requestReturn(id, body.email, body.reason, body.proofUrl);
  return Response.json(order);
}
