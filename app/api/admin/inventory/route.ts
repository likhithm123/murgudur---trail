import { requireAdmin, updateVariantQuantity } from "@/lib/store";
import { inventorySchema } from "@/lib/validators";

export async function POST(request: Request) {
  try { requireAdmin(request.headers.get("x-user-email")); } catch { return new Response("Forbidden", { status: 403 }); }
  const body = inventorySchema.parse(await request.json());
  const product = updateVariantQuantity(body.productId, body.variantId, body.quantity);
  return Response.json(product);
}
