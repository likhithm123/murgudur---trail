import { productSchema } from "@/lib/validators";
import { prisma } from "@/lib/db";

function dbImages(body: { image: string; gallery?: string[] }) {
  return [body.image, ...(body.gallery ?? [])].filter((url) => url && !url.startsWith("blob:") && !url.startsWith("data:"));
}

function mapCategoryToPrisma(cat: string) {
  const m: Record<string, string> = { men: "MEN", women: "WOMEN", handbag: "HANDBAG", watches: "WATCHES" };
  return m[cat] ?? "MEN";
}

function mapCategoryFromPrisma(cat: string) {
  return cat === "MEN" ? "men" : cat === "WOMEN" ? "women" : cat === "HANDBAG" ? "handbag" : cat === "WATCHES" ? "watches" : "men";
}

export async function GET() {
  const items = await prisma.product.findMany({ include: { variants: true } });
  return Response.json(items.map((p: any) => ({
    id: p.id,
    name: p.name,
    category: mapCategoryFromPrisma(p.category),
    description: p.description,
    priceInr: p.priceInr,
    image: (p.images ?? [])[0] ?? "",
    gallery: (p.images ?? []).slice(1),
    variants: (p.variants ?? []).map((v: any) => ({ id: v.id, color: v.color, size: v.size, quantity: v.quantity }))
  })));
}

export async function POST(request: Request) {
  const email = request.headers.get("x-user-email");
  const adminCheck = await prisma.user.findUnique({ where: { email: email ?? undefined } });
  if (!adminCheck || adminCheck.role !== "ADMIN") return new Response("Forbidden", { status: 403 });
  const body = productSchema.parse(await request.json());
  // create slug
  const slug = (body.name || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-\-]/g, "");
  // map category to Prisma enum names
  const categoryMap: Record<string, string> = { men: "MEN", women: "WOMEN", handbag: "HANDBAG", watches: "WATCHES" };
  try {
    const created = await prisma.product.create({
      data: {
        slug,
        name: body.name,
        category: (categoryMap[body.category] as any) || (body.category as any),
        description: body.description,
        priceInr: Math.round(body.priceInr),
        images: dbImages(body),
        variants: {
          create: body.variants.map((v: any) => ({ color: v.color, size: v.size, quantity: v.quantity }))
        }
      },
      include: { variants: true }
    });

    return Response.json(created);
  } catch (err: any) {
    console.error('Failed creating product:', err?.message ?? err);
    return new Response(JSON.stringify({ message: 'DB create failed', error: err?.message ?? String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function PATCH(request: Request) {
  const email = request.headers.get("x-user-email");
  const adminCheck = await prisma.user.findUnique({ where: { email: email ?? undefined } });
  if (!adminCheck || adminCheck.role !== "ADMIN") return new Response("Forbidden", { status: 403 });
  const body = productSchema.parse(await request.json());
  if (!body.id) return new Response("id required", { status: 400 });
  // update product and variants
  const prod = await prisma.product.update({
    where: { id: body.id },
    data: {
      name: body.name,
      description: body.description,
      priceInr: Math.round(body.priceInr),
      images: dbImages(body),
      category: mapCategoryToPrisma(body.category) as "MEN" | "WOMEN" | "HANDBAG" | "WATCHES",
    },
    include: { variants: true }
  });
  // sync variants: naive approach - delete existing and recreate
  await prisma.productVariant.deleteMany({ where: { productId: body.id } });
  await prisma.productVariant.createMany({ data: body.variants.map((v) => ({ productId: body.id!, color: v.color, size: v.size, quantity: v.quantity })) });
  const updated = await prisma.product.findUnique({ where: { id: body.id }, include: { variants: true } });
  return Response.json(updated);
}

export async function DELETE(request: Request) {
  const email = request.headers.get("x-user-email");
  const adminCheck = await prisma.user.findUnique({ where: { email: email ?? undefined } });
  if (!adminCheck || adminCheck.role !== "ADMIN") return new Response("Forbidden", { status: 403 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return new Response("id required", { status: 400 });
  await prisma.product.delete({ where: { id } });
  return Response.json({ ok: true });
}
