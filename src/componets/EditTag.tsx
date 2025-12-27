import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
// import { Section } from "./Section";
// import { Navbar } from "./Navbar";
import { Button } from "./Button";
import { groupedFuelOptions } from "../types/serviceOptions";
// const logmateLogo = require("../assets/logmate-logo.png");

interface ModalProps {
  tag: ServiceTag;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditTag({ tag, isOpen, onClose }: ModalProps) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("token") ?? ""; // Extract the 'id' value

  const [isFuelOptionsOpen, setIsFuelOptionsOpen] = useState(false);

  const [TagId] = useState<string>(id);
  const [Make, setMake] = useState<string>(tag.Make);
  const [Model, setModel] = useState<string>(tag.Model);
  const [Year, setYear] = useState<string>(tag.Year.toString());
  const [Vehicle, setVehicle] = useState<string>(tag.Vehicle);
  const [Style] = useState<string>("Null");
  const [Engine, setEngine] = useState<string>(tag.Engine.toString());
  const [Fuel, setFuel] = useState<string[]>([]);
  const [Transmission, setTransmission] = useState<string>(tag.Transmission);
  const [Color, setColor] = useState<string>(tag.Color);
  const [VinNumber, setVinNumber] = useState<string | null>(tag.VinNumber);
  const [LicencePlate, setLicencePlate] = useState<string | null>(
    tag.LicencePlate
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      TagId,
      Make,
      Model,
      Year,
      Vehicle,
      Style,
      Engine,
      Fuel,
      Transmission,
      Color,
      VinNumber,
      LicencePlate,
    };
    console.log("Form Data:", formData);
    // Add your submission logic here
    const jsonData = JSON.stringify(formData);

    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://logmate.azurewebsites.net/api/UpdateAssetNfcTagAsync?tag=" +
            encodeURIComponent(jsonData),
          // "http://localhost:7071/api/UpdateAssetNfcTagAsync?tag=" + encodeURIComponent(jsonData),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        console.log("API Response:", data);

        if (data.success) {
          // alert(data.message);
          onClose();
        } else {
          alert(
            "Oops! Something went wrong. Please try again soon: " + data.message
          );
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  };

  useEffect(() => {
    // JSON.parse(tag.Fuel)
    console.log(tag.Fuel);
    if (tag?.Fuel) {
      // Ensure it's a string[] even if it's JSON
      const defaultFuel = Array.isArray(tag.Fuel)
        ? tag.Fuel
        : JSON.parse(tag.Fuel);

      setFuel(defaultFuel);
    }
  }, [tag.Fuel]);

  const VehicleTypes = ["Motorbike", "Car"];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose} // click outside to close
          />

          {/* Modal content */}
          <div className="relative bg-white w-screen overflow-y-auto max-h-[100vh]">
            {/* Header with close button */}
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <h2 className="text-2xl font-semibold text-green-400">
                Update NFC
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-4">
              <form className="roboto-flex-font" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block">Make</label>
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border rounded-lg"
                      placeholder="Honda"
                      value={Make}
                      onChange={(e) => setMake(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block">Model</label>
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border rounded-lg"
                      placeholder="CBR 650R"
                      value={Model}
                      onChange={(e) => setModel(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block">Year</label>
                    <input
                      type="number"
                      className="block w-full px-3 py-2 border rounded-lg"
                      placeholder="2016"
                      value={Year}
                      onChange={(e) => setYear(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block">Vehicle</label>
                    <select
                      className="block w-full px-3 py-2 border rounded-lg"
                      onChange={(e) => setVehicle(e.target.value)}
                    >
                      {VehicleTypes.map((v) => (
                        <option value={v} key={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block">Engine CC</label>
                    <input
                      type="number"
                      className="block w-full px-3 py-2 border rounded-lg"
                      placeholder="250"
                      value={Engine}
                      onChange={(e) => setEngine(e.target.value)}
                    />
                  </div>

                  <div className="relative pb-2">
                    <label className="block">Fuel</label>
                    {/* Trigger button */}
                    <div
                      className="w-full p-2 border rounded capitalize bg-white"
                      onClick={() => setIsFuelOptionsOpen(true)}
                    >
                      {Fuel.length > 0 ? Fuel : "Select Fuels..."}
                    </div>

                    {/* Full screen dropdown */}
                    {isFuelOptionsOpen && (
                      <div className="fixed inset-0 z-50 bg-black/40 flex flex-col">
                        <div className="bg-white w-full h-full p-4 overflow-y-auto">
                          <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold">Select a Task</h2>
                            <button
                              onClick={() => setIsFuelOptionsOpen(false)}
                              className="text-blue-500 font-semibold"
                            >
                              Done
                            </button>
                          </div>

                          {/* Options */}
                          {groupedFuelOptions.map((group) => (
                            <fieldset key={group.label} className="mb-4">
                              <legend className="font-semibold text-4xl text-gray-700 mb-1 capitalize">
                                {group.label}
                              </legend>
                              <div className="space-y-2 pl-2">
                                {group.options.map((opt) => (
                                  <label
                                    key={opt.value}
                                    className="flex items-center space-x-2 text-2xl"
                                  >
                                    <input
                                      type="checkbox"
                                      value={opt.value}
                                      checked={Fuel.includes(opt.value)}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setFuel((prev) =>
                                          e.target.checked
                                            ? [...prev, value]
                                            : prev.filter((v) => v !== value)
                                        );
                                      }}
                                      className="
                                      appearance-none w-5 h-5 
                                      border-2 border-gray-400 
                                      checked:bg-red-500 checked:border-red-500 
                                      rounded 
                                      transition-colors
                                    "
                                    />
                                    <span className="capitalize">
                                      {opt.label}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </fieldset>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block">Transmission</label>
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border rounded-lg"
                      placeholder="5-speed manual"
                      value={Transmission}
                      onChange={(e) => setTransmission(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block">Color</label>
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border rounded-lg"
                      placeholder="Red"
                      value={Color}
                      onChange={(e) => setColor(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block">
                      Vin Number{" "}
                      <span className="text-slate-300">- optional</span>
                    </label>
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border rounded-lg"
                      placeholder="1HD1BJY102Y123456"
                      value={VinNumber ?? ""}
                      onChange={(e) => setVinNumber(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block">
                      Licence Plate{" "}
                      <span className="text-slate-300">- optional</span>
                    </label>
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border rounded-lg"
                      placeholder="FAST1"
                      value={LicencePlate ?? ""}
                      onChange={(e) => setLicencePlate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    label={"Update NFC"}
                    type={"submit"}
                    size={"default"}
                    className={"bg-green-400 text-white"}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
