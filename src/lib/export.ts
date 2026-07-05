import { STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants";
import { getOrderDisplay } from "@/lib/business-rules";
import type { Request } from "@/lib/types";

export function exportToCSV(requests: Request[]) {
  const headers = [
    "Numéro",
    "Nom",
    "Téléphone",
    "Quartier",
    "Adresse",
    "Commande",
    "Volume (L)",
    "Montant (FCFA)",
    "Statut",
    "Priorité",
    "Date",
  ];

  const rows = requests.map((r) => {
    const order = getOrderDisplay(r);
    return [
      r.request_number,
      r.full_name,
      r.phone,
      r.district,
      r.address_landmark,
      order.label,
      r.estimated_volume_liters,
      order.price,
      STATUS_LABELS[r.status],
      PRIORITY_LABELS[r.priority],
      new Date(r.created_at).toLocaleDateString("fr-FR"),
    ];
  });

  const csv = [headers, ...rows].map((row) => row.join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `gab-eau-demandes-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportToPDF(requests: Request[]) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.text("Gab'Eau - Liste des demandes", 14, 15);

  autoTable(doc, {
    startY: 25,
    head: [["N°", "Nom", "Quartier", "Commande", "Montant", "Statut", "Date"]],
    body: requests.map((r) => {
      const order = getOrderDisplay(r);
      return [
        r.request_number,
        r.full_name,
        r.district,
        order.label,
        `${order.price} FCFA`,
        STATUS_LABELS[r.status],
        new Date(r.created_at).toLocaleDateString("fr-FR"),
      ];
    }),
    styles: { fontSize: 8 },
  });

  doc.save(`gab-eau-demandes-${Date.now()}.pdf`);
}
