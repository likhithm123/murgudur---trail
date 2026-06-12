"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { formatMoney, getDiscountedPrice, getProductPrice, productImageForColor } from "@/lib/locale";
import { hasProductImage } from "@/lib/product-image";
import type { Category, Currency, Product, Region } from "@/lib/types";
import { ProductImage } from "./product-image";
import { categories, money } from "./shared";

type Props = {
  products: Product[];
  currency: Currency;
  region: Region;
  addToCart: (productId: string, variantId: string) => void;
};

export function ShopView({ products, currency, region, addToCart }: Props) {
  const [category, setCategory] = useState<"all" | Category>("all");
  const [detail, setDetail] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState<"default" | "price" | "rating" | "delivery">("default");
  const [range, setRange] = useState({ min: 0, max: 200000 });
  const [inStockOnly, setInStockOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const visible = useMemo(() => category === "all" ? products : products.filter((p) => p.category === category), [category, products]);
  const filtered = useMemo(() => visible.filter((product) => {
    const price = getDiscountedPrice(product, currency);
    if (price < range.min || price > range.max) return false;
    if (inStockOnly && !product.variants.some((variant) => variant.quantity > 0)) return false;
    if (discountOnly && !product.discountPercent) return false;
    return true;
  }), [currency, discountOnly, inStockOnly, range, visible]);
  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    if (sortBy === "price") return getDiscountedPrice(a, currency) - getDiscountedPrice(b, currency);
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "delivery") return (a.deliveryDays || 0) - (b.deliveryDays || 0);
    return 0;
  }), [currency, filtered, sortBy]);

  useEffect(() => {
    if (!sessionStorage.getItem("murgdurPromoShown")) {
      setPromoOpen(true);
      sessionStorage.setItem("murgdurPromoShown", "1");
    }
    if (typeof window !== "undefined") {
      document.cookie = `md_browser_locale=${navigator.language}; Path=/; Max-Age=31536000; SameSite=Lax`;
      document.cookie = `md_browser_timezone=${Intl.DateTimeFormat().resolvedOptions().timeZone}; Path=/; Max-Age=31536000; SameSite=Lax`;
    }
  }, []);

  const heroImage = useMemo(() => products.find((p) => hasProductImage(p.image))?.image ?? "", [products]);

  return (
    <div className="px-4 py-8 md:px-8">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative min-h-[48svh] overflow-hidden bg-ink text-ivory">
        {heroImage ? (
          <ProductImage src={heroImage} alt="Featured collection" fill priority sizes="100vw" className="object-cover opacity-75" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-ink via-pine/40 to-clay/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
        <div className="relative z-10 flex min-h-[48svh] flex-col justify-end p-6 md:p-10">
          <p className="text-xs uppercase tracking-[.28em]">Mens · Womens · Hand Bag · Watches</p>
          <h2 className="mt-3 max-w-4xl font-display text-5xl leading-none md:text-7xl">Curated luxury commerce.</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <p className="text-xs text-ivory/80">Prices and estimates are set by detected region.</p>
          </div>
        </div>
      </motion.section>
      <div className="mt-8 grid gap-4 lg:grid-cols-[1.6fr_.8fr]">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => <button key={c.id} onClick={() => setCategory(c.id)} className={`h-10 rounded-full border px-4 text-sm transition ${category === c.id ? "border-ink bg-ink text-ivory shadow-lg" : "border-ink/20 hover:border-ink"}`}>{c.label}</button>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select className="field max-w-[12rem]" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="default">Sort by</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
            <option value="delivery">Delivery</option>
          </select>
          <input className="field max-w-[8rem]" type="number" placeholder="Min" value={range.min} onChange={(e) => setRange((r) => ({ ...r, min: Number(e.target.value) }))} />
          <input className="field max-w-[8rem]" type="number" placeholder="Max" value={range.max} onChange={(e) => setRange((r) => ({ ...r, max: Number(e.target.value) }))} />
          <button type="button" className={`h-11 rounded-full border px-4 text-sm transition ${inStockOnly ? "border-ink bg-ink text-ivory" : "border-ink/20 text-ink"}`} onClick={() => setInStockOnly((value) => !value)}>{inStockOnly ? "In stock only" : "Show in-stock"}</button>
          <button type="button" className={`h-11 rounded-full border px-4 text-sm transition ${discountOnly ? "border-ink bg-ink text-ivory" : "border-ink/20 text-ink"}`} onClick={() => setDiscountOnly((value) => !value)}>{discountOnly ? "Discounted only" : "Show discounts"}</button>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-ink/60 md:text-base">
        <span>{sorted.length} product{sorted.length === 1 ? "" : "s"} matched</span>
        <span>{inStockOnly ? "Filtered to in-stock" : ""}{discountOnly ? " · Discounted products only" : ""}</span>
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((p) => <ProductCard key={p.id} product={p} currency={currency} onOpen={() => setDetail(p)} addToCart={addToCart} />)}
      </div>
      <AnimatePresence>{detail && <ProductDetail product={detail} currency={currency} onClose={() => setDetail(null)} addToCart={addToCart} />}</AnimatePresence>
      {promoOpen && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-ink/10 bg-ivory p-8 shadow-2xl">
            <h3 className="font-display text-4xl">Welcome to Murgdur</h3>
            <p className="mt-4 text-sm leading-7 text-ink/70">Enjoy a curated first look at luxury pieces with live price updates and seamless checkout. Tap the link to explore our signature collection.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#" onClick={(e) => { e.preventDefault(); setPromoOpen(false); setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 10); }} className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-6 text-sm text-ivory shadow-lg">Explore Collection</a>
              <button onClick={() => setPromoOpen(false)} className="inline-flex h-12 items-center justify-center rounded-full border border-ink px-6 text-sm">Close</button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ProductCard({ product, currency, onOpen, addToCart }: { product: Product; currency: Currency; onOpen: () => void; addToCart: (pid: string, vid: string) => void }) {
  const v = product.variants.find((x) => x.quantity > 0) ?? product.variants[0];
  const img = productImageForColor(product, v?.color ?? "");
  const price = getDiscountedPrice(product, currency);
  const originalPrice = getProductPrice(product, currency);
  const soldOut = v?.quantity === 0;

  return (
    <article data-reveal className="group relative overflow-hidden rounded-[1.4rem] border border-ink/10 bg-pearl shadow-sm transition hover:-translate-y-1 hover:shadow-xl" onClick={onOpen}>
      <div className="relative aspect-[4/5] overflow-hidden">
        <ProductImage src={img} alt={product.name} fill sizes="(min-width:1280px)25vw,50vw" className="object-cover transition duration-700 group-hover:scale-105" />
        {soldOut && <div className="absolute inset-0 bg-ink/70 text-ivory flex items-center justify-center text-sm uppercase tracking-[.2em]">Out of stock</div>}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[.2em] text-ink/55">{product.category}</p>
          <span className="rounded-full border border-ink/10 bg-white/80 px-3 py-1 text-xs text-ink">⭐ {product.rating?.toFixed(1) ?? "—"}</span>
        </div>
        <h2 className="mt-2 font-display text-2xl">{product.name}</h2>
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-3 text-lg">
            <span className="font-semibold">{money(price, currency)}</span>
            {product.discountPercent ? <span className="text-sm text-ink/50 line-through">{money(originalPrice, currency)}</span> : null}
          </div>
          <p className="text-xs uppercase tracking-[.18em] text-ink/55">Delivery {product.deliveryDays ?? 3} day{product.deliveryDays === 1 ? "" : "s"}</p>
        </div>
        <motion.button whileHover={{ scale: soldOut ? 1 : 1.02 }} whileTap={{ scale: soldOut ? 1 : 0.98 }} onClick={(e) => { e.stopPropagation(); if (v && !soldOut) addToCart(product.id, v.id); }} disabled={soldOut} className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-ink text-xs text-ivory transition disabled:cursor-not-allowed disabled:opacity-40">Quick add</motion.button>
      </div>
    </article>
  );
}

function ProductDetail({ product, currency, onClose, addToCart }: { product: Product; currency: Currency; onClose: () => void; addToCart: (pid: string, vid: string) => void }) {
  const colors = [...new Set(product.variants.map((v) => v.color))];
  const [color, setColor] = useState(colors.find((c) => product.variants.some((v) => v.color === c && v.quantity > 0)) ?? colors[0]);
  const sizes = [...new Set(product.variants.filter((v) => v.color === color).map((v) => v.size))];
  const [size, setSize] = useState(sizes.find((s) => product.variants.some((v) => v.color === color && v.size === s && v.quantity > 0)) ?? sizes[0]);
  const variant = product.variants.find((v) => v.color === color && v.size === size);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const selectedColorImages = product.colorImages.find((item) => item.color === color)?.gallery ?? [];
  const gallery = Array.from(new Set([product.image, ...(product.gallery ?? []), ...product.colorImages.map((item) => item.image), ...selectedColorImages].filter(hasProductImage)));
  const displayedImage = gallery[selectedImageIndex] ?? product.image;
  const discounted = getDiscountedPrice(product, currency);
  const originalPrice = getProductPrice(product, currency);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [color, product.gallery, selectedColorImages]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 backdrop-blur-sm md:items-center" onClick={onClose}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: "spring", damping: 28 }} onClick={(e) => e.stopPropagation()} className="grid max-h-[90vh] w-full max-w-5xl overflow-auto rounded-[1.8rem] bg-ivory md:grid-cols-2">
        <div className="relative aspect-square md:aspect-auto md:min-h-[520px]">
          <AnimatePresence mode="wait">
            <motion.div key={displayedImage} initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }} className="absolute inset-0">
              <ProductImage src={displayedImage} alt={product.name} fill className="object-cover" sizes="50vw" />
            </motion.div>
          </AnimatePresence>
          <button type="button" onClick={() => setSelectedImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length)} className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white">‹</button>
          <button type="button" onClick={() => setSelectedImageIndex((prev) => (prev + 1) % gallery.length)} className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white">›</button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {gallery.map((_, index) => (
              <button key={index} type="button" onClick={() => setSelectedImageIndex(index)} className={`h-2 w-2 rounded-full ${selectedImageIndex === index ? "bg-ivory" : "bg-white/60"}`} />
            ))}
          </div>
          <div className="absolute inset-0 touch-none" onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)} onTouchEnd={(e) => {
            if (touchStartX === null) return;
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) < 40) return;
            setSelectedImageIndex((prev) => (diff > 0 ? (prev + 1) % gallery.length : (prev - 1 + gallery.length) % gallery.length));
            setTouchStartX(null);
          }} />
        </div>
        <div className="p-6 md:p-8">
          <button onClick={onClose} className="text-sm text-ink/50">Close</button>
          <p className="mt-2 text-xs uppercase tracking-[.2em] text-ink/55">{product.category}</p>
          <h2 className="font-display text-4xl">{product.name}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-2xl">
            <span>{formatMoney(discounted, currency)}</span>
            {product.discountPercent ? <span className="text-sm text-ink/50 line-through">{formatMoney(originalPrice, currency)}</span> : null}
          </div>
          {product.discountPercent ? <p className="mt-2 text-sm text-pine">{product.discountPercent}% off</p> : null}
          <p className="mt-4 text-sm leading-7 text-ink/70">{product.description}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[.18em] text-ink/55">Color</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {colors.map((c) => <button key={c} onClick={() => { setColor(c); const ns = product.variants.find((v) => v.color === c && v.quantity > 0)?.size; if (ns) setSize(ns); }} className={`h-9 rounded-full border px-3 text-sm transition ${color === c ? "border-ink bg-ink text-ivory shadow-lg" : "border-ink/25"}`}>{c}</button>)}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[.18em] text-ink/55">Size</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {sizes.map((s) => <button key={s} onClick={() => setSize(s)} className={`h-9 rounded-full border px-3 text-sm transition ${size === s ? "border-ink bg-ink text-ivory shadow-lg" : "border-ink/25"}`}>{s}</button>)}
              </div>
            </div>
          </div>
          {gallery.length > 1 && (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-[.18em] text-ink/55">More views</p>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                {gallery.map((src, index) => (
                  <button key={src} onClick={() => setSelectedImageIndex(index)} className={`relative shrink-0 overflow-hidden rounded-2xl border ${selectedImageIndex === index ? "border-ink" : "border-ink/10"} h-20 w-20`}>
                    <ProductImage src={src} alt={`View ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
          <p className="mt-4 text-sm text-ink/70">Estimated delivery in {product.deliveryDays ?? 3} day{product.deliveryDays === 1 ? "" : "s"}.</p>
          <p className="mt-3 text-sm text-pine">{variant && variant.quantity > 0 ? `${variant.quantity} in stock` : "Out of stock"}</p>
          <button disabled={!variant || variant.quantity === 0} onClick={() => { addToCart(product.id, variant!.id); onClose(); }} className="mt-6 h-12 w-full rounded-full bg-pine text-sm text-ivory shadow-lg transition disabled:cursor-not-allowed disabled:opacity-40">Add to bag</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
