import { requireAdmin, resetPassword } from "@/lib/users-db";
import { consumeOtp } from "@/lib/auth-otp";
import { resetPasswordSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const ip =
  request.headers.get("x-forwarded-for")
  ?? "unknown";

if (!rateLimit(ip)) {
  return Response.json(
    { message: "Too many requests" },
    { status: 429 }
  );
}
  try {
    const data = resetPasswordSchema.parse(await request.json());
    if (!consumeOtp(data.email, data.otp, "reset")) return Response.json({ message: "Invalid OTP" }, { status: 400 });
    const customer = await resetPassword(data.email, data.password);
    return Response.json(customer);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Reset failed";
    return Response.json({ message }, { status: 400 });
  }
}
