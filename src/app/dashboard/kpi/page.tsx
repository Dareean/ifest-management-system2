import { getAllKpisWithTasks, getDivisionKpiSummaries } from "@/lib/data/kpi";
import { KpiClient } from "./client";

export default async function KpiPage() {
  const [kpis, summaries] = await Promise.all([
    getAllKpisWithTasks(),
    getDivisionKpiSummaries(),
  ]);

  return <KpiClient kpis={kpis} summaries={summaries} />;
}
