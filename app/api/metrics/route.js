import { Registry, collectDefaultMetrics } from "prom-client";

const register = new Registry();

collectDefaultMetrics({
  register,
});

export async function GET() {
  const metrics = await register.metrics();

  return new Response(metrics, {
    headers: {
      "Content-Type": register.contentType,
    },
  });
}
