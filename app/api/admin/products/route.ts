import { createProduct, deleteProduct, products, requireAdmin, updateProduct } from "@/lib/store";
import { productSchema } from "@/lib/validators";

export async function GET() { return Response.json(products); }

export async function POST(request: Request) {
  requireAdmin(request.headers.get("x-user-email"));
  const body = productSchema.parse(await request.json());
  const product = createProduct({ ...body, variants: body.variants.map((v) => ({ ...v, id: v.id || `v_${Math.random().toString(36).slice(2, 8)}` })) });
  return Response.json(product);
}

export async function PATCH(request: Request) {
  requireAdmin(request.headers.get("x-user-email"));
  const body = productSchema.parse(await request.json());
  if (!body.id) return new Response("id required", { status: 400 });
  const product = updateProduct(body.id, { ...body, variants: body.variants.map((v) => ({ ...v, id: v.id || `v_${Math.random().toString(36).slice(2, 8)}` })) });
  return Response.json(product);
}

export async function DELETE(request: Request) {
  requireAdmin(request.headers.get("x-user-email"));
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return new Response("id required", { status: 400 });
  deleteProduct(id);
  return Response.json({ ok: true });
}
