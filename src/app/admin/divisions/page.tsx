import { getDivisionsWithMembers } from "@/lib/data/admin-data";
import { DivisionClient } from "./client";

export default async function AdminDivisionsPage() {
  const divisions = await getDivisionsWithMembers();
  return <DivisionClient divisions={divisions} />;
}
