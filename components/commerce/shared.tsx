"use client";

import { formatMoney } from "@/lib/locale";
import type { Currency } from "@/lib/types";

export const categories = [
  { id: "all", label: "All" },
  { id: "men", label: "Mens" },
  { id: "women", label: "Womens" },
  { id: "handbag", label: "Hand Bag" },
  { id: "watches", label: "Watches" }
] as const;

export const emptyAddress = { fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" };

export function money(value: number, currency: Currency) { return formatMoney(value, currency); }

export function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="px-4 py-8 md:px-8"><h2 className="mb-6 font-display text-5xl">{title}</h2>{children}</section>;
}

export function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`flex h-11 items-center gap-3 px-3 text-left transition ${active ? "bg-ink text-ivory" : "hover:bg-pearl"}`}>{icon}{label}</button>;
}

export function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="border border-ink/10 bg-white/45 p-5"><p className="text-xs uppercase tracking-[.2em] text-ink/50">{label}</p><p className="mt-2 font-display text-3xl">{value}</p></div>;
}
