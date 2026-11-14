import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useApi } from "../../../api/useApi";
import { oneLifeTokenHeaders } from "../../../api/oneLifeToken";
import { Panel } from "../../../shared/components/Panel";
import { UpdateAssetNfcTagRequest } from "../../../shared/types/global";
import { TagFormFields, TagFormValues } from "./TagFormFields";
// const logmateLogo = require("../assets/logmate-logo.png");

interface ModalProps {
  tag: ServiceTag;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditTag({ tag, isOpen, onClose }: ModalProps) {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token") ?? "";
  const { post } = useApi();

  const [form, setForm] = useState<TagFormValues>({
    Make: tag.Make ?? "",
    Model: tag.Model ?? "",
    Year: tag.Year?.toString() ?? "",
    Vehicle: tag.Vehicle ?? "",
    Engine: tag.Engine?.toString() ?? "",
    Fuel: [],
    Transmission: tag.Transmission,
    Color: tag.Color,
    VinNumber: tag.VinNumber,
    LicencePlate: tag.LicencePlate,
  });
  const setField = useCallback(
    <K extends keyof TagFormValues>(key: K, value: TagFormValues[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: UpdateAssetNfcTagRequest = {
      // Ignored by the current API (the tag comes from the header's token); kept for older ones.
      TagId: token,
      Make: form.Make,
      Model: form.Model,
      Year: Number(form.Year) || 0,
      Vehicle: form.Vehicle,
      Style: "Null",
      Engine: Number(form.Engine) || 0,
      Fuel: form.Fuel,
      Transmission: form.Transmission,
      Color: form.Color,
      VinNumber: form.VinNumber,
      LicencePlate: form.LicencePlate,
    };

    try {
      await post("UpdateAssetNfcTagAsync", payload, oneLifeTokenHeaders(token));
      onClose();
    } catch {
      // The API client has already shown the error as a toast; keep the form open to retry.
    }
  };

  useEffect(() => {
    if (tag?.Fuel) {
      if (Array.isArray(tag.Fuel)) {
        setField("Fuel", tag.Fuel);
        return;
      }
      try {
        setField("Fuel", JSON.parse(tag.Fuel));
      } catch {
        setField("Fuel", []);
      }
    }
  }, [tag.Fuel, setField]);

  return (
    <Panel isOpen={isOpen} onClose={onClose} title="Update NFC">
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <TagFormFields values={form} onChange={setField} />

        <button
          type="submit"
          className="w-full h-14 mt-2 rounded-full bg-accent text-accent-fg text-xl font-medium"
        >
          Update NFC
        </button>
      </form>
    </Panel>
  );
}
