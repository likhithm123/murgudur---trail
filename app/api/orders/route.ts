import { orders } from "@/lib/store";

export function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email");
  const all = Array.from(orders.values());
  if (!email) return Response.json(all);
  return Response.json(all.filter((order) => order.customerEmail === email));
}
