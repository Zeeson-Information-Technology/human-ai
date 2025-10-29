// src/components/settings/ProfileTab.tsx
"use client";

import { useState } from "react";

export default function ProfileTab({
  user,
  onUploadResume,
  onSaveBasic,
  showResume = true, // ← add this
}: {
  user: {
    name?: string;
    email?: string;
    avatarUrl?: string;
    resume?: { url?: string; fileName?: string };
  } | null;
  onUploadResume?: (file: File) => Promise<void>; // make optional if showResume=false
  onSaveBasic: (data: { name?: string; avatarUrl?: string }) => Promise<void>;
  showResume?: boolean; // ← add this
}) {
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveBasics(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveBasic({ name });
      // (Handle avatar upload if you wire Cloudinary for images)
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      {/* Profile form... */}

      {/* Resume */}
      {showResume && (
        <div className="grid gap-2">
          <div className="text-sm font-semibold">Resume</div>
          <div className="flex items-center gap-3">
            {user?.resume?.url ? (
              <>
                <a
                  href={user.resume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-emerald-700"
                >
                  {user.resume.fileName || "View Resume"}
                </a>
                <label className="rounded-lg border px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-50 cursor-pointer">
                  Replace
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f && onUploadResume) await onUploadResume(f);
                    }}
                  />
                </label>
              </>
            ) : (
              <label className="rounded-lg border px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-50 cursor-pointer">
                Upload
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f && onUploadResume) await onUploadResume(f);
                  }}
                />
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
