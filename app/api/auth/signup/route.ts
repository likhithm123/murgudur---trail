import { consumeOtp, hashPassword } from "@/lib/auth-otp";
import { verifySignupSchema } from "@/lib/validators";
import { prisma } from "@/lib/db";
import { mapUserToCustomer } from "@/lib/users-db";

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
  const data = verifySignupSchema.parse(await request.json());
  if (!consumeOtp(data.email, data.otp, "signup")) return Response.json({ message: "Invalid OTP" }, { status: 400 });
  try {
    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, phone: data.phone, role: "CUSTOMER", passwordHash: hashPassword(data.password) },
      include: { addresses: true }
    });
    return Response.json(mapUserToCustomer(user));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Create failed";
    return Response.json({ message }, { status: 500 });
  }
}
