import React, { useCallback, useState } from "react";
import { Svg } from "../../../shared/components/Svg";
import { Tile } from "../../../shared/components/Tile";
import { BottomSheet, sheetRowClass } from "../../../shared/components/BottomSheet";
import { groupedFuelOptions } from "../../../shared/types/serviceOptions";

export interface TagFormValues {
  Make: string;
  Model: string;
  Year: string;
  Vehicle: string;
  Engine: string;
  Fuel: string[];
  Transmission: string;
  Color: string;
  VinNumber: string | null;
  LicencePlate: string | null;
}

export interface TagFormFieldsProps {
  values: TagFormValues;
  onChange: <K extends keyof TagFormValues>(key: K, value: TagFormValues[K]) => void;
}

const VehicleTypes = ["Motorbike", "Car"];

const fieldLabel = "block text-sm text-white/50 leading-none mb-2";
const fieldInput =
  "w-full bg-transparent text-xl font-light text-white placeholder-white/30 outline-none";
const noSpinners =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

const Optional = () => <span className="text-white/30"> · optional</span>;

/** The tag detail tiles (plus the fuel sheet) shared by the create and edit forms. */
export function TagFormFields({ values, onChange }: TagFormFieldsProps) {
  const [isFuelOptionsOpen, setIsFuelOptionsOpen] = useState(false);
  const closeFuelOptions = useCallback(() => setIsFuelOptionsOpen(false), []);

  const { Fuel } = values;

  return (
    <>
      <Tile className="p-4">
        <label className={fieldLabel} htmlFor="Make">Make</label>
        <input
          id="Make"
          type="text"
          className={fieldInput}
          placeholder="Honda"
          value={values.Make}
          onChange={(e) => onChange("Make", e.target.value)}
        />
      </Tile>

      <Tile className="p-4">
        <label className={fieldLabel} htmlFor="Model">Model</label>
        <input
          id="Model"
          type="text"
          className={fieldInput}
          placeholder="CBR 650R"
          value={values.Model}
          onChange={(e) => onChange("Model", e.target.value)}
        />
      </Tile>

      <div className="grid grid-cols-2 gap-3">
        <Tile className="p-4">
          <label className={fieldLabel} htmlFor="Year">Year</label>
          <input
            id="Year"
            type="number"
            className={`${fieldInput} ${noSpinners}`}
            placeholder="2016"
            value={values.Year}
            onChange={(e) => onChange("Year", e.target.value)}
          />
        </Tile>

        <Tile className="p-4">
          <label className={fieldLabel} htmlFor="Engine">Engine CC</label>
          <input
            id="Engine"
            type="number"
            className={`${fieldInput} ${noSpinners}`}
            placeholder="250"
            value={values.Engine}
            onChange={(e) => onChange("Engine", e.target.value)}
          />
        </Tile>
      </div>

      <Tile className="p-4">
        <div className={fieldLabel}>Vehicle</div>
        <div className="inline-flex rounded-full bg-white/10 p-1">
          {VehicleTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange("Vehicle", type)}
              className={`px-5 py-2 rounded-full text-base transition-colors ${
                values.Vehicle === type ? "bg-[#4a5fc9] text-white" : "text-white/60"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </Tile>

      <Tile className="p-4" onClick={() => setIsFuelOptionsOpen(true)}>
        <div className={fieldLabel}>Fuel</div>
        <div className="flex items-center justify-between gap-2">
          {Fuel.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {Fuel.map((fuel) => (
                <span
                  key={fuel}
                  className="rounded-full bg-white/10 px-3 py-1 text-lg font-light leading-tight capitalize"
                >
                  {fuel}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xl font-light text-white/30">Select fuels...</span>
          )}
          <Svg type="angle-small-down1" size="md" color="white" />
        </div>
      </Tile>

      <Tile className="p-4">
        <label className={fieldLabel} htmlFor="Transmission">Transmission</label>
        <input
          id="Transmission"
          type="text"
          className={fieldInput}
          placeholder="5-speed manual"
          value={values.Transmission}
          onChange={(e) => onChange("Transmission", e.target.value)}
        />
      </Tile>

      <Tile className="p-4">
        <label className={fieldLabel} htmlFor="Color">Colour</label>
        <input
          id="Color"
          type="text"
          className={fieldInput}
          placeholder="Red"
          value={values.Color}
          onChange={(e) => onChange("Color", e.target.value)}
        />
      </Tile>

      <Tile className="p-4">
        <label className={fieldLabel} htmlFor="VinNumber">
          VIN <Optional />
        </label>
        <input
          id="VinNumber"
          type="text"
          className={fieldInput}
          placeholder="1HD1BJY102Y123456"
          value={values.VinNumber ?? ""}
          onChange={(e) => onChange("VinNumber", e.target.value)}
        />
      </Tile>

      <Tile className="p-4">
        <label className={fieldLabel} htmlFor="LicencePlate">
          Licence plate <Optional />
        </label>
        <input
          id="LicencePlate"
          type="text"
          className={fieldInput}
          placeholder="FAST1"
          value={values.LicencePlate ?? ""}
          onChange={(e) => onChange("LicencePlate", e.target.value)}
        />
      </Tile>

      <BottomSheet
        isOpen={isFuelOptionsOpen}
        onClose={closeFuelOptions}
        title="Fuel"
        footer={
          <button
            type="button"
            onClick={closeFuelOptions}
            className="w-full h-14 rounded-full bg-[#4a5fc9] text-white text-xl font-medium"
          >
            Done
          </button>
        }
      >
        {groupedFuelOptions.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <div className="px-2 pt-3 pb-1 text-sm text-white/50 capitalize">
              {group.label}
            </div>
            {group.options.map((opt) => {
              const active = Fuel.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    onChange(
                      "Fuel",
                      active ? Fuel.filter((v) => v !== opt.value) : [...Fuel, opt.value]
                    )
                  }
                  data-selected={active}
                  className={sheetRowClass(active)}
                >
                  <span className="capitalize">{opt.label}</span>
                  {active && <Svg type="check" size="md" color="white" />}
                </button>
              );
            })}
          </div>
        ))}
      </BottomSheet>
    </>
  );
}
