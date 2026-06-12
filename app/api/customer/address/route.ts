import { prisma } from "@/lib/db";
import { mapUserToCustomer } from "@/lib/users-db";
import { addressSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json();
  const address = addressSchema.parse(body.address);
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) return Response.json({ message: "Customer not found" }, { status: 404 });

  const data = {
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2 ?? "",
    city: address.city,
    state: address.state,
    pincode: address.pincode
  };

  if (address.id) {
    const existing = await prisma.address.findFirst({ where: { id: address.id, userId: user.id } });
    if (!existing) return Response.json({ message: "Address not found" }, { status: 404 });
    await prisma.address.update({ where: { id: address.id }, data });
  } else {
    await prisma.address.create({ data: { userId: user.id, ...data } });
  }

  const refreshed = await prisma.user.findUnique({ where: { email: body.email }, include: { addresses: true } });
  return Response.json(mapUserToCustomer(refreshed!));
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) return Response.json({ message: "Customer not found" }, { status: 404 });

  const existing = await prisma.address.findFirst({ where: { id: body.addressId, userId: user.id } });
  if (!existing) return Response.json({ message: "Address not found" }, { status: 404 });

  await prisma.address.delete({ where: { id: body.addressId } });
  const refreshed = await prisma.user.findUnique({ where: { email: body.email }, include: { addresses: true } });
  return Response.json(mapUserToCustomer(refreshed!));
}
