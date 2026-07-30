import { getFinanceReport } from "@/lib/data/finance";
import { ReportClient } from "./client";

export default async function FinanceReportPage() {
  const report = await getFinanceReport();
  return <ReportClient report={report} />;
}
