import { inventorySchema } from "@/lib/validators";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  // validate admin from DB rather than demo store
  const email = request.headers.get("x-user-email");
  const adminCheck = await prisma.user.findUnique({ where: { email: email ?? undefined } });
  if (!adminCheck || adminCheck.role !== "ADMIN") return new Response("Forbidden", { status: 403 });
  const body = inventorySchema.parse(await request.json());
  // update variant quantity in DB
  await prisma.productVariant.update({ where: { id: body.variantId }, data: { quantity: body.quantity } });
  const product = await prisma.product.findUnique({ where: { id: body.productId }, include: { variants: true } });
  return Response.json(product);
}
