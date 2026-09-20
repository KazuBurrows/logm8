import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useApi } from "../../../api/useApi";
import { Svg } from "../../../shared/components/Svg";
import { useSlideInPanel } from "../../../shared/hooks/useSlideInPanel";
import { useEscapeAndScrollLock } from "../../../shared/hooks/useEscapeAndScrollLock";
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
  const { mounted, slideClass, slideStyle } = useSlideInPanel(isOpen);
  useEscapeAndScrollLock(mounted, onClose);

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
      await post("UpdateAssetNfcTagAsync", payload);
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Network or server error");
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

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto overflow-x-hidden text-white funnel-display-font bg-gradient-to-b from-zinc-800 via-zinc-900 to-black ${slideClass}`}
      style={slideStyle}
    >
      <div className="max-w-md mx-auto px-4 pt-6 pb-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-11 h-11 shrink-0 rounded-full bg-white/10 flex items-center justify-center"
          >
            <span className="rotate-90 flex">
              <Svg type="angle-small-down1" size="lg" color="white" />
            </span>
          </button>
          <h2 className="text-3xl font-light tracking-tight">Update NFC</h2>
        </div>

        {/* Body */}
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <TagFormFields values={form} onChange={setField} />

          <button
            type="submit"
            className="w-full h-14 mt-2 rounded-full bg-[#4a5fc9] text-white text-xl font-medium"
          >
            Update NFC
          </button>
        </form>
      </div>
    </div>
  );
}
