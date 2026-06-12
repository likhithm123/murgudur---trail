"use client";

import { useEffect, useState } from "react";
import type { Category, Order, OrderStatus, Product } from "@/lib/types";
import { ProductImage } from "./product-image";
import { Metric, money, Panel } from "./shared";

const emptyProduct = (): Partial<Product> => ({
  name: "", category: "men" as Category, description: "", priceUsd: 0, priceEur: 0, priceInr: 0,
  discountPercent: 0, rating: 4.5, deliveryDays: 3,
  image: "",
  gallery: [],
  colorImages: [{ color: "Black", image: "", gallery: [] }],
  variants: [{ id: "", color: "Black", size: "M", quantity: 10 }]
});

export function AdminView({ email, onNotice }: { email: string; onNotice: (m: string) => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState({ revenueInr: 0, orders: 0, pending: 0, delivered: 0, returns: 0 });
  const [note, setNote] = useState("Admin update");
  const [draft, setDraft] = useState(emptyProduct());
  const headers = { "x-user-email": email, "Content-Type": "application/json" };

  async function load() {
    const [o, s, p] = await Promise.all([
      fetch("/api/orders").then((r) => r.json()),
      fetch("/api/admin/summary", { headers }).then((r) => r.json()),
      fetch("/api/admin/products").then((r) => r.json())
    ]);
    setOrders(o); setSummary(s); setProducts(p);
  }

  useEffect(() => { void load(); }, []);

  async function saveProduct() {
    const res = await fetch("/api/admin/products", { method: draft.id ? "PATCH" : "POST", headers, body: JSON.stringify(draft) });
    if (!res.ok) return onNotice("Save failed");
    setDraft(emptyProduct()); onNotice("Product saved."); await load();
  }

  async function updateStatus(orderId: string, status: OrderStatus) {
    await fetch("/api/admin/status", { method: "POST", headers, body: JSON.stringify({ orderId, status, note }) });
    await load();
  }

  async function resolveReturn(orderId: string, status: "APPROVED" | "REJECTED" | "REFUNDED") {
    await fetch("/api/admin/returns", { method: "POST", headers, body: JSON.stringify({ orderId, status, adminNote: note }) });
    onNotice(`Return ${status.toLowerCase()}.`); await load();
  }

  async function updateQty(productId: string, variantId: string, quantity: number) {
    await fetch("/api/admin/inventory", { method: "POST", headers, body: JSON.stringify({ productId, variantId, quantity }) });
    await load();
  }

  return (
    <Panel title="Admin">
      <div className="grid gap-4 md:grid-cols-5">
        <Metric label="Revenue (INR est.)" value={money(summary.revenueInr, "INR")} />
        <Metric label="Orders" value={summary.orders} />
        <Metric label="Pending" value={summary.pending} />
        <Metric label="Delivered" value={summary.delivered} />
        <Metric label="Returns" value={summary.returns} />
      </div>

      <h3 className="mt-8 font-display text-3xl">Add / Edit Product</h3>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        <input className="field" placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <select className="field" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })}>
          {["men", "women", "handbag", "watches"].map((c) => <option key={c}>{c}</option>)}
        </select>
        <input className="field" placeholder="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        <input className="field" type="number" placeholder="USD" value={draft.priceUsd || ""} onChange={(e) => setDraft({ ...draft, priceUsd: +e.target.value })} />
        <input className="field" type="number" placeholder="EUR" value={draft.priceEur || ""} onChange={(e) => setDraft({ ...draft, priceEur: +e.target.value })} />
        <input className="field" type="number" placeholder="INR" value={draft.priceInr || ""} onChange={(e) => setDraft({ ...draft, priceInr: +e.target.value })} />
        <input className="field" type="number" min={0} max={100} placeholder="Discount %" value={draft.discountPercent ?? ""} onChange={(e) => setDraft({ ...draft, discountPercent: Number(e.target.value) })} />
        {draft.discountPercent ? <p className="text-sm text-ink/60">Preview: {draft.discountPercent}% off → USD {Math.round((draft.priceUsd || 0) * (1 - draft.discountPercent / 100))}</p> : null}
        <input className="field" type="number" min={0} max={5} step={0.1} placeholder="Rating" value={draft.rating ?? ""} onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })} />
        <input className="field" type="number" min={1} placeholder="Delivery days" value={draft.deliveryDays ?? ""} onChange={(e) => setDraft({ ...draft, deliveryDays: Number(e.target.value) })} />
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <input className="field" placeholder="Main image URL" value={draft.image ?? ""} onChange={(e) => setDraft({ ...draft, image: e.target.value })} />
        <div className="relative flex items-center gap-3 rounded-2xl border border-ink/10 bg-white/50 p-3 text-sm text-ink">
          <span>Preview:</span>
          <div className="relative h-16 w-16 overflow-hidden rounded">
            <ProductImage src={draft.image} alt="preview" fill className="object-cover" />
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input className="field" placeholder="Gallery image URL" onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          const value = (e.target as HTMLInputElement).value.trim();
          if (!value) return;
          setDraft({ ...draft, gallery: [...(draft.gallery ?? []), value] });
          (e.target as HTMLInputElement).value = "";
        }} />
        <div className="rounded-2xl border border-ink/10 bg-white/50 p-3 text-sm text-ink">
          <p className="font-medium">Gallery preview</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(draft.gallery ?? []).map((src, index) => (
              <div key={`${src}-${index}`} className="relative h-16 w-16 overflow-hidden rounded-xl border border-ink/10">
                <ProductImage src={src} alt={`Gallery ${index + 1}`} fill className="object-cover" />
                <button type="button" onClick={() => setDraft({ ...draft, gallery: (draft.gallery ?? []).filter((_, i) => i !== index) })} className="absolute right-0 top-0 h-6 w-6 rounded-full bg-ink/80 text-ivory">×</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-3xl border border-ink/10 bg-white/60 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-medium">Color images</p>
          <button type="button" onClick={() => setDraft({ ...draft, colorImages: [...(draft.colorImages ?? []), { color: "", image: "", gallery: [] }] })} className="text-sm text-ink/70 underline">Add color image</button>
        </div>
        {(draft.colorImages ?? []).map((item, index) => (
          <div key={index} className="grid gap-3 rounded-3xl border border-ink/10 p-3">
            <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
              <input className="field" placeholder="Color" value={item.color} onChange={(e) => setDraft({ ...draft, colorImages: (draft.colorImages ?? []).map((ci, i) => i === index ? { ...ci, color: e.target.value } : ci) })} />
              <input className="field" placeholder="Image URL" value={item.image} onChange={(e) => setDraft({ ...draft, colorImages: (draft.colorImages ?? []).map((ci, i) => i === index ? { ...ci, image: e.target.value } : ci) })} />
              <button type="button" onClick={() => setDraft({ ...draft, colorImages: (draft.colorImages ?? []).filter((_, i) => i !== index) })} className="h-11 rounded-full border border-clay px-4 text-sm text-clay">Remove</button>
            </div>
            {(item.gallery ?? []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(item.gallery ?? []).map((src, galleryIndex) => (
                  <div key={galleryIndex} className="relative h-16 w-16 overflow-hidden rounded-xl border border-ink/10">
                    <ProductImage src={src} alt={`Color ${item.color} ${galleryIndex + 1}`} fill className="object-cover" />
                    <button type="button" onClick={() => setDraft({ ...draft, colorImages: (draft.colorImages ?? []).map((ci, i) => i === index ? { ...ci, gallery: ci.gallery?.filter((_, j) => j !== galleryIndex) } : ci) })} className="absolute right-0 top-0 h-6 w-6 rounded-full bg-ink/80 text-ivory">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-3xl border border-ink/10 bg-white/60 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-medium">Variants</p>
          <button type="button" onClick={() => setDraft({ ...draft, variants: [...(draft.variants ?? []), { id: "", color: "", size: "", quantity: 0 }] })} className="text-sm text-ink/70 underline">Add variant</button>
        </div>
        {(draft.variants ?? []).map((variant, index) => (
          <div key={index} className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
            <input className="field" placeholder="Color" value={variant.color} onChange={(e) => setDraft({ ...draft, variants: (draft.variants ?? []).map((v, i) => i === index ? { ...v, color: e.target.value } : v) })} />
            <input className="field" placeholder="Size" value={variant.size} onChange={(e) => setDraft({ ...draft, variants: (draft.variants ?? []).map((v, i) => i === index ? { ...v, size: e.target.value } : v) })} />
            <input className="field" type="number" min={0} placeholder="Qty" value={variant.quantity} onChange={(e) => setDraft({ ...draft, variants: (draft.variants ?? []).map((v, i) => i === index ? { ...v, quantity: Number(e.target.value) } : v) })} />
            <button type="button" onClick={() => setDraft({ ...draft, variants: (draft.variants ?? []).filter((_, i) => i !== index) })} className="h-11 rounded-full border border-clay px-4 text-sm text-clay">Remove</button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={saveProduct} className="h-11 bg-ink px-5 text-ivory">{draft.id ? "Update" : "Create"} Product</button>
        <button onClick={() => setDraft(emptyProduct())} className="h-11 border border-ink px-5">Clear</button>
      </div>

      <h3 className="mt-8 font-display text-3xl">Inventory</h3>
      <div className="mt-4 grid gap-4">
        {products.map((p) => (
          <div key={p.id} className="border border-ink/10 bg-white/45 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-2xl">{p.name}</h4>
                <p className="text-sm text-ink/60">Discount {p.discountPercent ?? 0}% · Rating {p.rating?.toFixed(1) ?? "—"} · {p.deliveryDays} day{p.deliveryDays === 1 ? "" : "s"}</p>
              </div>
              <button onClick={() => setDraft(p)} className="text-sm underline">Edit</button>
            </div>
            <div className="mt-2 grid gap-2 md:grid-cols-3">
              {p.variants.map((v) => (
                <label key={v.id} className="grid gap-1 rounded-2xl border border-ink/10 p-3 text-sm">
                  <span className="font-medium">{v.color}/{v.size}</span>
                  <span className="text-xs text-ink/60">{v.quantity === 0 ? "Out of stock" : `${v.quantity} in stock`}</span>
                  <input className="field" type="number" min={0} defaultValue={v.quantity} onBlur={(e) => updateQty(p.id, v.id, +e.target.value)} />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <input className="field mt-8" value={note} onChange={(e) => setNote(e.target.value)} />
      <h3 className="mt-6 font-display text-3xl">Orders & Returns</h3>
      <div className="mt-4 grid gap-4">
        {orders.map((o) => (
          <div key={o.id} className="border border-ink/10 bg-white/45 p-4">
            <p className="font-display text-xl">{o.orderNo} · {o.trackingId} · {o.status}</p>
            <select className="field mt-2 max-w-xs" value={o.status} onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}>
              {["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURN_REQUESTED", "RETURNED", "REFUNDED"].map((s) => <option key={s}>{s}</option>)}
            </select>
            {o.returnRequest?.status === "REQUESTED" && (
              <div className="mt-2 flex flex-wrap gap-2">
                <a href={o.returnRequest.proofUrl} target="_blank" className="text-sm underline">View proof</a>
                <button onClick={() => resolveReturn(o.id, "APPROVED")} className="h-9 border px-3 text-sm">Approve</button>
                <button onClick={() => resolveReturn(o.id, "REFUNDED")} className="h-9 bg-pine px-3 text-sm text-ivory">Refund</button>
                <button onClick={() => resolveReturn(o.id, "REJECTED")} className="h-9 border border-clay px-3 text-sm text-clay">Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}
