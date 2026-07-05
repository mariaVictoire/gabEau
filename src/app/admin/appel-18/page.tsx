import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/navigation";
import { RequestForm } from "@/components/RequestForm";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function Appel18Page() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (user.role === "agent") {
    redirect("/agent/deliveries");
  }

  if (!["operator", "coordinator", "admin"].includes(user.role)) {
    redirect("/admin/login");
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Appel 18 — Prise de commande</h1>
        <p className="text-sm text-slate-500 mt-1">
          Connecté en tant que <strong className="text-slate-700">{user.full_name}</strong> — la
          demande sera assignée automatiquement à un agent.
        </p>
      </div>

      <Card className="!p-4 bg-gabon-blue-light/30 border-gabon-blue/20">
        <p className="text-sm text-slate-700">
          <strong className="text-gabon-blue-dark">Au téléphone :</strong> notez nom, téléphone,
          quartier, adresse et la commande. Communiquez ensuite le{" "}
          <strong>n° de demande</strong> au citoyen pour le suivi.
        </p>
      </Card>

      <RequestForm mode="admin" />
    </div>
  );
}
