import { CitizenLayout } from "@/components/layout/CitizenLayout";
import { RequestForm } from "@/components/RequestForm";

export default function CommanderPage() {
  return (
    <CitizenLayout>
      <div className="mb-5 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
          Besoin d&apos;eau{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gabon-green to-gabon-blue">
            à Libreville ?
          </span>
        </h1>
      </div>
      <RequestForm />
    </CitizenLayout>
  );
}
