 import type { Order, OrderStatus } from "./types";

export async function pushDeliveryUpdate(order: Order, status: OrderStatus) {
  return {
    enabled: false,
    message: "Connect Shiprocket/Delhivery/BlueDart webhook here, or keep admin manual override.",
    trackingId: order.trackingId,
    status
  };
}
