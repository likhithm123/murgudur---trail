import { prisma } from "@/lib/db";
import { mapUserToCustomer } from "@/lib/users-db";

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email");
  if (!email) return new Response("email required", { status: 400 });
  const user = await prisma.user.findUnique({ where: { email }, include: { addresses: true } });
  if (!user) return new Response("Not found", { status: 404 });
  return Response.json(mapUserToCustomer(user));
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const user = await prisma.user.update({
    where: { email: body.email },
    data: { name: body.name, phone: body.phone },
    include: { addresses: true }
  });
  return Response.json(mapUserToCustomer(user));
}
