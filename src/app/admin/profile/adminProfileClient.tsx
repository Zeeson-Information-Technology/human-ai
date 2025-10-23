// src/app/admin/profile/AdminProfileClient.tsx
"use client";

import { useEffect, useState } from "react";
import IntlPhoneInput from "@/components/forms/IntlPhoneInput";
import { useRouter } from "next/navigation";

type AdminProfileInitial = {
  name: string;
  email: string;
  phone?: string;
};

export default function AdminProfileClient({
  initial,
}: {
  initial: AdminProfileInitial;
}) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [msgOk, setMsgOk] = useState<boolean | null>(null);

  useEffect(() => {
    setPhone(initial.phone ?? "");
  }, [initial.phone]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setMsgOk(null);
    try {
      const res = await fetch("/api/admin/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error("Update failed");
      setMsg("Profile updated!");
      setMsgOk(true);
      router.refresh(); // re-fetch server data if needed
    } catch (e: any) {
      setMsg(e.message || "Failed to update profile.");
      setMsgOk(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSave} className="grid gap-4">
      <IntlPhoneInput value={phone} onChange={setPhone} />
      <button
        type="submit"
        className="rounded-xl bg-white px-4 py-3 font-medium 
        text-gray-500 hover:opacity-90 disabled:opacity-60 cursor-pointer"
        disabled={saving}
      >
        {saving ? "Saving..." : "Save"}
      </button>
      {msg && (
        <div className={msgOk ? "text-emerald-700" : "text-red-600"}>{msg}</div>
      )}
    </form>
  );
}
