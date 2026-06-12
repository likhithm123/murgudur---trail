import { hashPassword } from "./auth-otp";
import { prisma } from "./db";
import type { Customer } from "./types";

function mapAddresses(addresses: Array<{ id: string; fullName: string; phone: string; line1: string; line2: string | null; city: string; state: string; pincode: string }>) {
  return addresses.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2 ?? "",
    city: a.city,
    state: a.state,
    pincode: a.pincode
  }));
}

export function mapUserToCustomer(user: { id: string; name: string; email: string; phone: string | null; role: "CUSTOMER" | "ADMIN"; addresses?: Array<{ id: string; fullName: string; phone: string; line1: string; line2: string | null; city: string; state: string; pincode: string }> }): Customer {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    role: user.role,
    addresses: mapAddresses(user.addresses ?? [])
  };
}

export async function requireAdmin(email?: string | null) {
  if (!email) throw new Error("Forbidden");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== "ADMIN") throw new Error("Forbidden");
  return mapUserToCustomer(user);
}

export async function resetPassword(email: string, password: string) {
  const user = await prisma.user.update({
    where: { email },
    data: { passwordHash: hashPassword(password) },
    include: { addresses: true }
  });
  return mapUserToCustomer(user);
}
