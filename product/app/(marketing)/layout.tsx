import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingHeader />
      <main className="min-h-screen">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
