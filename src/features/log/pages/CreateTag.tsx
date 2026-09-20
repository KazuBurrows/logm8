import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useLog } from "../api/useLog";
import { ApiError } from "../../../api/client";
import { dispatchToast } from "../../../shared/components/Toast/toastService";
import { TagFormFields, TagFormValues } from "../components/TagFormFields";

function isSafeRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function CreateTag() {
  const { submitTag, getRedirectUrl } = useLog();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("token") ?? ""; // Extract the 'id' value

  const [TagId, setTagId] = useState<string>("");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      TagId,
      Style: "Null",
      ...form,
    };
    const jsonData = JSON.stringify(formData);

    const redirectUser = async () => {
      try {
        const url = await getRedirectUrl(id);
        if (url && isSafeRedirectUrl(url)) {
          window.location.href = url;
        } else {
          console.error("API returned a missing or unsafe URL:", url);
        }
      } catch (err) {
        console.error("Redirect error:", err);
      }
    };

    const fetchData = async () => {
      try {
        await submitTag(jsonData, id);
        redirectUser();
      } catch (err) {
        // ApiError is surfaced via the toast in the api client, except 404s
        console.error("Fetch error:", err);
        if (err instanceof ApiError && err.status === 404) {
          dispatchToast("Something went wrong while saving the tag. Please try again.", "error");
        }
      }
    };

    fetchData();
  };

  useEffect(() => {
    setTagId(id.replace(/ /g, "+"));
  }, [id]);

  return (
    <div className="min-h-screen text-white funnel-display-font bg-gradient-to-b from-zinc-800 via-zinc-900 to-black">
      {/* <Navbar onToggle={() => null} /> */}
      <div className="max-w-md mx-auto px-4 pt-16 pb-16">
        <div className="mb-8">
          <p className="text-lg font-medium text-blue-400 mb-2">Create NFC</p>
          <h1 className="text-4xl font-light tracking-tight leading-tight">
            Lets setup your new logm8 NFC.
          </h1>
        </div>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <TagFormFields values={form} onChange={setField} />

          <button
            type="submit"
            className="w-full h-14 mt-2 rounded-full bg-[#4a5fc9] text-white text-xl font-medium"
          >
            Create NFC
          </button>
        </form>
      </div>
    </div>
  );
}
