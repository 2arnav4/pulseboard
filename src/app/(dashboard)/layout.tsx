import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";

/** Server-side session check (the proxy is only an optimistic first line). */
export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return <DashboardShell userId={session.user.id}>{children}</DashboardShell>;
}
