import React, { useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import { useLog } from "../api/useLog";
import { ApiError } from "../../../api/client";
import { dispatchToast } from "../../../shared/components/Toast/toastService";
import { TagFormFields, TagFormValues, vehicleDetailsFrom } from "../components/TagFormFields";
import { AmbientGlow } from "../../../shared/components/AmbientGlow";

// Only follow redirects to this site or logm8.com, never wherever a response says.
export function isSafeRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    return (
      parsed.origin === window.location.origin ||
      parsed.hostname === "logm8.com" ||
      parsed.hostname.endsWith(".logm8.com")
    );
  } catch {
    return false;
  }
}

// /tag/create?token=<setup link token>: scanning an unconfigured sticker lands here. The token
// is a service link for that sticker; submitting sets the sticker up and the same link then
// opens its new log.
export default function CreateTag() {
  const { configureTag } = useLog();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token") ?? "";

  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<TagFormValues>({
    Make: "",
    Model: "",
    Year: "",
    Vehicle: "Motorbike",
    Engine: "",
    Fuel: [],
    Transmission: "",
    Color: "",
    VinNumber: null,
    LicencePlate: null,
  });
  const setField = useCallback(
    <K extends keyof TagFormValues>(key: K, value: TagFormValues[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const url = await configureTag(token, vehicleDetailsFrom(form));
      if (url && isSafeRedirectUrl(url)) {
        window.location.href = url;
        return;
      }
      console.error("Setup returned a missing or unsafe URL:", url);
      dispatchToast("Your sticker is set up. Scan it again to open its log.", "success");
    } catch (err) {
      // The API client toasts every failure except a 404.
      if (err instanceof ApiError && err.status === 404) {
        dispatchToast("This sticker couldn't be found. Scan it again to start over.", "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen text-fg funnel-display-font bg-canvas">
      <AmbientGlow />
      {/* <Navbar onToggle={() => null} /> */}
      <div className="relative max-w-md mx-auto px-4 pt-16 pb-16">
        <div className="mb-8">
          <p className="text-lg font-medium text-fg-soft mb-2">Create NFC</p>
          <h1 className="text-4xl font-light tracking-tight leading-tight">
            Lets setup your new logm8 NFC.
          </h1>
        </div>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <TagFormFields values={form} onChange={setField} />

          <button
            type="submit"
            disabled={isSaving}
            className="w-full h-14 mt-2 rounded-full bg-accent text-accent-fg text-xl font-medium disabled:opacity-60"
          >
            {isSaving ? "Setting up…" : "Create NFC"}
          </button>
        </form>
      </div>
    </div>
  );
}
