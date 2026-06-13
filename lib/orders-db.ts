import { prisma } from "./db";
import { getDiscountedPrice } from "./locale";
import type { Address, CartItem, Currency, Order, OrderStatus, Product, ReturnStatus } from "./types";

type DbOrder = Awaited<ReturnType<typeof fetchOrderById>>;

function mapAddress(a: { id: string; fullName: string; phone: string; line1: string; line2: string | null; city: string; state: string; pincode: string }): Address {
  return {
    id: a.id,
    fullName: a.fullName,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2 ?? "",
    city: a.city,
    state: a.state,
    pincode: a.pincode
  };
}

export function mapDbOrder(order: NonNullable<DbOrder>): Order {
  return {
    id: order.id,
    orderNo: order.orderNo,
    customerId: order.userId,
    customerEmail: order.user.email,
    address: mapAddress(order.address),
    items: order.items.map((item: any) => ({
      productId: item.productId,
      variantId: item.variantId ?? "",
      qty: item.qty,
      name: item.name,
      color: item.color ?? "",
      size: item.size ?? "",
      price: item.priceInr
    })),
    currency: (order.currency as Currency) || "INR",
    subtotal: order.subtotalInr,
    delivery: order.deliveryInr,
    total: order.totalInr,
    paymentStatus: order.paymentStatus,
    paymentGatewayOrderId: order.paymentGatewayOrderId ?? undefined,
    trackingId: order.trackingId,
    status: order.status as OrderStatus,
   statusHistory: order.statusHistory.map((h: any) => ({
      status: h.status as OrderStatus,
      note: h.note,
      at: h.createdAt.toISOString(),
      actor: h.actor as "system" | "admin" | "delivery" | "customer"
    })),
    invoiceNo: order.invoiceNo,
    invoiceUrl: order.invoiceUrl ?? `/api/orders/${order.id}/invoice`,
    returnRequest: order.returnStatus
      ? {
          id: order.id,
          reason: order.returnReason ?? "",
          proofUrl: order.returnProofUrl ?? "",
          status: order.returnStatus as ReturnStatus,
          requestedAt: order.returnRequestedAt?.toISOString() ?? "",
          resolvedAt: order.returnResolvedAt?.toISOString(),
          adminNote: order.returnAdminNote ?? undefined
        }
      : undefined,
    createdAt: order.createdAt.toISOString()
  };
}

const orderInclude = {
  user: true,
  address: true,
  items: true,
  statusHistory: { orderBy: { createdAt: "asc" as const } }
};

async function fetchOrderById(id: string) {
  return prisma.order.findUnique({ where: { id }, include: orderInclude });
}

function productForPricing(p: { priceInr: number; discountPercent?: number }): Product {
  return {
    id: "",
    name: "",
    category: "men",
    priceUsd: 0,
    priceEur: 0,
    priceInr: p.priceInr,
    discountPercent: p.discountPercent,
    variants: [],
    colorImages: [],
    image: "",
    description: ""
  };
}

export async function listOrders(email?: string | null) {
  const orders = await prisma.order.findMany({
    where: email ? { user: { email } } : undefined,
    include: orderInclude,
    orderBy: { createdAt: "desc" }
  });
  return orders.map(mapDbOrder);
}

export async function getOrderById(id: string) {
  const order = await fetchOrderById(id);
  if (!order) throw new Error("Order not found");
  return mapDbOrder(order);
}

export async function createOrder(email: string, addressId: string, items: CartItem[], currency: Currency = "INR") {
  const user = await prisma.user.findUnique({ where: { email }, include: { addresses: true } });
  if (!user) throw new Error("Customer not found");

const address = user.addresses.find((item: any) => item.id === addressId);
  if (!address) throw new Error("Address required");

  const orderCount = await prisma.order.count();
  const orderNo = `MGD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(6, "0")}`;
  const trackingId = `TRK${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;
  const invoiceNo = `INV-${orderNo}`;

  const hydrated = await Promise.all(items.map(async (item) => {
    const product = await prisma.product.findUnique({ where: { id: item.productId }, include: { variants: true } });
    if (!product) throw new Error("Invalid product");
    const variant = product.variants.find((entry: any) => entry.id === item.variantId);
    if (!variant) throw new Error("Invalid product variant");
    if (variant.quantity < item.qty) throw new Error(`${product.name} ${variant.color}/${variant.size} is out of stock`);

    const priced = productForPricing({ priceInr: product.priceInr });
    const price = getDiscountedPrice(priced, currency);
    return {
      productId: product.id,
      variantId: variant.id,
      qty: item.qty,
      name: product.name,
      color: variant.color,
      size: variant.size,
      price
    };
  }));

  const subtotal = hydrated.reduce((sum, item) => sum + item.price * item.qty, 0);
  const threshold = currency === "INR" ? 100000 : currency === "EUR" ? 1200 : 1300;
  const delivery = subtotal > threshold ? 0 : currency === "INR" ? 900 : currency === "EUR" ? 12 : 15;
  const total = subtotal + delivery;

  const order = await prisma.$transaction(async (tx: any) => {
    for (const item of hydrated) {
      const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
      if (!variant || variant.quantity < item.qty) throw new Error("Insufficient stock");
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { quantity: { decrement: item.qty } }
      });
    }

    return tx.order.create({
      data: {
        orderNo,
        userId: user.id,
        addressId: address.id,
        currency,
        subtotalInr: subtotal,
        deliveryInr: delivery,
        totalInr: total,
        paymentStatus: "PAID",
        paymentGatewayOrderId: `RAZORPAY_STUB_${Date.now()}`,
        trackingId,
        status: "PLACED",
        invoiceNo,
        invoiceUrl: null,
        items: {
          create: hydrated.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            color: item.color,
            size: item.size,
            priceInr: item.price,
            qty: item.qty
          }))
        },
        statusHistory: {
          create: { status: "PLACED", note: "Order placed successfully.", actor: "system" }
        }
      },
      include: orderInclude
    });
  });

  const mapped = mapDbOrder(order);
  mapped.invoiceUrl = `/api/orders/${order.id}/invoice`;
  await prisma.order.update({ where: { id: order.id }, data: { invoiceUrl: mapped.invoiceUrl } });
  return mapped;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, note: string, actor: "admin" | "delivery" | "customer" | "system" = "admin") {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      ...(status === "REFUNDED" ? { paymentStatus: "REFUNDED" as const } : {}),
      statusHistory: { create: { status, note, actor } }
    },
    include: orderInclude
  });
  return mapDbOrder(order);
}

export async function cancelOrder(orderId: string, email: string, reason: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { user: true, items: true } });
  if (!order) throw new Error("Order not found");
  if (order.user.email !== email) throw new Error("Forbidden");
  if (!["PLACED", "CONFIRMED"].includes(order.status)) throw new Error("Order cannot be cancelled");

  await prisma.$transaction(async (tx: any) => {
    for (const item of order.items) {
      if (!item.variantId) continue;
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { quantity: { increment: item.qty } }
      });
    }
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        statusHistory: { create: { status: "CANCELLED", note: reason, actor: "customer" } }
      }
    });
  });

  return getOrderById(orderId);
}

export async function requestReturn(orderId: string, email: string, reason: string, proofUrl: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { user: true } });
  if (!order) throw new Error("Order not found");
  if (order.user.email !== email) throw new Error("Forbidden");
  if (order.status !== "DELIVERED") throw new Error("Only delivered orders can be returned");
  if (order.returnStatus) throw new Error("Return already requested");

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "RETURN_REQUESTED",
      returnReason: reason,
      returnProofUrl: proofUrl,
      returnStatus: "REQUESTED",
      returnRequestedAt: new Date(),
      statusHistory: { create: { status: "RETURN_REQUESTED", note: `Return requested: ${reason}`, actor: "customer" } }
    }
  });

  return getOrderById(orderId);
}

export async function resolveReturn(orderId: string, status: ReturnStatus, adminNote: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order?.returnStatus) throw new Error("No return request");

  if (status === "APPROVED") {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "RETURNED",
        returnStatus: "APPROVED",
        returnAdminNote: adminNote,
        returnResolvedAt: new Date(),
        statusHistory: { create: { status: "RETURNED", note: adminNote, actor: "admin" } }
      }
    });
  } else if (status === "REFUNDED") {
  await prisma.$transaction(async (tx: any) => {
      for (const item of order.items) {
        if (!item.variantId) continue;
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { quantity: { increment: item.qty } }
        });
      }
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "REFUNDED",
          paymentStatus: "REFUNDED",
          returnStatus: "REFUNDED",
          returnAdminNote: adminNote,
          returnResolvedAt: new Date(),
          statusHistory: { create: { status: "REFUNDED", note: adminNote, actor: "admin" } }
        }
      });
    });
  } else if (status === "REJECTED") {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "DELIVERED",
        returnStatus: "REJECTED",
        returnAdminNote: adminNote,
        returnResolvedAt: new Date(),
        statusHistory: { create: { status: "DELIVERED", note: adminNote, actor: "admin" } }
      }
    });
  }

  return getOrderById(orderId);
}

export async function getSalesSummary() {
  const orders = await prisma.order.findMany({ select: { totalInr: true, status: true, returnStatus: true } });
return {
  revenueInr: orders.reduce((sum: number, order: any) => sum + order.totalInr, 0),

  orders: orders.length,

  pending: orders.filter((o: any) =>
    !["DELIVERED", "CANCELLED", "REFUNDED"].includes(o.status)
  ).length,

  delivered: orders.filter((o: any) =>
    o.status === "DELIVERED"
  ).length,

  returns: orders.filter((o: any) =>
    o.returnStatus === "REQUESTED"
  ).length
};
}
