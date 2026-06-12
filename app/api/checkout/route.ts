import { createOrder } from "@/lib/orders-db";
import { createPaymentIntent } from "@/lib/payment";
import { sendInvoiceEmail } from "@/lib/email";
import { checkoutSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = checkoutSchema.parse(await request.json());
    const order = await createOrder(body.email, body.addressId, body.items, body.currency);
    const payment = await createPaymentIntent(order);
    const email = await sendInvoiceEmail(body.email, order);
    return Response.json({ order, payment, email });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return Response.json({ message }, { status: 400 });
  }
}
