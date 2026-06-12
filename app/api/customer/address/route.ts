import { sanitizeCustomer } from "@/lib/auth-otp";
import { deleteAddress, upsertAddress } from "@/lib/store";
import { addressSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json();
  const address = addressSchema.parse(body.address);
  upsertAddress(body.email, address);
  const customer = (await import("@/lib/store")).getCustomer(body.email)!;
  return Response.json(sanitizeCustomer(customer));
}

export async function DELETE(request: Request) {
  const body = await request.json();
  deleteAddress(body.email, body.addressId);
  const customer = (await import("@/lib/store")).getCustomer(body.email)!;
  return Response.json(sanitizeCustomer(customer));
}
