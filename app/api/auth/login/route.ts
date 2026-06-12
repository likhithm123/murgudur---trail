import { sanitizeCustomer, verifyPassword } from "@/lib/auth-otp";
import { getCustomer } from "@/lib/store";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const { email, password } = loginSchema.parse(await request.json());
  const customer = getCustomer(email);
  if (!customer?.passwordHash || !verifyPassword(password, customer.passwordHash)) {
    return Response.json({ message: "Invalid credentials" }, { status: 401 });
  }
  return Response.json(sanitizeCustomer(customer));
}
