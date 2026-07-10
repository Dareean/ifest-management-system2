import { getRoles } from "@/lib/data/admin-data";
import { RolesClient } from "./client";

export default async function AdminRolesPage() {
  const roles = await getRoles();
  return <RolesClient roles={roles} />;
}
