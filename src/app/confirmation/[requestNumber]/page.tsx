import Link from "next/link";
import { notFound } from "next/navigation";
import { getRequestByNumber } from "@/actions/requests";
import { CitizenLayout } from "@/components/layout/CitizenLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatPrice, getOrderDisplay } from "@/lib/business-rules";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ requestNumber: string }>;
}) {
  const { requestNumber } = await params;
  const request = await getRequestByNumber(requestNumber);
  if (!request) notFound();

  const order = getOrderDisplay(request);

  return (
    <CitizenLayout>
      <Card className="text-center overflow-hidden !p-0">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 px-6 py-8 text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm text-3xl mb-3">
            ✓
          </div>
          <h1 className="text-2xl font-bold">Demande enregistrée !</h1>
          <p className="text-emerald-100 text-sm mt-1">
            Conservez bien votre numéro de demande
          </p>
        </div>

        <div className="px-6 py-6">
          <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 px-4 py-4 mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Numéro de demande
            </p>
            <p className="text-2xl font-bold text-blue-700 mt-1 font-mono tracking-wide">
              {request.request_number}
            </p>
          </div>

          <dl className="space-y-0 text-sm mb-6 divide-y divide-slate-100">
            {[
              { label: "Date", value: formatDate(request.created_at) },
              { label: "Quartier", value: request.district },
              { label: "Commande", value: order.label },
              { label: "Montant", value: formatPrice(order.price) },
              { label: "Téléphone", value: request.phone },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-3">
                <dt className="text-slate-400">{label}</dt>
                <dd className="font-medium text-slate-800">{value}</dd>
              </div>
            ))}
            <div className="flex justify-between items-center py-3">
              <dt className="text-slate-400">Statut</dt>
              <dd><StatusBadge status={request.status} /></dd>
            </div>
          </dl>

          <div className="flex flex-col gap-3">
            <Link href={`/track?number=${request.request_number}&phone=${request.phone}`}>
              <Button variant="outline" className="w-full">
                Suivre ma demande
              </Button>
            </Link>
            <Link href="/commander">
              <Button variant="secondary" className="w-full">
                Nouvelle demande
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full">
                Retour à l&apos;accueil
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </CitizenLayout>
  );
}
