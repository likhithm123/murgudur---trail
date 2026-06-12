export type Category = "men" | "women" | "handbag" | "watches";
export type Currency = "USD" | "EUR" | "INR";
export type Region = "US" | "EU" | "IN";
export type OrderStatus = "PLACED" | "CONFIRMED" | "PACKED" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "RETURN_REQUESTED" | "RETURNED" | "REFUNDED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type ReturnStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "REFUNDED";
export type Role = "CUSTOMER" | "ADMIN";

export type ColorImage = { color: string; image: string; gallery?: string[] };

export type Product = {
  id: string;
  name: string;
  category: Category;
  priceUsd: number;
  priceEur: number;
  priceInr: number;
  discountPercent?: number;
  rating?: number;
  deliveryDays?: number;
  variants: ProductVariant[];
  colorImages: ColorImage[];
  gallery?: string[];
  image: string;
  description: string;
};

export type ProductVariant = { id: string; color: string; size: string; quantity: number };

export type Address = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  passwordHash?: string;
  addresses: Address[];
};

export type CartItem = { productId: string; variantId: string; qty: number };

export type ReturnRequest = {
  id: string;
  reason: string;
  proofUrl: string;
  status: ReturnStatus;
  requestedAt: string;
  resolvedAt?: string;
  adminNote?: string;
};

export type OrderItem = CartItem & { name: string; color: string; size: string; price: number };

export type Order = {
  id: string;
  orderNo: string;
  customerId: string;
  customerEmail: string;
  address: Address;
  items: OrderItem[];
  currency: Currency;
  subtotal: number;
  delivery: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentGatewayOrderId?: string;
  trackingId: string;
  status: OrderStatus;
  statusHistory: Array<{ status: OrderStatus; note: string; at: string; actor: "system" | "admin" | "delivery" | "customer" }>;
  invoiceNo: string;
  invoiceUrl: string;
  returnRequest?: ReturnRequest;
  createdAt: string;
};
