import { products } from "@/lib/store";
import type { Category } from "@/lib/types";

export const revalidate = 300;

export function GET(request: Request) {
  const category = new URL(request.url).searchParams.get("category") as Category | null;
  return Response.json(category ? products.filter((item) => item.category === category) : products);
}
