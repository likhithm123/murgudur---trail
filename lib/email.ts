import nodemailer from "nodemailer";
import type { Order } from "./types";

export async function sendOtpEmail(to: string, otp: string, purpose: "signup" | "reset") {
  const subject = purpose === "signup" ? "Verify your Murgdur account" : "Reset your Murgdur password";
  const text = `Your OTP is ${otp}. Valid for 10 minutes.`;
  if (!process.env.SMTP_HOST) return { sent: false, reason: "SMTP not configured", to, otp };
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT ?? 587),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  await transport.sendMail({ from: process.env.SMTP_FROM ?? "orders@murgdur.com", to, subject, text });
  return { sent: true };
}

export async function sendInvoiceEmail(to: string, order: Order) {
  if (!process.env.SMTP_HOST) {
    return { sent: false, reason: "SMTP not configured", to, orderNo: order.orderNo };
  }
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  await transport.sendMail({
    from: process.env.SMTP_FROM ?? "orders@murgdur.com",
    to,
    subject: `Murgdur invoice ${order.invoiceNo}`,
    text: `Your order ${order.orderNo} is placed. Tracking ID: ${order.trackingId}. Invoice: ${order.invoiceUrl}`
  });
  return { sent: true };
}
