"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/use-session";
import AdminStartForm from "./AdminStartForm";

export default function InterviewAdminStartPage() {
  const { user, loading } = useSession();
  const router = useRouter();

  // Redirect unauthorized users
  useEffect(() => {
    if (loading) return;
    const allowed = user && (user.role === "admin" || user.role === "company");
    if (!allowed) router.replace("/interviewer/start");
  }, [user, loading, router]);

  const allowed = user && (user.role === "admin" || user.role === "company");

  // Stable placeholder until we know
  if (loading || !allowed) return null;

  return <AdminStartForm />;
}
