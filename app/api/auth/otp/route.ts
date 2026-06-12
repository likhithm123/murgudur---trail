import { issueOtp } from "@/lib/auth-otp";
import { getCustomer } from "@/lib/store";
import { resetOtpSchema, signupOtpSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json();
  const purpose = body.purpose as "signup" | "reset";
  if (purpose === "signup") {
    const data = signupOtpSchema.parse(body);
    if (getCustomer(data.email)) return Response.json({ message: "Account exists" }, { status: 409 });
    const result = await issueOtp(data.email, "signup", { name: data.name, phone: data.phone, password: data.password });
    return Response.json(result);
  }
  const { email } = resetOtpSchema.parse(body);
  if (!getCustomer(email)) return Response.json({ message: "No account" }, { status: 404 });
  const result = await issueOtp(email, "reset");
  return Response.json(result);
}
