import { AppShell } from "@/components/AppShell";

export default function AppAreaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
