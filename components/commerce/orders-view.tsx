"use client";

import { useState } from "react";
import type { Customer, Order } from "@/lib/types";
import { money, Panel } from "./shared";

function estimatedDeliveryWindow(order: Order) {
  return order.currency === "INR" ? "2-4 days" : order.currency === "EUR" ? "4-7 days" : "3-6 days";
}

export function OrdersView({ orders, customer, onRefresh, onNotice }: { orders: Order[]; customer: Customer | null; onRefresh: () => void; onNotice: (m: string) => void }) {
  return (
    <Panel title="Order History">
      <div className="grid gap-4">
        {orders.map((o) => <OrderCard key={o.id} order={o} customer={customer} onRefresh={onRefresh} onNotice={onNotice} />)}
        {!orders.length && <p className="text-ink/60">No orders yet. Checkout to see tracking here.</p>}
      </div>
    </Panel>
  );
}

function OrderCard({ order, customer, onRefresh, onNotice }: { order: Order; customer: Customer | null; onRefresh: () => void; onNotice: (m: string) => void }) {
  const [reason, setReason] = useState("");
  const [proof, setProof] = useState("");
  const canCancel = ["PLACED", "CONFIRMED"].includes(order.status);
  const canReturn = order.status === "DELIVERED" && !order.returnRequest;

  async function cancel() {
    const res = await fetch(`/api/orders/${order.id}/cancel`, { method: "POST", body: JSON.stringify({ email: customer?.email, reason: reason || "Customer cancelled" }) });
    if (!res.ok) return onNotice((await res.json()).message || "Cancel failed");
    onNotice("Order cancelled."); onRefresh();
  }

  async function requestReturn() {
    if (!proof) return onNotice("Upload proof image.");
    const res = await fetch(`/api/orders/${order.id}/return`, { method: "POST", body: JSON.stringify({ email: customer?.email, reason, proofUrl: proof }) });
    if (!res.ok) return onNotice((await res.json()).message || "Return failed");
    onNotice("Return requested."); onRefresh();
  }

  function onProof(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProof(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <article className="border border-ink/10 bg-white/45 p-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row">
        <div>
          <h3 className="font-display text-3xl">{order.orderNo}</h3>
          <p className="text-sm text-ink/60">Tracking: {order.trackingId}</p>
          <p className="text-xs text-ink/50">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="text-left md:text-right">
          <p>{money(order.total, order.currency)}</p>
          <p className="text-sm text-pine">{order.status}</p>
          <p className="text-xs text-ink/60">Est. delivery: {estimatedDeliveryWindow(order)}</p>
          <a className="text-sm underline" href={order.invoiceUrl} target="_blank">Invoice</a>
        </div>
      </div>
      <div className="mt-4 space-y-1 border-t border-ink/10 pt-4">
        {order.statusHistory.map((h) => <p key={`${h.at}-${h.status}`} className="text-sm text-ink/65"><span className="font-medium">{h.status}</span> · {h.note} · {new Date(h.at).toLocaleString()}</p>)}
      </div>
      {order.returnRequest && (
        <div className="mt-4 border border-brass/30 bg-mist p-3 text-sm">
          Return {order.returnRequest.status}: {order.returnRequest.reason}
          {order.returnRequest.adminNote && <p className="mt-1 text-ink/60">Admin: {order.returnRequest.adminNote}</p>}
        </div>
      )}
      {(canCancel || canReturn) && (
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          <input className="field" placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          {canReturn && <input className="field" type="file" accept="image/*" onChange={(e) => onProof(e.target.files?.[0] ?? null)} />}
          {canCancel && <button onClick={cancel} className="h-10 border border-clay text-clay">Cancel order</button>}
          {canReturn && <button onClick={requestReturn} className="h-10 bg-brass text-ivory">Request return</button>}
        </div>
      )}
    </article>
  );
}
