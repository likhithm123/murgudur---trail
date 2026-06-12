import { createClient } from "@sanity/client";
import { draftMode } from "next/headers";

export const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2026-06-11",
  useCdn: true
});

export async function getSanityClient() {
  const draft = await draftMode();
  return sanity.withConfig({
    useCdn: !draft.isEnabled,
    token: draft.isEnabled ? process.env.SANITY_READ_TOKEN : undefined,
    perspective: draft.isEnabled ? "previewDrafts" : "published"
  });
}
