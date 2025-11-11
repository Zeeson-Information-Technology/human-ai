"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/use-session";
import BrandLoader from "@/components/brand-loader";
import AdminStartForm from "./AdminStartForm";

export default function InterviewAdminStartPage() {
  const { user, loading } = useSession();
  const router = useRouter();

  // Redirect unauthorized users
  useEffect(() => {
    if (loading) return;
    const allowed = user && (user.role === "admin" || user.role === "company");
    if (!allowed) router.replace("/zuri/start");
  }, [user, loading, router]);

  const allowed = user && (user.role === "admin" || user.role === "company");

  // Premium loader while resolving auth/redirect
  if (loading || !allowed) return <BrandLoader />;

  return <AdminStartForm />;
}
