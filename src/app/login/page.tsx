import type { Metadata } from "next";
import { LoginForm } from "./form";

export const metadata: Metadata = {
  title: "Login | I-FEST Management System",
};

export default function LoginPage() {
  return <LoginForm />;
}
