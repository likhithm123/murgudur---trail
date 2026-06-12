import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("secret") !== process.env.SANITY_PREVIEW_SECRET) {
    return new Response("Invalid preview secret", { status: 401 });
  }
  const draft = await draftMode();
  draft.enable();
  redirect(url.searchParams.get("slug") ?? "/");
}
