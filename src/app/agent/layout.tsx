import { AgentLayout } from "@/components/layout/AgentLayout";

export default function AgentLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AgentLayout>{children}</AgentLayout>;
}
