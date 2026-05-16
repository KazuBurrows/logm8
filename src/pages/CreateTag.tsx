import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiClient } from "../api/client";
import { Section } from "../components/common/Section";
import { Button } from "../components/common/Button";
import { groupedFuelOptions } from "../types/serviceOptions";

export default function CreateTag() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("token") ?? ""; // Extract the 'id' value
  
  const [isFuelOptionsOpen, setIsFuelOptionsOpen] = useState(false);

  const [TagId, setTagId] = useState<string>("");
  const [Make, setMake] = useState<string>("");
  const [Model, setModel] = useState<string>("");
  const [Year, setYear] = useState<string>("");
  const [Vehicle, setVehicle] = useState<string>("Motorbike");
  const [Style] = useState<string>("Null");
  const [Engine, setEngine] = useState<string>("");
  const [Fuel, setFuel] = useState<string[]>([]);
  const [Transmission, setTransmission] = useState<string>("");
  const [Color, setColor] = useState<string>("");
  const [VinNumber, setVinNumber] = useState<string | null>(null);
  const [LicencePlate, setLicencePlate] = useState<string | null>(null);

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

    const redirectUser = async () => {
      try {
        const eId = id;
        const reqString = JSON.stringify({ eId });
        const data = await apiClient.get<{ success: boolean; url?: string }>(
          `OneLifeUrlOneStepNoDecrypt?reqString=${reqString}`
        );
        if (data.success && data.url) {
          window.location.href = data.url;
        } else {
          console.error("API failed:", data);
        }
      } catch (err) {
        console.error("Redirect error:", err);
      }
    };

    const fetchData = async () => {
      try {
        const data = await apiClient.get<{ success: boolean; message?: string }>(
          `SubmitTag?tag=${jsonData}`
        );
        if (data.success) {
          redirectUser();
        } else {
          alert("Oops! Something went wrong. Please try again soon: " + data.message);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  };

  useEffect(() => {
    setTagId(id.replace(/ /g, "+"));
    // setTagId(encodeURIComponent(id));

    // console.log(TagId)
  }, [id]);

  const VehicleTypes = ["Motorbike", "Car"];
  //   const VehicleStyles: Record<string, string[]> = {
  //     Motorbike: [
  //         "Dirt",
  //         "Sport",
  //         "Cruiser",
  //         "Touring",
  //         "Adventure",
  //         "Standard",
  //         "Dual-Sport",
  //         "Scooter",
  //         "Cafe Racer",
  //         "Bobber",
  //         "Chopper",
  //         "Sport Touring",
  //         "Enduro",
  //         "Naked",
  //         "Mini Bike",
  //         "Trike",
  //         "Electric",
  //     ],
  //     Car: [
  //         "Sedan",
  //         "SUV",
  //         "Coupe",
  //         "Convertible",
  //         "Hatchback",
  //         "Wagon",
  //         "Truck",
  //         "Van",
  //         "Minivan",
  //         "Crossover",
  //         "Sports Car",
  //         "Luxury Car",
  //         "Hybrid",
  //         "Electric",
  //         "Off-Road",
  //         "Compact",
  //         "Microcar",
  //         "Pickup",
  //         "Roadster",
  //         "Supercar",
  //         "Muscle Car",
  //     ],
  // };

  return (
    <>
      {/* <Navbar onToggle={() => null} /> */}
      <Section id={""} className="h-full mb-64 lg:pt-0 sm:pt-8 pt-2">
        <div className="md:w-7/12 sm:w-9/12 w-11/12 mx-auto mt-24 mb-16">
          <h1 className="lg:text-8xl sm:text-6xl text-5xl text-center funnel-display-font font-bold leading-tight text-wrap">
            Lets setup your new logm8 NFC.
          </h1>
        </div>
        {/* Big screen */}
        <div className="2xl:w-7/12 xl:w-8/12 md:w-10/12 mx-auto md:block hidden">
          <form className="roboto-flex-font" onSubmit={handleSubmit}>
            <h2 className="text-5xl text-green-400 font-semibold uppercase leading-tight mb-4">
              Create NFC
            </h2>
            {/* <h3 className="text-lg opacity-70">{TagId}</h3> */}

            <div className="flex gap-8 mb-2">
              <div className="w-full">
                <label className="block">Make</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border rounded-lg"
                  placeholder="Honda"
                  value={Make}
                  onChange={(e) => setMake(e.target.value)}
                />
              </div>
              <div className="w-full">
                <label className="block">Model</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border rounded-lg"
                  placeholder="CBR 650R"
                  value={Model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-8 mb-2">
              <div className="w-full">
                <label className="block">Year</label>
                <input
                  type="number"
                  className="block w-full px-3 py-2 border rounded-lg"
                  placeholder="2016"
                  value={Year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
              <div className="w-full">
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
            </div>

            <div className="flex gap-8 mb-2">
              {/* <div className="w-full">
                <label className="block">Style</label>
                <select
                  className="block w-full px-3 py-2 border rounded-lg"
                  onChange={(e) => setStyle(e.target.value)}
                  >
                  {VehicleStyles[Vehicle].map((v :string) => (
                    <option value={v} key={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div> */}
              <div className="w-full">
                <label className="block">Engine CC</label>
                <input
                  type="number"
                  className="block w-full px-3 py-2 border rounded-lg"
                  placeholder="250"
                  value={Engine}
                  onChange={(e) => setEngine(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-8 mb-2">
              {/* <div className="w-full">
                <label className="block">Fuel</label>
                <select
                  className="block w-full px-3 py-2 border rounded-lg"
                  onChange={(e) => setFuel(e.target.value)}
                  >
                  {VehicleFuels.map((v) => (
                    <option value={v} key={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div> */}
              <div className="w-full">
                <label className="block">Transmission</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border rounded-lg"
                  placeholder="5-speed manual"
                  value={Transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-8 mb-2">
              <div className="w-1/2">
                <label className="block">Color</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border rounded-lg"
                  placeholder="Red"
                  value={Color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>
              <div className="w-1/2 opacity-0">
                <label className="block"></label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-8 mb-2">
              <div className="w-full">
                <label className="block">
                  Vin Number <span className="text-slate-300">- optional</span>
                </label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border rounded-lg"
                  placeholder="1HD1BJY102Y123456"
                  value={VinNumber ?? ""}
                  onChange={(e) => setVinNumber(e.target.value)}
                />
              </div>
              <div className="w-full">
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
            <div className="flex">
              <Button
                label={"Create NFC"}
                type={"submit"}
                size={"default"}
                className={"bg-green-400 text-white my-4 ml-auto"}
              ></Button>
            </div>
          </form>
        </div>

        {/* Mobile screen */}
        <div className="sm:w-7/12 w-10/12 mx-auto md:hidden block">
          <form className="roboto-flex-font" onSubmit={handleSubmit}>
            <h2 className="text-5xl text-green-400 font-semibold uppercase leading-tight">
              Create
            </h2>
            <h2 className="text-5xl text-green-400 font-semibold uppercase leading-tight mb-4">
              NFC
            </h2>
            {/* <h3 className="text-lg opacity-70">{id}</h3> */}

            <div className="w-full mb-2">
              <label className="block">Make</label>
              <input
                type="text"
                className="block w-full px-3 py-2 border rounded-lg"
                placeholder="Honda"
                value={Make}
                onChange={(e) => setMake(e.target.value)}
              />
            </div>
            <div className="w-full mb-2">
              <label className="block">Model</label>
              <input
                type="text"
                className="block w-full px-3 py-2 border rounded-lg"
                placeholder="CBR 650R"
                value={Model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>

            <div className="w-full mb-2">
              <label className="block">Year</label>
              <input
                type="number"
                className="block w-full px-3 py-2 border rounded-lg"
                placeholder="2016"
                value={Year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
            <div className="w-full mb-2">
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

            {/* <div className="w-full mb-2">
              <label className="block">Style</label>
              <select
                className="block w-full px-3 py-2 border rounded-lg"
                onChange={(e) => setStyle(e.target.value)}
                >
                {VehicleStyles[Vehicle].map((v :string) => (
                  <option value={v} key={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div> */}
            <div className="w-full mb-2">
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
                              <span className="capitalize">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="w-full mb-2">
              <label className="block">Transmission</label>
              <input
                type="text"
                className="block w-full px-3 py-2 border rounded-lg"
                placeholder="5-speed manual"
                value={Transmission}
                onChange={(e) => setTransmission(e.target.value)}
              />
            </div>

            <div className="w-full mb-2">
              <label className="block">Color</label>
              <input
                type="text"
                className="block w-full px-3 py-2 border rounded-lg"
                placeholder="Red"
                value={Color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>

            <div className="w-full mb-2">
              <label className="block">
                Vin Number <span className="text-slate-300">- optional</span>
              </label>
              <input
                type="text"
                className="block w-full px-3 py-2 border rounded-lg"
                placeholder="1HD1BJY102Y123456"
                value={VinNumber ?? ""}
                onChange={(e) => setVinNumber(e.target.value)}
              />
            </div>
            <div className="w-full mb-2">
              <label className="block">
                Licence Plate <span className="text-slate-300">- optional</span>
              </label>
              <input
                type="text"
                className="block w-full px-3 py-2 border rounded-lg"
                placeholder="FAST1"
                value={LicencePlate ?? ""}
                onChange={(e) => setLicencePlate(e.target.value)}
              />
            </div>
            <Button
              label={"Create NFC"}
              type={"submit"}
              size={"default"}
              className={"bg-green-400 text-white flex my-4 ml-auto"}
            ></Button>
          </form>
        </div>
      </Section>
    </>
  );
}
