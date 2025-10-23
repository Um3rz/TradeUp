"use client";
import Image from "next/image";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Minimal, fluid, highly‑styled auth UI for Next.js (app router friendly)
 *
 * Backend (NestJS) contracts from your screenshots:
 *  - Controller base: /auth
 *  - POST /auth/login    body: { email: string, password: string }
 *  - POST /auth/signup   body: { email: string, password: string, role?: 'TRADER' | 'ADMIN' }
 *  - Success response: { access_token: string }
 *  - Errors:
 *      - 409 Conflict: "Email already registered"
 *      - 401 Unauthorized: "Invalid credentials"
 *
 * Notes
 *  - Role is optional; backend defaults to 'TRADER' if omitted.
 *  - Set NEXT_PUBLIC_API_BASE_URL to your Nest server (e.g. http://localhost:3001).
 */

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<"TRADER" | "ADMIN" | "">(""); // optional per backend
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const router = useRouter();

  function browseAsGuest() {
    // ensure guest: no lingering JWT
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
    router.push("/dashboard");
  }

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?  process.env.NEXT_PUBLIC_API_BASE_URL : "http://localhost:3001";

  function validate() {
    if (!email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email.";
    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters."; // matches DTO
    if (mode === "signup") {
      if (confirm !== password) return "Passwords do not match.";
    }
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const err = validate();
    if (err) {
      setMessage({ type: "error", text: err });
      return;
    }
    setIsLoading(true);
    try {
      const url = mode === "signin" ? "/auth/login" : "/auth/signup";
      const body: any = { email: email.trim(), password };
      if (mode === "signup" && role) body.role = role; // optional; backend falls back to TRADER

      const res = await fetch(`${API_BASE}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const serverMsg = (data && (data.message || data.error)) || "Something went wrong.";
        throw new Error(Array.isArray(serverMsg) ? serverMsg.join(" \u2022 ") : serverMsg);
      }

      if (mode === "signin") {
        const token = data?.access_token;
        if (typeof token === "string" && token.length > 0) {
          // Store token (quick start). For production, prefer an httpOnly cookie via Next route handler.
          localStorage.setItem("access_token", token);
        }
        setMessage({ type: "success", text: "Signed in successfully." });
        router.push("/dashboard");
      } else {
        setMessage({ type: "success", text: "Account created. You can sign in now." });
        setMode("signin");
        setPassword("");
        setConfirm("");
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e?.message || "Request failed." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-svh w-full bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Background shape */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-black/10 to-black/0 blur-2xl" aria-hidden />

        {/* Card */}
        <section className="relative rounded-3xl bg-white/70 backdrop-blur-xl shadow-[0_6px_40px_rgba(0,0,0,0.07)] ring-1 ring-black/5 overflow-hidden">
          {/* Header */}
          <header className="px-6 pt-6 pb-2">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
            <p className="mt-1 text-sm text-neutral-600">
              {mode === "signin" ? "Sign in to continue." : "It takes less than a minute."}
            </p>
          </header>

          {/* Mode switch */}
          <div className="px-6 pt-2">
            <div className="inline-flex rounded-full bg-neutral-100 p-1">
              <button
                onClick={() => setMode("signin")}
                aria-pressed={mode === "signin"}
                className={`px-4 py-1.5 text-sm rounded-full transition-all ${
                  mode === "signin" ? "bg-white shadow text-neutral-900" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Sign in
              </button>
              <button
                onClick={() => setMode("signup")}
                aria-pressed={mode === "signup"}
                className={`px-4 py-1.5 text-sm rounded-full transition-all ${
                  mode === "signup" ? "bg-white shadow text-neutral-900" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Sign up
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="px-6 pt-4 pb-6 space-y-4">
            <Field label="Email" htmlFor="email">
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input text-neutral-900 placeholder:text-neutral-400 caret-neutral-900"
                placeholder="you@example.com"
              />
            </Field>

            <Field label="Password" htmlFor="password">
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field-input text-neutral-900 placeholder:text-neutral-400 caret-neutral-900"
                  placeholder={mode === "signin" ? "Your password" : "6+ characters"}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 px-3 text-neutral-500 hover:text-neutral-800"
                >
                  {showPw ? 
                    (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M10.58 10.58a3 3 0 004.24 4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M9.88 5.08A10.4 10.4 0 0121 12s-2.5 4.5-9 4.5c-.73 0-1.43-.06-2.08-.17M6.12 8.01A10.5 10.5 0 003 12s2.5 4.5 9 4.5c.36 0 .71-.01 1.05-.04" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>)
                    :
                    (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" stroke="currentColor" strokeWidth="1.5"/><path d="M3 12s2.5-6 9-6 9 6 9 6-2.5 6-9 6-9-6-9-6z" stroke="currentColor" strokeWidth="1.5"/></svg>)}
                </button>
              </div>
            </Field>

            {mode === "signup" && (
              <Field label="Role (optional)" htmlFor="role">
                <div className="flex gap-2">
                  <RoleChip current={role} onPick={setRole} value="TRADER" />
                  <RoleChip current={role} onPick={setRole} value="ADMIN" />
                  <button type="button" onClick={() => setRole("") } className="text-xs text-neutral-500 underline ml-2">Clear</button>
                </div>
              </Field>
            )}

            {mode === "signup" && (
              <Field label="Confirm password" htmlFor="confirm">
                <input
                  id="confirm"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="field-input text-neutral-900 placeholder:text-neutral-400 caret-neutral-900"
                  placeholder="Repeat password"
                />
              </Field>
            )}

            {/* Alert */}
            {message && (
              <div
                role={message.type === "error" ? "alert" : "status"}
                className={`text-sm rounded-xl px-3 py-2 border ${
                  message.type === "error"
                    ? "bg-rose-50/80 text-rose-700 border-rose-200"
                    : "bg-emerald-50/80 text-emerald-700 border-emerald-200"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 text-white py-3 text-sm font-medium tracking-tight shadow-sm ring-1 ring-black/5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              {isLoading ? (
                <Spinner />
              ) : (
                <>
                  {mode === "signin" ? "Sign in" : "Create account"}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="opacity-90"
                  >
                    <path d="M5 12h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    <path d="M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>

            {/* Guest browse */}
            <div className="pt-2">
              <button
                type="button"
                onClick={browseAsGuest}
                className="w-full rounded-2xl bg-white ring-1 ring-black/10 text-neutral-900 py-2.5 text-sm hover:bg-neutral-50 shadow-sm transition"
              >
                Browse stocks as guest
              </button>
              <p className="mt-1 text-center text-xs text-neutral-500">
                You can view prices but must sign in to save to watchlist.
              </p>
            </div>

            {/* Footer switch */}
            <p className="text-center text-sm text-neutral-600 pt-1">
              {mode === "signin" ? (
                <>
                  Don’t have an account?{' '}
                  <button type="button" onClick={() => setMode("signup")} className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900 hover:text-neutral-900">
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={() => setMode("signin")} className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900 hover:text-neutral-900">
                    Sign in
                  </button>
                </>
              )}
            </p>
          </form>
        </section>

        {/* Small print */}
        <p className="mt-4 text-center text-xs text-neutral-500">
          By continuing, you agree to our <a className="underline hover:text-neutral-800" href="#">Terms</a> and <a className="underline hover:text-neutral-800" href="#">Privacy Policy</a>.
        </p>
      </div>

      {/* Inline styles for inputs to keep this file self‑contained */}
      <style>{`
        .field-input { width: 100%; appearance: none; background: white; border-radius: 1rem; padding: 0.75rem 0.875rem; border: 1px solid rgba(0,0,0,0.06); outline: none; box-shadow: 0 0 0 0 rgba(0,0,0,0); transition: box-shadow .2s, border-color .2s; }
        .field-input::placeholder { color: #9ca3af; }
        .field-input:focus { border-color: rgba(0,0,0,0.12); box-shadow: 0 0 0 6px rgba(0,0,0,0.04); }
      `}</style>
    </main>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block space-y-1.5">
      <span className="text-sm font-medium text-neutral-800">{label}</span>
      {children}
    </label>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="loading">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.15" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function RoleChip({ value, current, onPick }: { value: "TRADER" | "ADMIN"; current: string; onPick: (v: any) => void }) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onPick(value)}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-xl text-xs border transition ${
        active ? "bg-neutral-900 text-white border-neutral-900" : "bg-white border-neutral-200 text-neutral-700 hover:border-neutral-400"
      }`}
    >
      {value}
    </button>
  );
}


