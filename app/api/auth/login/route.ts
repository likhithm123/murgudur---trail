import { rateLimit } from "@/lib/rate-limit";
import { verifyPassword } from "@/lib/auth-otp";
import { loginSchema } from "@/lib/validators";
import { prisma } from "@/lib/db";
import { mapUserToCustomer } from "@/lib/users-db";

export async function POST(request: Request) {
  const { email, password } = loginSchema.parse(await request.json());
  const user = await prisma.user.findUnique({ where: { email }, include: { addresses: true } });
  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return Response.json({ message: "Invalid credentials" }, { status: 401 });
  }
  return Response.json(mapUserToCustomer(user));
}
