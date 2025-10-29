// src/app/talent/profile/page.tsx
"use client";

import Link from "next/link";
import { useSession } from "@/lib/use-session";
import IntlPhoneInput from "@/components/forms/IntlPhoneInput";
import { useEffect, useState } from "react";

export default function TalentProfilePage() {
  const { user, loading } = useSession();
  const [phone, setPhone] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [msgOk, setMsgOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) setPhone(user.phone || "");
  }, [user]);

  async function uploadResumeIfAny(): Promise<{
    url?: string;
    fileName?: string;
    publicId?: string;
  }> {
    if (!resumeFile) return {};
    const signRes = await fetch("/api/cloudinary/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder: "equatoria-resumes" }),
    });
    if (!signRes.ok) throw new Error("Failed to get upload signature");
    const { ok, cloudName, apiKey, timestamp, folder, signature } =
      await signRes.json();
    if (!ok) throw new Error("Signature invalid");

    const form = new FormData();
    form.append("file", resumeFile);
    form.append("api_key", apiKey);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);
    form.append("folder", folder);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
    const upRes = await fetch(uploadUrl, { method: "POST", body: form });
    if (!upRes.ok) throw new Error("Resume upload failed");
    const json = await upRes.json();

    return {
      url: json.secure_url as string,
      fileName: resumeFile.name,
      publicId: json.public_id as string,
    };
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setMsgOk(null);
    try {
      const resume = await uploadResumeIfAny();
      const res = await fetch("/api/talent/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, ...(resume.url ? { resume } : {}) }),
      });
      if (!res.ok) throw new Error("Update failed");
      setMsg("Profile updated!");
      setMsgOk(true);
      // If your useSession() exposes refresh(), you can un-comment:
      // await refresh?.();
    } catch (e: any) {
      setMsg(e.message || "Failed to update profile.");
      setMsgOk(false);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;

  return (
    <div className="max-w-md mx-auto mt-12">
      {/* Top: Back to dashboard */}
      <div className="mb-4">
        <Link
          href="/talent"
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-sm text-gray-800 backdrop-blur hover:bg-gray-50"
        >
          <span aria-hidden>←</span> Back to dashboard
        </Link>
      </div>

      <h2 className="text-xl font-bold mb-4">Profile Settings</h2>

      {/* Read-only basics */}
      <div className="mb-4 rounded-xl border bg-white p-4 text-sm text-gray-700 space-y-1">
        <div>
          <span className="text-gray-500">Name:</span> {user?.name || "—"}
        </div>
        <div>
          <span className="text-gray-500">Email:</span> {user?.email || "—"}
        </div>
        {user?.linkedin && (
          <div className="truncate">
            <span className="text-gray-500">LinkedIn:</span>{" "}
            <a href={user.linkedin} target="_blank" className="underline">
              {user.linkedin}
            </a>
          </div>
        )}
      </div>

      <form onSubmit={onSave} className="grid gap-4">
        <IntlPhoneInput value={phone} onChange={setPhone} />

        <div className="rounded-xl border p-3">
          <div className="text-sm font-medium mb-1">Resume</div>
          {user?.resume?.url ? (
            <div className="text-sm mb-2">
              Current:{" "}
              <a
                href={user.resume.url}
                target="_blank"
                className="underline text-emerald-700"
              >
                {user.resume.fileName || "View"}
              </a>
            </div>
          ) : (
            <div className="text-xs text-gray-500 mb-2">No resume on file.</div>
          )}
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
          />
        </div>

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
    </div>
  );
}
/* eslint-disable @typescript-eslint/no-explicit-any */
