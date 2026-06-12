import { listOrders } from "@/lib/orders-db";

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email");
  const orders = await listOrders(email);
  return Response.json(orders);
}
