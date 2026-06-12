import { z } from "zod";

export const addressSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(2),
  phone: z.string().min(10),
  line1: z.string().min(3),
  line2: z.string().optional().default(""),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(5),
  isDefault: z.boolean().optional()
});

export const checkoutSchema = z.object({
  email: z.string().email(),
  addressId: z.string().min(1),
  currency: z.enum(["USD", "EUR", "INR"]).optional(),
  items: z.array(z.object({ productId: z.string(), variantId: z.string(), qty: z.number().int().positive() })).min(1)
});

export const inventorySchema = z.object({ productId: z.string(), variantId: z.string(), quantity: z.number().int().min(0) });

export const statusSchema = z.object({
  orderId: z.string(),
  status: z.enum(["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURN_REQUESTED", "RETURNED", "REFUNDED"]),
  note: z.string().min(2)
});

export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

export const signupOtpSchema = z.object({ email: z.string().email(), name: z.string().min(2), phone: z.string().min(10), password: z.string().min(6) });

export const verifySignupSchema = z.object({ email: z.string().email(), otp: z.string().length(6), name: z.string().min(2), phone: z.string().min(10), password: z.string().min(6) });

export const resetOtpSchema = z.object({ email: z.string().email() });

export const resetPasswordSchema = z.object({ email: z.string().email(), otp: z.string().length(6), password: z.string().min(6) });

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  category: z.enum(["men", "women", "handbag", "watches"]),
  description: z.string().min(5),
  priceUsd: z.number().positive(),
  priceEur: z.number().positive(),
  priceInr: z.number().positive(),
  discountPercent: z.number().min(0).max(100).optional(),
  rating: z.number().min(0).max(5).optional(),
  deliveryDays: z.number().min(1).optional(),
  image: z.string().url(),
  gallery: z.array(z.string().url()).optional(),
  colorImages: z.array(z.object({ color: z.string(), image: z.string().url(), gallery: z.array(z.string().url()).optional() })),
  variants: z.array(z.object({ id: z.string().optional(), color: z.string(), size: z.string(), quantity: z.number().int().min(0) }))
});

export const returnSchema = z.object({ email: z.string().email(), reason: z.string().min(5), proofUrl: z.string().min(10) });

export const resolveReturnSchema = z.object({ orderId: z.string(), status: z.enum(["APPROVED", "REJECTED", "REFUNDED"]), adminNote: z.string().min(2) });
