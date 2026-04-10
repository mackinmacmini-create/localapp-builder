import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — LocalApp Builder",
  description: "Build and manage your branded mobile app.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
