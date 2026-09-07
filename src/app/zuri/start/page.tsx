import { redirect } from "next/navigation";

export default function ZuriStartPage() {
  redirect("/admin/login");
}
