import { consumeOtp, sanitizeCustomer } from "@/lib/auth-otp";
import { resetPassword } from "@/lib/store";
import { resetPasswordSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const data = resetPasswordSchema.parse(await request.json());
  if (!consumeOtp(data.email, data.otp, "reset")) return Response.json({ message: "Invalid OTP" }, { status: 400 });
  const customer = resetPassword(data.email, data.password);
  return Response.json(sanitizeCustomer(customer));
}
