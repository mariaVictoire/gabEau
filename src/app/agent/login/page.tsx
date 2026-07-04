"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { loginAgent } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";
import { HomeLink } from "@/components/ui/HomeLink";

export default function AgentLoginPage() {
  const router = useRouter();
  const [agentCode, setAgentCode] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await loginAgent(agentCode, pin);
      if (result.success) {
        if (result.role !== "agent") {
          setError("Ce compte n'est pas un compte agent.");
          return;
        }
        router.push("/agent/deliveries");
        router.refresh();
      } else {
        setError(result.error || "Erreur de connexion");
      }
    });
  }

  return (
    <div className="min-h-screen flex flex-col safe-x bg-gabon-yellow-light/40">
      <div className="gabon-tricolor" aria-hidden />
      <header className="bg-gradient-to-br from-gabon-green via-gabon-green-dark to-gabon-yellow px-4 pt-8 pb-10 safe-top text-center">
        <Link href="/agent" className="inline-flex justify-center mb-4">
          <Logo size="lg" light />
        </Link>
        <h1 className="text-xl font-bold text-white">Connexion agent</h1>
        <p className="text-sm text-white/85 mt-1">Code agent + PIN — pas besoin d&apos;email</p>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 -mt-6 pb-8">
        <div className="w-full max-w-md">
          <Card className="shadow-xl ring-1 ring-gabon-green/10">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Code agent"
                required
                placeholder="Ex: AG001"
                maxLength={12}
                autoComplete="username"
                value={agentCode}
                onChange={(e) => setAgentCode(e.target.value.toUpperCase())}
              />
              <Input
                label="Code PIN"
                type="password"
                required
                inputMode="numeric"
                pattern="[0-9]{4,6}"
                maxLength={6}
                autoComplete="current-password"
                placeholder="4 à 6 chiffres"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              />
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <Button type="submit" size="lg" loading={isPending} className="w-full">
                Se connecter
              </Button>
            </form>
            <div className="mt-6 flex flex-col items-center gap-3 text-sm">
              <Link href="/agent" className="font-semibold text-gabon-green hover:underline">
                ← Retour à l&apos;espace agent
              </Link>
              <HomeLink />
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
