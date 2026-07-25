import { redirect } from "next/navigation";

export default function KpiPageRedirect() {
  redirect("/dashboard/tasks");
}
