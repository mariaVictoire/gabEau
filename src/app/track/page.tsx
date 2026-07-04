import { CitizenLayout } from "@/components/layout/CitizenLayout";
import { TrackForm } from "@/components/TrackForm";

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ number?: string; phone?: string }>;
}) {
  const params = await searchParams;
  return (
    <CitizenLayout>
      <TrackForm
        initialNumber={params.number ?? ""}
        initialPhone={params.phone ?? ""}
      />
    </CitizenLayout>
  );
}
