import { getOrderById } from "@/lib/orders-db";
import { createSimpleInvoicePdf } from "@/lib/pdf";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);
    const rows = order.items.map((item) => `${item.name} (${item.color}/${item.size}) x ${item.qty} - ${order.currency} ${item.price * item.qty}`);
    const invoice = [
      "MURGDUR INVOICE",
      `Invoice: ${order.invoiceNo}`,
      `Order: ${order.orderNo}`,
      `Tracking: ${order.trackingId}`,
      "",
      ...rows,
      "",
      `Subtotal: ${order.currency} ${order.subtotal}`,
      `Delivery: ${order.currency} ${order.delivery}`,
      `Total: ${order.currency} ${order.total}`,
      "",
      `Ship To: ${order.address.fullName}, ${order.address.line1}, ${order.address.city}, ${order.address.state} ${order.address.pincode}`
    ];
    const pdf = createSimpleInvoicePdf(invoice);

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${order.invoiceNo}.pdf"`
      }
    });
  } catch {
    return new Response("Order not found", { status: 404 });
  }
}
