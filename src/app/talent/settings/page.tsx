// src/app/talent/settings/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useSession } from "@/lib/use-session";
import SettingsLayout from "@/components/settingsLayout";
import ProfileTab from "@/components/settings/profileTab";
import CommunicationTab from "@/components/settings/communicationTab";
import AvailabilityTab from "@/components/settings/availabilityTab";
import { useEffect, useState } from "react";

export default function TalentSettingsPage() {
  const { user, loading } = useSession();
  const params = useSearchParams();
  const tab = params.get("tab") || "profile";
  const [busy, setBusy] = useState(false);

  async function uploadResume(file: File) {
    setBusy(true);
    try {
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "equatoria-resumes" }),
      });
      const sig = await signRes.json();
      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", sig.apiKey);
      fd.append("timestamp", String(sig.timestamp));
      fd.append("signature", sig.signature);
      fd.append("folder", sig.folder);
      const up = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/raw/upload`,
        { method: "POST", body: fd }
      );
      const json = await up.json();

      await fetch("/api/talent/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: {
            url: json.secure_url,
            fileName: file.name,
            publicId: json.public_id,
          },
        }),
      });
    } finally {
      setBusy(false);
    }
  }

  if (loading) return null;

  return (
    <SettingsLayout heading="Settings">
      {tab === "profile" && (
        <ProfileTab
          user={user}
          onUploadResume={uploadResume}
          onSaveBasic={async (data) => {
            await fetch("/api/talent/update-profile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
          }}
        />
      )}
      {tab === "communication" && (
        <CommunicationTab
          initial={{
            openToWork: user?.openToWork,
            email: user?.email,
            phone: user?.phone,
            whatsapp: user?.whatsapp,
            minMonthly: user?.minMonthly ?? undefined,
            minHourly: user?.minHourly ?? undefined,
            interests: user?.interests || [],
            allowEmail: user?.allowEmail,
            allowPhone: user?.allowPhone,
            allowWhatsApp: user?.allowWhatsApp,
          }}
          onSave={async (data) => {
            await fetch("/api/talent/update-communication", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
          }}
          showComp={true}
          lockEmail={true}
        />
      )}
      {tab === "availability" && (
        <AvailabilityTab
          initial={{
            timezone: user?.timezone ?? undefined,
            hoursPerWeek: user?.hoursPerWeek ?? undefined,
            daysAvailable: user?.daysAvailable ?? undefined,
            startHour: user?.startHour ?? undefined,
            endHour: user?.endHour ?? undefined,
          }}
          onSave={async (data) => {
            await fetch("/api/talent/update-availability", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
          }}
        />
      )}
    </SettingsLayout>
  );
}
