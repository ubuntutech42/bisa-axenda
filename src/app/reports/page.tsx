import { Header } from '@/components/layout/Header';
import { AiInsights } from '@/components/reports/AiInsights';
import { TimeDistributionChart } from '@/components/reports/TimeDistributionChart';

export default function ReportsPage() {
  return (
    <div>
      <Header title="Relatórios & Insights" />
      <div className="space-y-8">
        <TimeDistributionChart />
        <AiInsights />
      </div>
    </div>
  );
}
