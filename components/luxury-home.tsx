"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const collections = [
  { name: "Atelier Leather", price: "from INR 42,000", swatch: "bg-clay", img: "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=1200&q=85" },
  { name: "Travel Objects", price: "from INR 68,000", swatch: "bg-pine", img: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1200&q=85" },
  { name: "Evening Silks", price: "from INR 24,000", swatch: "bg-brass", img: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85" }
];

const nav = ["New In", "Women", "Men", "Leather", "Journal"];

export default function LuxuryHome() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 180]);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 34 },
        { autoAlpha: 1, y: 0, duration: .9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 82%" } }
      );
    });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <main className="grain min-h-screen overflow-hidden">
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between px-5 text-sm text-ivory mix-blend-difference md:px-10">
        <button className="h-10 w-10 border border-current text-lg" aria-label="Open menu">+</button>
        <a className="font-display text-2xl tracking-[.22em]" href="#">MURGDUR</a>
        <nav className="hidden gap-7 md:flex">
          {nav.map((item) => <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`}>{item}</a>)}
        </nav>
      </header>

      <section ref={heroRef} className="relative flex min-h-[92svh] items-end overflow-hidden bg-ink text-ivory">
        <motion.div style={{ y }} className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=2200&q=90"
            alt="Murgdur runway look in warm evening light"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
        <div className="hero-mask absolute inset-0" />
        <div className="relative z-10 w-full px-5 pb-12 md:px-10 md:pb-16">
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} className="mb-4 text-xs uppercase tracking-[.32em]">
            Pre-Fall 2026 Collection
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9, delay: .1 }} className="max-w-5xl font-display text-[clamp(4rem,15vw,12rem)] leading-[.82]">
            Murgdur
          </motion.h1>
          <div className="mt-8 flex flex-col justify-between gap-5 border-t border-ivory/45 pt-5 md:flex-row md:items-end">
            <p className="max-w-xl text-base leading-7 text-ivory/90 md:text-lg">
              Luxury fashion, travel leather, and editorial releases engineered for global scale.
            </p>
            <a href="#new-in" className="inline-flex h-12 w-fit items-center border border-ivory px-7 text-sm uppercase tracking-[.18em] transition hover:bg-ivory hover:text-ink">
              Explore
            </a>
          </div>
        </div>
      </section>

      <section id="new-in" className="px-5 py-16 md:px-10 md:py-24">
        <div data-reveal className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <h2 className="font-display text-5xl md:text-7xl">New objects of desire</h2>
          <p className="max-w-md leading-7 text-ink/70">ISR pages pull collection stories from Sanity, while pricing and availability stay API-driven for cache-safe commerce.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {collections.map((item) => (
            <article data-reveal key={item.name} className="group bg-pearl">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image src={item.img} alt={item.name} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <div className="flex items-center justify-between p-5">
                <div>
                  <h3 className="font-display text-2xl">{item.name}</h3>
                  <p className="mt-1 text-sm uppercase tracking-[.16em] text-ink/55">{item.price}</p>
                </div>
                <span className={`h-8 w-8 ${item.swatch}`} aria-hidden />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-pine px-5 py-16 text-ivory md:px-10 md:py-24">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:items-end">
          <div data-reveal>
            <p className="mb-4 text-xs uppercase tracking-[.32em] text-ivory/70">Scalable commerce core</p>
            <h2 className="font-display text-5xl md:text-7xl">Built for 100k concurrent shoppers.</h2>
          </div>
          <div data-reveal className="grid gap-3 sm:grid-cols-2">
            {["Next.js ISR + CDN edge cache", "Redis Cluster sessions and cache", "Postgres replicas via PgBouncer", "BullMQ jobs for media, mail, sync", "Meilisearch under 50ms discovery", "Tempo, Loki, Sentry, Prometheus"].map((item) => (
              <div key={item} className="border border-ivory/25 p-5 text-sm uppercase tracking-[.12em] text-ivory/85">{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section id="journal" className="grid min-h-[72svh] md:grid-cols-2">
        <div className="relative min-h-[420px]">
          <Image src="https://images.unsplash.com/photo-1506629905607-d405d7d3b0d2?auto=format&fit=crop&w=1400&q=85" alt="Craft studio detail" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="flex items-center px-5 py-16 md:px-14">
          <div data-reveal>
            <p className="mb-5 text-xs uppercase tracking-[.32em] text-clay">Maison journal</p>
            <h2 className="font-display text-5xl md:text-7xl">Campaigns can preview before publish.</h2>
            <p className="mt-6 max-w-lg leading-7 text-ink/70">Sanity preview mode gives the marketing team editorial control without redeploying the storefront.</p>
            <a href="#architecture" className="mt-8 inline-flex h-12 items-center border border-ink px-7 text-sm uppercase tracking-[.18em]">Architecture</a>
          </div>
        </div>
      </section>

      <footer id="architecture" className="px-5 py-10 text-sm text-ink/70 md:px-10">
        <div className="flex flex-col justify-between gap-4 border-t border-ink/20 pt-6 md:flex-row">
          <span>MURGDUR luxury platform</span>
          <span>Next.js · NestJS · PostgreSQL · Redis · Meilisearch · EKS · ArgoCD</span>
        </div>
      </footer>
    </main>
  );
}
