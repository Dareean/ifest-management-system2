import { ColorBlock } from "@/components/blocks/color-block";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getDivisionsWithMembers } from "@/lib/data/admin-data";
import { DivisionClient } from "./client";

export default async function AdminDivisionsPage() {
  const divisions = await getDivisionsWithMembers();
  return <DivisionClient divisions={divisions} />;
}
