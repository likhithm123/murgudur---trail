import { createHash, randomInt } from "crypto";
import { sendOtpEmail } from "./email";
import type { Customer } from "./types";

type OtpEntry = { otp: string; expiresAt: number; purpose: "signup" | "reset"; meta?: Record<string, string> };
const otps = new Map<string, OtpEntry>();

export function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(password: string, hash: string) {
  return hashPassword(password) === hash;
}

export async function issueOtp(email: string, purpose: "signup" | "reset", meta?: Record<string, string>) {
  const otp = String(randomInt(100000, 999999));
  otps.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000, purpose, meta });
  const mail = await sendOtpEmail(email, otp, purpose);
  return { sent: mail.sent, devOtp: process.env.SMTP_HOST ? undefined : otp };
}

export function consumeOtp(email: string, otp: string, purpose: "signup" | "reset") {
  const entry = otps.get(email);
  if (!entry || entry.purpose !== purpose || entry.otp !== otp || entry.expiresAt < Date.now()) return null;
  otps.delete(email);
  return entry;
}

export function sanitizeCustomer(customer: Customer) {
  const { passwordHash: _, ...safe } = customer;
  return safe;
}
