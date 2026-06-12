"use client";

import { LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import type { Customer } from "@/lib/types";
import { Panel } from "./shared";

type Props = {
  customer: Customer | null;
  onLogin: (c: Customer) => void;
  onNotice: (msg: string) => void;
};

export function AuthView({ customer, onLogin, onNotice }: Props) {
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [form, setForm] = useState({ email: "", name: "", phone: "", password: "", otp: "" });
  const [devOtp, setDevOtp] = useState("");
  const [profile, setProfile] = useState({ name: "", phone: "" });

  useEffect(() => {
    if (customer) {
      setProfile({ name: customer.name, phone: customer.phone });
    }
  }, [customer]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function login() {
    const res = await fetch("/api/auth/login", { method: "POST", body: JSON.stringify({ email: form.email, password: form.password }) });
    const data = await res.json();
    if (!res.ok) return onNotice(data.message || "Login failed");
    onLogin(data);
    onNotice("Welcome back.");
  }

  async function sendOtp(purpose: "signup" | "reset") {
    const res = await fetch("/api/auth/otp", { method: "POST", body: JSON.stringify({ purpose, email: form.email, name: form.name, phone: form.phone, password: form.password }) });
    const data = await res.json();
    if (!res.ok) return onNotice(data.message || "OTP failed");
    setDevOtp(data.devOtp || "");
    onNotice(data.devOtp ? `OTP (dev): ${data.devOtp}` : "OTP sent to email.");
  }

  async function signup() {
    const res = await fetch("/api/auth/signup", { method: "POST", body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) return onNotice(data.message || "Signup failed");
    onLogin(data);
    onNotice("Account created.");
  }

  async function reset() {
    const res = await fetch("/api/auth/reset", { method: "POST", body: JSON.stringify({ email: form.email, otp: form.otp, password: form.password }) });
    const data = await res.json();
    if (!res.ok) return onNotice(data.message || "Reset failed");
    onLogin(data);
    onNotice("Password updated.");
    setMode("login");
  }

  async function saveProfile() {
    const res = await fetch("/api/customer", { method: "PATCH", body: JSON.stringify({ email: customer?.email, name: profile.name, phone: profile.phone }) });
    const data = await res.json();
    if (!res.ok) return onNotice(data.message || "Could not update profile");
    onLogin(data);
    onNotice("Profile updated.");
  }

  if (customer) {
    return (
      <Panel title="Profile">
        <div className="grid gap-3 max-w-lg border border-ink/10 bg-white/45 p-6">
          <label className="grid gap-2 text-sm">
            <span>Name</span>
            <input className="field" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </label>
          <label className="grid gap-2 text-sm">
            <span>Phone</span>
            <input className="field" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          </label>
          <label className="grid gap-2 text-sm">
            <span>Email</span>
            <input className="field bg-ivory/50" value={customer.email} disabled />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={saveProfile} className="h-11 bg-ink px-5 text-ivory">Save contact</button>
          </div>
          <p className="mt-4 text-xs text-ink/55">Role: {customer.role}</p>
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="Account">
      <div className="mb-4 flex gap-2">
        {(["login", "signup", "reset"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`h-10 border px-4 text-sm capitalize ${mode === m ? "border-ink bg-ink text-ivory" : "border-ink/20"}`}>{m}</button>
        ))}
      </div>
      <div className="grid max-w-2xl gap-3 md:grid-cols-2">
        <input className="field" placeholder="Email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        {mode !== "reset" && <input className="field" placeholder="Password" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} />}
        {mode === "signup" && <>
          <input className="field" placeholder="Name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          <input className="field" placeholder="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </>}
        {(mode === "signup" || mode === "reset") && <input className="field" placeholder="OTP" value={form.otp} onChange={(e) => set("otp", e.target.value)} />}
        {mode === "reset" && <input className="field" placeholder="New password" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} />}
      </div>
      {devOtp && <p className="mt-2 text-xs text-brass">Dev OTP: {devOtp}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {mode === "login" && <button onClick={login} className="inline-flex h-11 items-center gap-2 bg-ink px-5 text-ivory"><LogIn size={18} /> Login</button>}
        {mode === "signup" && <>
          <button onClick={() => sendOtp("signup")} className="h-11 border border-ink px-5">Send OTP</button>
          <button onClick={signup} className="h-11 bg-ink px-5 text-ivory">Create Account</button>
        </>}
        {mode === "reset" && <>
          <button onClick={() => sendOtp("reset")} className="h-11 border border-ink px-5">Send OTP</button>
          <button onClick={reset} className="h-11 bg-ink px-5 text-ivory">Reset Password</button>
        </>}
      </div>
      <p className="mt-4 text-xs text-ink/55">Sign up to create an account. Admin users must be seeded in the database.</p>
    </Panel>
  );
}
