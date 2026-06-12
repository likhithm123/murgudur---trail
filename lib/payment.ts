import type { Order } from "./types";

export async function createPaymentIntent(order: Order) {
  return {
    provider: "razorpay",
    enabled: false,
    message: "Add Razorpay key_id/key_secret and replace this stub with Razorpay Orders API.",
    amount: order.total * 100,
    currency: order.currency,
    receipt: order.orderNo,
    gatewayOrderId: order.paymentGatewayOrderId
  };
}
