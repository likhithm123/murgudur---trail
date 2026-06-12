import { hashPassword } from "./auth-otp";
import { getProductPrice, REGION_CURRENCY } from "./locale";
import type { Address, CartItem, Category, ColorImage, Currency, Customer, Order, OrderStatus, Product, ProductVariant, ReturnRequest, ReturnStatus } from "./types";

const now = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

const img = (id: string, w = 1100) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=85`;

export const products: Product[] = [
  {
    id: "p-men-atelier-jacket", name: "Atelier Wool Jacket", category: "men",
    priceUsd: 890, priceEur: 820, priceInr: 74000, discountPercent: 12, rating: 4.9, deliveryDays: 3,
    variants: [
      { id: "v-men-jacket-black-m", color: "Black", size: "M", quantity: 12 },
      { id: "v-men-jacket-black-l", color: "Black", size: "L", quantity: 7 },
      { id: "v-men-jacket-ivory-m", color: "Ivory", size: "M", quantity: 5 }
    ],
    colorImages: [
      { color: "Black", image: img("1516257984-b1b4d707412e"), gallery: [img("1495122861825-6d25b1c3bdec"), img("1503342217505-ec10326bb57e")] },
      { color: "Ivory", image: img("1594938291221-94f836cbb54b"), gallery: [img("1491553895911-0055eca6402d"), img("1542089363-2921f1d7a38a")] }
    ],
    image: img("1516257984-b1b4d707412e"),
    description: "Structured evening jacket with hand-finished internal seams."
  },
  {
    id: "p-men-leather-duffle", name: "Travel Leather Duffle", category: "men",
    priceUsd: 1100, priceEur: 1020, priceInr: 92000, discountPercent: 8, rating: 4.8, deliveryDays: 2,
    variants: [
      { id: "v-duffle-tan-std", color: "Tan", size: "Standard", quantity: 9 },
      { id: "v-duffle-black-std", color: "Black", size: "Standard", quantity: 14 }
    ],
    colorImages: [
      { color: "Tan", image: img("1594223274512-ad4803739b7c") },
      { color: "Black", image: img("1553062407-98eeb64c6a62") }
    ],
    image: img("1594223274512-ad4803739b7c"),
    description: "Full grain leather travel bag with brass fittings."
  },
  {
    id: "p-women-silk-dress", name: "Silk Column Dress", category: "women",
    priceUsd: 670, priceEur: 620, priceInr: 56000, discountPercent: 10, rating: 4.7, deliveryDays: 4,
    variants: [
      { id: "v-dress-red-s", color: "Red", size: "S", quantity: 6 },
      { id: "v-dress-red-m", color: "Red", size: "M", quantity: 11 },
      { id: "v-dress-black-m", color: "Black", size: "M", quantity: 8 }
    ],
    colorImages: [
      { color: "Red", image: img("1529139574466-a303027c1d8b") },
      { color: "Black", image: img("1496747611176-843222e1e57c") }
    ],
    image: img("1529139574466-a303027c1d8b"),
    description: "Fluid silk evening dress cut for quiet movement."
  },
  {
    id: "p-women-cashmere-coat", name: "Cashmere Wrap Coat", category: "women",
    priceUsd: 1050, priceEur: 980, priceInr: 88000, discountPercent: 15, rating: 5.0, deliveryDays: 3,
    variants: [
      { id: "v-coat-camel-s", color: "Camel", size: "S", quantity: 4 },
      { id: "v-coat-camel-m", color: "Camel", size: "M", quantity: 10 }
    ],
    colorImages: [{ color: "Camel", image: img("1506629905607-d405d7d3b0d2") }],
    image: img("1506629905607-d405d7d3b0d2"),
    description: "Double-faced cashmere coat with tonal belt."
  },
  {
    id: "p-bag-saddle", name: "Saddle Handbag", category: "handbag",
    priceUsd: 810, priceEur: 750, priceInr: 68000, discountPercent: 5, rating: 4.5, deliveryDays: 4,
    variants: [
      { id: "v-saddle-brown-mini", color: "Brown", size: "Mini", quantity: 13 },
      { id: "v-saddle-pine-classic", color: "Pine", size: "Classic", quantity: 8 }
    ],
    colorImages: [
      { color: "Brown", image: img("1590736969955-71cc94901144") },
      { color: "Pine", image: img("1584917865442-89bbaaf44ee1") }
    ],
    image: img("1590736969955-71cc94901144"),
    description: "Compact leather handbag with an architectural flap."
  },
  {
    id: "p-watch-heritage", name: "Heritage Automatic Watch", category: "watches",
    priceUsd: 1490, priceEur: 1380, priceInr: 125000, discountPercent: 20, rating: 4.9, deliveryDays: 1,
    variants: [
      { id: "v-watch-steel-40", color: "Steel", size: "40mm", quantity: 5 },
      { id: "v-watch-gold-38", color: "Gold", size: "38mm", quantity: 3 }
    ],
    colorImages: [
      { color: "Steel", image: img("1524592094714-0f0654e20314") },
      { color: "Gold", image: img("1523275335684-37898b6baf30") }
    ],
    image: img("1524592094714-0f0654e20314"),
    description: "Automatic watch with brushed steel case and leather strap."
  }
];

const demoAddress: Address = {
  id: "addr_default", fullName: "Demo Customer", phone: "9999999999",
  line1: "MG Road", line2: "Apartment 12", city: "Bengaluru", state: "Karnataka", pincode: "560001", isDefault: true
};

export const customers = new Map<string, Customer>([
  ["demo@example.com", { id: "cust_demo", name: "Demo Customer", email: "demo@example.com", phone: "9999999999", role: "CUSTOMER", passwordHash: hashPassword("demo1234"), addresses: [demoAddress] }],
  ["admin@murgdur.com", { id: "admin_demo", name: "Murgdur Admin", email: "admin@murgdur.com", phone: "9999999999", role: "ADMIN", passwordHash: hashPassword("admin1234"), addresses: [] }]
]);

export const orders = new Map<string, Order>();

function seedOrders() {
  const p = products[0];
  const v = p.variants[0];
  const price = p.priceInr;
  const order: Order = {
    id: "ord_demo_1", orderNo: "MGD-2026-000001", customerId: "cust_demo", customerEmail: "demo@example.com",
    address: demoAddress,
    items: [{ productId: p.id, variantId: v.id, qty: 1, name: p.name, color: v.color, size: v.size, price }],
    currency: "INR", subtotal: price, delivery: 900, total: price + 900,
    paymentStatus: "PAID", trackingId: "TRK48291037", status: "SHIPPED",
    statusHistory: [
      { status: "PLACED", note: "Order placed.", at: "2026-06-01T10:00:00.000Z", actor: "system" },
      { status: "CONFIRMED", note: "Payment confirmed.", at: "2026-06-01T10:05:00.000Z", actor: "admin" },
      { status: "PACKED", note: "Packed at warehouse.", at: "2026-06-02T08:00:00.000Z", actor: "admin" },
      { status: "SHIPPED", note: "Handed to courier.", at: "2026-06-03T14:00:00.000Z", actor: "delivery" }
    ],
    invoiceNo: "INV-MGD-2026-000001", invoiceUrl: "/api/orders/ord_demo_1/invoice", createdAt: "2026-06-01T10:00:00.000Z"
  };
  orders.set(order.id, order);
}
seedOrders();

export function getCustomer(email: string) { return customers.get(email); }

export function createCustomer(data: { name: string; email: string; phone: string; password: string }) {
  if (customers.has(data.email)) throw new Error("Account already exists");
  const customer: Customer = { id: makeId("cust"), ...data, role: "CUSTOMER", passwordHash: hashPassword(data.password), addresses: [] };
  customers.set(data.email, customer);
  return customer;
}

export function updateCustomer(email: string, patch: Partial<Pick<Customer, "name" | "phone">>) {
  const customer = customers.get(email);
  if (!customer) throw new Error("Customer not found");
  Object.assign(customer, patch);
  return customer;
}

export function resetPassword(email: string, password: string) {
  const customer = customers.get(email);
  if (!customer) throw new Error("Customer not found");
  customer.passwordHash = hashPassword(password);
  return customer;
}

export function upsertAddress(email: string, address: Omit<Address, "id"> & { id?: string }) {
  const customer = customers.get(email);
  if (!customer) throw new Error("Customer not found");
  const saved: Address = { ...address, id: address.id || makeId("addr") };
  const index = customer.addresses.findIndex((item) => item.id === saved.id);
  if (index >= 0) customer.addresses[index] = saved;
  else customer.addresses.push(saved);
  if (saved.isDefault) customer.addresses.forEach((a) => { if (a.id !== saved.id) a.isDefault = false; });
  return saved;
}

export function deleteAddress(email: string, addressId: string) {
  const customer = customers.get(email);
  if (!customer) throw new Error("Customer not found");
  customer.addresses = customer.addresses.filter((a) => a.id !== addressId);
  return customer;
}

export function requireAdmin(email?: string | null) {
  const customer = email ? customers.get(email) : undefined;
  if (!customer || customer.role !== "ADMIN") throw new Error("Forbidden");
  return customer;
}

export function createProduct(data: Omit<Product, "id"> & { id?: string }) {
  const product: Product = { ...data, id: data.id || makeId("p") };
  products.push(product);
  return product;
}

export function updateProduct(id: string, patch: Partial<Omit<Product, "id">>) {
  const index = products.findIndex((p) => p.id === id);
  if (index < 0) throw new Error("Product not found");
  products[index] = { ...products[index], ...patch };
  return products[index];
}

export function deleteProduct(id: string) {
  const index = products.findIndex((p) => p.id === id);
  if (index < 0) throw new Error("Product not found");
  products.splice(index, 1);
}

export async function createOrder(email: string, addressId: string, items: CartItem[], currency: Currency = "INR") {
  const customer = customers.get(email);
  if (!customer) throw new Error("Customer not found");
  const address = customer.addresses.find((item) => item.id === addressId);
  if (!address) throw new Error("Address required");

  const hydrated = items.map((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product) throw new Error("Invalid product");
    const variant = product.variants.find((entry) => entry.id === item.variantId);
    if (!variant) throw new Error("Invalid product variant");
    if (variant.quantity < item.qty) throw new Error(`${product.name} ${variant.color}/${variant.size} is out of stock`);
    variant.quantity -= item.qty;
    const price = getProductPrice(product, currency);
    return { ...item, name: product.name, color: variant.color, size: variant.size, price };
  });

  const subtotal = hydrated.reduce((sum, item) => sum + item.price * item.qty, 0);
  const threshold = currency === "INR" ? 100000 : currency === "EUR" ? 1200 : 1300;
  const delivery = subtotal > threshold ? 0 : currency === "INR" ? 900 : currency === "EUR" ? 12 : 15;
  const id = makeId("ord");
  const orderNo = `MGD-${new Date().getFullYear()}-${String(orders.size + 1).padStart(6, "0")}`;
  const trackingId = `TRK${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;
  const order: Order = {
    id, orderNo, customerId: customer.id, customerEmail: customer.email, address,
    items: hydrated, currency, subtotal, delivery, total: subtotal + delivery,
    paymentStatus: "PAID", paymentGatewayOrderId: `RAZORPAY_STUB_${id}`,
    trackingId, status: "PLACED",
    statusHistory: [{ status: "PLACED", note: "Order placed successfully.", at: now(), actor: "system" }],
    invoiceNo: `INV-${orderNo}`, invoiceUrl: `/api/orders/${id}/invoice`, createdAt: now()
  };
  orders.set(id, order);
  return order;
}

export function updateVariantQuantity(productId: string, variantId: string, quantity: number) {
  const product = products.find((entry) => entry.id === productId);
  if (!product) throw new Error("Product not found");
  const variant = product.variants.find((entry) => entry.id === variantId);
  if (!variant) throw new Error("Variant not found");
  variant.quantity = quantity;
  return product;
}

export function updateOrderStatus(orderId: string, status: OrderStatus, note: string, actor: "admin" | "delivery" | "customer" | "system" = "admin") {
  const order = orders.get(orderId);
  if (!order) throw new Error("Order not found");
  order.status = status;
  order.statusHistory.push({ status, note, at: now(), actor });
  if (status === "REFUNDED") order.paymentStatus = "REFUNDED";
  return order;
}

export function cancelOrder(orderId: string, email: string, reason: string) {
  const order = orders.get(orderId);
  if (!order) throw new Error("Order not found");
  if (order.customerEmail !== email) throw new Error("Forbidden");
  if (!["PLACED", "CONFIRMED"].includes(order.status)) throw new Error("Order cannot be cancelled");
  order.items.forEach((item) => {
    const product = products.find((p) => p.id === item.productId);
    const variant = product?.variants.find((v) => v.id === item.variantId);
    if (variant) variant.quantity += item.qty;
  });
  return updateOrderStatus(orderId, "CANCELLED", reason, "customer");
}

export function requestReturn(orderId: string, email: string, reason: string, proofUrl: string) {
  const order = orders.get(orderId);
  if (!order) throw new Error("Order not found");
  if (order.customerEmail !== email) throw new Error("Forbidden");
  if (order.status !== "DELIVERED") throw new Error("Only delivered orders can be returned");
  if (order.returnRequest) throw new Error("Return already requested");
  const returnRequest: ReturnRequest = { id: makeId("ret"), reason, proofUrl, status: "REQUESTED", requestedAt: now() };
  order.returnRequest = returnRequest;
  return updateOrderStatus(orderId, "RETURN_REQUESTED", `Return requested: ${reason}`, "customer");
}

export function resolveReturn(orderId: string, status: ReturnStatus, adminNote: string) {
  const order = orders.get(orderId);
  if (!order?.returnRequest) throw new Error("No return request");
  order.returnRequest.status = status;
  order.returnRequest.adminNote = adminNote;
  order.returnRequest.resolvedAt = now();
  if (status === "APPROVED") return updateOrderStatus(orderId, "RETURNED", adminNote, "admin");
  if (status === "REFUNDED") {
    order.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      const variant = product?.variants.find((v) => v.id === item.variantId);
      if (variant) variant.quantity += item.qty;
    });
    order.returnRequest.status = "REFUNDED";
    return updateOrderStatus(orderId, "REFUNDED", adminNote, "admin");
  }
  if (status === "REJECTED") return updateOrderStatus(orderId, "DELIVERED", adminNote, "admin");
  return order;
}

export function getSalesSummary() {
  const all = Array.from(orders.values());
  return {
    revenueInr: all.reduce((sum, order) => sum + (order.currency === "INR" ? order.total : order.currency === "EUR" ? order.total * 90 : order.total * 83), 0),
    orders: all.length,
    pending: all.filter((o) => !["DELIVERED", "CANCELLED", "REFUNDED"].includes(o.status)).length,
    delivered: all.filter((o) => o.status === "DELIVERED").length,
    returns: all.filter((o) => o.returnRequest?.status === "REQUESTED").length
  };
}

export function makeVariant(color: string, size: string, quantity: number): ProductVariant {
  return { id: makeId("v"), color, size, quantity };
}

export function makeColorImage(color: string, image: string): ColorImage {
  return { color, image };
}

export function defaultCurrencyForRegion(region: keyof typeof REGION_CURRENCY) {
  return REGION_CURRENCY[region];
}
