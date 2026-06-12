import { sanitizeCustomer } from "@/lib/auth-otp";
import { getCustomer, updateCustomer } from "@/lib/store";

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email");
  if (!email) return new Response("email required", { status: 400 });
  const customer = getCustomer(email);
  if (!customer) return new Response("Not found", { status: 404 });
  return Response.json(sanitizeCustomer(customer));
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const customer = updateCustomer(body.email, { name: body.name, phone: body.phone });
  return Response.json(sanitizeCustomer(customer));
}
