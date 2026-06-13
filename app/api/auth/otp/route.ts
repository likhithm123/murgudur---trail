import { issueOtp } from "@/lib/auth-otp";
import { prisma } from "@/lib/db";
import { resetOtpSchema, signupOtpSchema } from "@/lib/validators";

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
  const body = await request.json();
  const purpose = body.purpose as "signup" | "reset";
  if (purpose === "signup") {
    const data = signupOtpSchema.parse(body);
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) return Response.json({ message: "Account exists" }, { status: 409 });
    const result = await issueOtp(data.email, "signup", { name: data.name, phone: data.phone, password: data.password });
    return Response.json(result);
  }
  const { email } = resetOtpSchema.parse(body);
  const exists2 = await prisma.user.findUnique({ where: { email } });
  if (!exists2) return Response.json({ message: "No account" }, { status: 404 });
  const result = await issueOtp(email, "reset");
  return Response.json(result);
}
