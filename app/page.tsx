import CommerceApp from "@/components/commerce-app";
import { prisma } from "@/lib/db";
import type { Category, Product } from "@/lib/types";

export const revalidate = 300;

function mapCategory(cat: string): Category {
  return cat === "MEN" ? "men" : cat === "WOMEN" ? "women" : cat === "HANDBAG" ? "handbag" : cat === "WATCHES" ? "watches" : "men";
}

function mapProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    category: mapCategory(p.category),
    priceUsd: 0,
    priceEur: 0,
    priceInr: p.priceInr,
    discountPercent: p.discountPercent ?? 0,
    rating: p.rating ?? 4.5,
    deliveryDays: p.deliveryDays ?? 3,
    variants: (p.variants ?? []).map((v: any) => ({ id: v.id, color: v.color, size: v.size, quantity: v.quantity })),
    colorImages: [],
    gallery: (p.images ?? []).slice(1),
    image: (p.images ?? [])[0] ?? "",
    description: p.description
  };
}

export default async function Page() {
  const items = await prisma.product.findMany({ include: { variants: true } });
  const mapped = items.map(mapProduct);
  return <CommerceApp initialProducts={mapped} />;
}
