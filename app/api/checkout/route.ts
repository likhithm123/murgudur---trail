import { createOrder } from "@/lib/store";
import { createPaymentIntent } from "@/lib/payment";
import { sendInvoiceEmail } from "@/lib/email";
import { checkoutSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = checkoutSchema.parse(await request.json());
  const order = await createOrder(body.email, body.addressId, body.items, body.currency);
  const payment = await createPaymentIntent(order);
  const email = await sendInvoiceEmail(body.email, order);
  return Response.json({ order, payment, email });
}
