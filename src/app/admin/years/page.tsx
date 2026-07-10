import { getYears } from "@/lib/data/admin-data";
import { YearsClient } from "./client";

export default async function AdminYearsPage() {
  const years = await getYears();
  return <YearsClient years={years} />;
}
