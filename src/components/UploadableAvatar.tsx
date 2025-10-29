// src/components/UploadableAvatar.tsx
"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";

export default function UploadableAvatar({
  name,
  email,
  url,
  size = 40,
  onChanged,
}: {
  name?: string;
  email?: string;
  url?: string | null;
  size?: number;
  onChanged?: (nextUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const initials = useMemo(() => {
    const n = (name || email || "?").trim();
    const parts = n.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return n[0]?.toUpperCase() || "?";
  }, [name, email]);

  async function handlePick() {
    inputRef.current?.click();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      // 1) get Cloudinary signature
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "equatoria-avatars" }),
      });
      if (!signRes.ok) throw new Error("Signature failed");
      const { ok, cloudName, apiKey, timestamp, folder, signature } =
        await signRes.json();
      if (!ok) throw new Error("Signature invalid");

      // 2) upload
      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", apiKey);
      fd.append("timestamp", String(timestamp));
      fd.append("signature", signature);
      fd.append("folder", folder);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const up = await fetch(uploadUrl, { method: "POST", body: fd });
      if (!up.ok) throw new Error("Upload failed");
      const j = await up.json();

      // 3) save to profile
      const save = await fetch("/api/talent/update-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: j.secure_url, publicId: j.public_id }),
      });
      if (!save.ok) throw new Error("Profile update failed");

      onChanged?.(j.secure_url);
    } catch (err) {
      console.error(err);
      // optionally toast
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handlePick}
        title={busy ? "Uploading…" : "Change photo"}
        className="relative flex items-center justify-center rounded-full border border-white/10 bg-white/10 hover:bg-white/20 transition"
        style={{ width: size, height: size }}
        disabled={busy}
      >
        {url ? (
          <Image
            src={url}
            alt="avatar"
            fill
            sizes={`${size}px`}
            className="rounded-full object-cover"
            style={{ position: "absolute" }}
          />
        ) : (
          <span className="text-xs font-semibold text-white">{initials}</span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
