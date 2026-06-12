"use client";

import { BarChart3, CreditCard, Home, LogOut, MapPin, Package, ShoppingBag, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { REGION_CURRENCY } from "@/lib/locale";
import { getDiscountedPrice, getProductPrice } from "@/lib/locale";
import type { Address, CartItem, Currency, Customer, Order, Product, Region } from "@/lib/types";
import { AdminView } from "./commerce/admin-view";
import { AuthView } from "./commerce/auth-view";
import { OrdersView } from "./commerce/orders-view";
import { ShopView } from "./commerce/shop-view";
import { emptyAddress, money, NavButton, Panel } from "./commerce/shared";

export default function CommerceApp({ initialProducts = [] }: { initialProducts: Product[] }) {
  const [view, setView] = useState("shop");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [products, setProducts] = useState(initialProducts);
  const [region, setRegion] = useState<Region>("IN");
  const [detectedRegion, setDetectedRegion] = useState<Region | null>(null);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [detectedIp, setDetectedIp] = useState<string | null>(null);
  const [cookieConsent, setCookieConsent] = useState<'unknown' | 'accepted' | 'rejected'>(() => {
    const v = typeof window !== 'undefined' ? localStorage.getItem('md_cookie_consent') : null;
    return v === 'accepted' ? 'accepted' : v === 'rejected' ? 'rejected' : 'unknown';
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState(emptyAddress);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [notice, setNotice] = useState("");
  const currency: Currency = REGION_CURRENCY[region];

  useEffect(() => {
    fetch("/api/locale").then((r) => r.json()).then((d) => {
      setDetectedRegion(d.region);
      setDetectedCountry(d.country ?? null);
      setDetectedIp(d.ip ?? null);
      if (localStorage.getItem('md_cookie_consent') === 'accepted') {
        void setRegionAndCookie(d.region);
      }
    });
    fetch("/api/products").then((r) => r.json()).then(setProducts);

    const savedEmail = sessionStorage.getItem("md_customer_email");
    if (savedEmail) {
      fetch(`/api/customer?email=${encodeURIComponent(savedEmail)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((c: Customer | null) => {
          if (!c) {
            sessionStorage.removeItem("md_customer_email");
            return;
          }
          setCustomer(c);
          setSelectedAddress(c.addresses[0]?.id ?? "");
          void loadOrders(c.email);
        });
    }
  }, []);

  async function setRegionAndCookie(r: Region) {
    setRegion(r);
    // POST will set cookies server-side (region, ip, country) when consent is given
    await fetch("/api/locale", { method: "POST", body: JSON.stringify({ region: r }) });
  }

  function acceptLocationCookies() {
    if (!detectedRegion) return;
    void setRegionAndCookie(detectedRegion);
    localStorage.setItem('md_cookie_consent', 'accepted');
    setCookieConsent('accepted');
    setRegion(detectedRegion);
  }

  function rejectLocationCookies() {
    localStorage.setItem('md_cookie_consent', 'rejected');
    setCookieConsent('rejected');
  }

  async function loadOrders(email: string) {
    const res = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
    setOrders(await res.json());
  }

  function onLogin(c: Customer) {
    sessionStorage.setItem("md_customer_email", c.email);
    setCustomer(c);
    setSelectedAddress(c.addresses.find((a) => a.isDefault)?.id ?? c.addresses[0]?.id ?? "");
    void loadOrders(c.email);
    setView(c.role === "ADMIN" ? "admin" : "shop");
  }

  const cartLines = useMemo(() => cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return null;
    const price = getDiscountedPrice(product, currency);
    return { ...item, product, total: price * item.qty };
  }).filter(Boolean) as Array<CartItem & { product: Product; total: number }>, [cart, products, currency]);

  const subtotal = cartLines.reduce((s, l) => s + l.total, 0);
  const delivery = subtotal > (currency === "INR" ? 100000 : currency === "EUR" ? 1200 : 1300) ? 0 : currency === "INR" ? 900 : currency === "EUR" ? 12 : 15;
  const estimatedDelivery = region === "IN" ? "3-5 days" : region === "EU" ? "4-7 days" : "3-6 days";

  async function saveAddress() {
    if (!customer) return setNotice("Login first.");
    const res = await fetch("/api/customer/address", { method: "POST", body: JSON.stringify({ email: customer.email, address }) });
    const data = await res.json();
    setCustomer(data);
    setSelectedAddress(data.addresses.at(-1)?.id ?? "");
    setAddress(emptyAddress);
    setNotice("Address saved.");
  }

  async function removeAddress(id: string) {
    if (!customer) return;
    const res = await fetch("/api/customer/address", { method: "DELETE", body: JSON.stringify({ email: customer.email, addressId: id }) });
    setCustomer(await res.json());
    setNotice("Address removed.");
  }

  async function checkout() {
    if (!customer || !selectedAddress) return setNotice("Login and select address.");
    const res = await fetch("/api/checkout", { method: "POST", body: JSON.stringify({ email: customer.email, addressId: selectedAddress, items: cart, currency }) });
    const data = await res.json();
    if (!res.ok) return setNotice(data.message || "Checkout failed");
    setCart([]);
    await loadOrders(customer.email);
    setNotice(`Order ${data.order.orderNo} placed. Tracking: ${data.order.trackingId}`);
    setView("orders");
  }

  return (
    <main className="grain min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-ink/10 bg-ivory/90 p-5 backdrop-blur lg:block">
        <div className="font-display text-3xl tracking-[.18em]">MURGDUR</div>
        <nav className="mt-10 grid gap-2">
          <NavButton icon={<Home size={18} />} label="Shop" active={view === "shop"} onClick={() => setView("shop")} />
          <NavButton icon={<UserRound size={18} />} label="Account" active={view === "profile"} onClick={() => setView("profile")} />
          <NavButton icon={<MapPin size={18} />} label="Addresses" active={view === "address"} onClick={() => setView("address")} />
          <NavButton icon={<CreditCard size={18} />} label="Checkout" active={view === "checkout"} onClick={() => setView("checkout")} />
          <NavButton icon={<Package size={18} />} label="Orders" active={view === "orders"} onClick={() => setView("orders")} />
          {customer?.role === "ADMIN" && <NavButton icon={<BarChart3 size={18} />} label="Admin" active={view === "admin"} onClick={() => setView("admin")} />}
        </nav>
      </aside>

      <section className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink/10 bg-ivory/85 px-4 py-3 backdrop-blur md:px-8">
          <div>
            <p className="text-xs uppercase tracking-[.24em] text-ink/50">Luxury commerce · {region} · {currency}</p>
            <h1 className="font-display text-3xl md:text-5xl">Murgdur</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView("checkout")} className="inline-flex h-11 items-center gap-2 border border-ink px-4 text-sm">
              <ShoppingBag size={18} /> {cart.reduce((s, i) => s + i.qty, 0)}
            </button>
            {customer && <button onClick={() => { sessionStorage.removeItem("md_customer_email"); setCustomer(null); setOrders([]); setView("shop"); }} className="inline-flex h-11 items-center gap-2 border border-ink/25 px-4 text-sm"><LogOut size={18} /> {customer.name.split(" ")[0]}</button>}
          </div>
        </header>

        {notice && <div className="mx-4 mt-4 border border-pine/30 bg-mist px-4 py-3 text-sm md:mx-8">{notice}</div>}

        {view === "shop" && <ShopView products={products} currency={currency} region={region} addToCart={(pid, vid) => setCart((c) => {
          const f = c.find((i) => i.productId === pid && i.variantId === vid);
          return f ? c.map((i) => i === f ? { ...i, qty: i.qty + 1 } : i) : [...c, { productId: pid, variantId: vid, qty: 1 }];
        })} />}
        {view === "profile" && <AuthView customer={customer} onLogin={onLogin} onNotice={setNotice} />}
        {view === "address" && (
          <Panel title="Addresses">
            <div className="grid gap-3 md:grid-cols-2">
              {(["fullName", "phone", "line1", "line2", "city", "state", "pincode"] as const).map((k) => (
                <input key={k} className="field" placeholder={k} value={address[k]} onChange={(e) => setAddress({ ...address, [k]: e.target.value })} />
              ))}
              <button onClick={saveAddress} className="h-12 bg-ink text-ivory">Save</button>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {customer?.addresses.map((a) => (
                <div key={a.id} className="border border-ink/10 bg-white/40 p-4">
                  <label className="flex gap-2"><input type="radio" checked={selectedAddress === a.id} onChange={() => setSelectedAddress(a.id)} /><span>{a.fullName}</span></label>
                  <p className="mt-2 text-sm text-ink/65">{a.line1}, {a.city}, {a.state} {a.pincode}</p>
                  <button onClick={() => removeAddress(a.id)} className="mt-2 text-sm text-clay">Delete</button>
                </div>
              ))}
            </div>
          </Panel>
        )}
        {view === "checkout" && (
          <Panel title="Checkout">
            <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
              <div className="grid gap-3">
                {cartLines.map((l) => {
                  const v = l.product.variants.find((x) => x.id === l.variantId);
                  return <div key={`${l.productId}-${l.variantId}`} className="flex justify-between border border-ink/10 bg-white/40 p-4"><span>{l.product.name} · {v?.color}/{v?.size} × {l.qty}</span><span>{money(l.total, currency)}</span></div>;
                })}
                {!cartLines.length && <p>Cart empty.</p>}
              </div>
              <div className="border border-ink/10 bg-white/45 p-5">
                <p className="flex justify-between"><span>Subtotal</span><span>{money(subtotal, currency)}</span></p>
                <p className="mt-2 flex justify-between"><span>Delivery</span><span>{money(delivery, currency)}</span></p>
                <p className="mt-3 text-sm text-ink/70">Estimated arrival: {estimatedDelivery}</p>
                <p className="mt-4 flex justify-between border-t pt-4 text-lg"><span>Total</span><span>{money(subtotal + delivery, currency)}</span></p>
                <select className="field mt-5" value={selectedAddress} onChange={(e) => setSelectedAddress(e.target.value)}>
                  <option value="">Select address</option>
                  {customer?.addresses.map((a) => <option key={a.id} value={a.id}>{a.fullName} - {a.city}</option>)}
                </select>
                <button disabled={!cartLines.length} onClick={checkout} className="mt-4 h-12 w-full bg-pine text-ivory disabled:opacity-40">Place order</button>
              </div>
            </div>
          </Panel>
        )}
        {view === "orders" && <OrdersView orders={orders} customer={customer} onRefresh={() => customer && loadOrders(customer.email)} onNotice={setNotice} />}
        {view === "admin" && customer?.role === "ADMIN" && <AdminView email={customer.email} onNotice={setNotice} />}
        {/* Cookie / location consent modal */}
        {cookieConsent === 'unknown' && detectedRegion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-2xl border border-ink/10 bg-ivory p-6 shadow-2xl">
              <h3 className="font-display text-2xl">Location-based preferences</h3>
              <p className="mt-3 text-sm text-ink/70">We detected your location as <strong>{detectedCountry ?? detectedRegion}</strong> ({detectedRegion}).
                Allow location cookies so we can set currency and estimates for you?</p>
              <div className="mt-6 flex gap-3">
                <button onClick={acceptLocationCookies} className="h-11 rounded-full bg-pine px-4 text-sm text-ivory">Accept</button>
                <button onClick={rejectLocationCookies} className="h-11 rounded-full border px-4 text-sm">Reject</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
