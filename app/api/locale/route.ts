import { REGION_COOKIE, regionFromCountry } from "@/lib/locale";
import type { Region } from "@/lib/types";

export async function GET(request: Request) {
  // Detect region/ip/country from headers but do NOT set cookies on GET.
  // Cookies will only be set when the client explicitly posts consent.
  const cookie = request.headers.get("cookie")?.match(/md_region=(US|EU|IN)/)?.[1] as Region | undefined;
  const country = request.headers.get("cf-ipcountry") || request.headers.get("x-vercel-ip-country");
  const forwardedIp = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip");
  const region = cookie || regionFromCountry(country);
  return new Response(JSON.stringify({ region, country: country ?? null, ip: forwardedIp ?? null }));
}

export async function POST(request: Request) {
  const { region } = await request.json();
  if (!["US", "EU", "IN"].includes(region)) return new Response("Invalid region", { status: 400 });
  const country = request.headers.get("cf-ipcountry") || request.headers.get("x-vercel-ip-country");
  const forwardedIp = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip");
  const headers = new Headers();
  headers.append("Set-Cookie", `${REGION_COOKIE}=${region}; Path=/; Max-Age=31536000; SameSite=Lax`);
  if (forwardedIp) headers.append("Set-Cookie", `md_ip=${forwardedIp}; Path=/; Max-Age=31536000; SameSite=Lax`);
  if (country) headers.append("Set-Cookie", `md_country=${country}; Path=/; Max-Age=31536000; SameSite=Lax`);
  return new Response(JSON.stringify({ region }), { headers });
}
