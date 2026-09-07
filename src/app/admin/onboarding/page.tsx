import { redirect } from "next/navigation";

export default async function AdminOnboardingRedirect({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) || {};
  const next = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value.trim()) {
      next.set(key, value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (item && item.trim()) next.append(key, item);
      }
    }
  }

  const query = next.toString();
  redirect(
    query
      ? `/zuri/start/reset-password?${query}`
      : "/zuri/start/reset-password"
  );
}
