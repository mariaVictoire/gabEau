"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";
import { HomeLink } from "@/components/ui/HomeLink";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await login(email, password);
      if (result.success) {
        router.push(result.role === "agent" ? "/agent/deliveries" : "/admin/dashboard");
        router.refresh();
      } else {
        setError(result.error || "Erreur de connexion");
      }
    });
  }

  return (
    <div className="min-h-screen flex flex-col safe-x bg-gabon-blue-light/30">
      <div className="gabon-tricolor" aria-hidden />
      <header className="bg-gradient-to-br from-gabon-blue via-gabon-blue-dark to-gabon-green px-4 pt-8 pb-10 safe-top text-center">
        <Link href="/admin" className="inline-flex justify-center mb-4">
          <Logo size="lg" light />
        </Link>
        <h1 className="text-xl font-bold text-white">Connexion administration</h1>
        <p className="text-sm text-white/75 mt-1">Opérateurs et coordinateurs</p>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 -mt-6 pb-8">
        <div className="w-full max-w-md">
          <Card className="shadow-xl ring-1 ring-gabon-blue/10">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Mot de passe"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <Button type="submit" loading={isPending} className="w-full" size="lg">
                Se connecter
              </Button>
            </form>
            <div className="mt-6 flex flex-col items-center gap-3 text-sm">
              <Link href="/admin" className="font-semibold text-gabon-blue hover:underline">
                ← Retour à l&apos;espace admin
              </Link>
              <HomeLink />
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
