import { consumeOtp, sanitizeCustomer } from "@/lib/auth-otp";
import { createCustomer } from "@/lib/store";
import { verifySignupSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const data = verifySignupSchema.parse(await request.json());
  if (!consumeOtp(data.email, data.otp, "signup")) return Response.json({ message: "Invalid OTP" }, { status: 400 });
  const customer = createCustomer(data);
  return Response.json(sanitizeCustomer(customer));
}
