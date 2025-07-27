import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Section } from "./Section";
// import { Navbar } from "./Navbar";
import { Button } from "./Button";

export default function CreateTag() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("token") ?? ""; // Extract the 'id' value
  
  const [TagId, setTagId] = useState<string>("");
  const [Make, setMake] = useState<string>("");
  const [Model, setModel] = useState<string>("");
  const [Year, setYear] = useState<string>("");
  const [Vehicle, setVehicle] = useState<string>("Motorbike");
  const [Style, setStyle] = useState<string>("Dirt");
  const [EngineCC, setEngineCC] = useState<string>("");
  const [Fuel, setFuel] = useState<string>("Gasoline");
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
        EngineCC,
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
            "https://logmate.azurewebsites.net/api/SubmitTag?tag=" + jsonData + ""
            // "http://localhost:7071/api/SubmitTag?tag=" + jsonData + ""
          );
          
         
          console.log(await response);
        } catch (err: any) {
          console.log(err);
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
  const VehicleStyles: Record<string, string[]> = {
    Motorbike: [
        "Dirt",
        "Sport",
        "Cruiser",
        "Touring",
        "Adventure",
        "Standard",
        "Dual-Sport",
        "Scooter",
        "Cafe Racer",
        "Bobber",
        "Chopper",
        "Sport Touring",
        "Enduro",
        "Naked",
        "Mini Bike",
        "Trike",
        "Electric",
    ],
    Car: [
        "Sedan",
        "SUV",
        "Coupe",
        "Convertible",
        "Hatchback",
        "Wagon",
        "Truck",
        "Van",
        "Minivan",
        "Crossover",
        "Sports Car",
        "Luxury Car",
        "Hybrid",
        "Electric",
        "Off-Road",
        "Compact",
        "Microcar",
        "Pickup",
        "Roadster",
        "Supercar",
        "Muscle Car",
    ],
};
  const VehicleFuels = [
    "Gasoline",
    "Diesel",
    "Electric",
    "Hybrid (Gasoline/Electric)",
    "Hybrid (Diesel/Electric)",
    "Hydrogen",
    "Compressed Natural Gas (CNG)",
    "Liquefied Natural Gas (LNG)",
    "Ethanol",
    "Biodiesel",
    "Propane (LPG)",
    "Plug-in Hybrid",
    "Solar",
    "Flex-Fuel",
    "Synthetic Fuel",
  ];

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
            <h2 className="text-5xl text-green-400 font-semibold uppercase leading-tight mb-4">Create NFC</h2>
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
              <div className="w-full">
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
              </div>
              <div className="w-full">
                <label className="block">Engine CC</label>
                <input
                  type="number"
                  className="block w-full px-3 py-2 border rounded-lg"
                  placeholder="250"
                  value={EngineCC}
                  onChange={(e) => setEngineCC(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-8 mb-2">
              <div className="w-full">
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
              </div>
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
                <label className="block">Vin Number <span className="text-slate-300">- optional</span></label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border rounded-lg"
                  placeholder="1HD1BJY102Y123456"
                  value={VinNumber ?? ""}
                  onChange={(e) => setVinNumber(e.target.value)}
                />
              </div>
              <div className="w-full">
                <label className="block">Licence Plate <span className="text-slate-300">- optional</span></label>
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
          <h2 className="text-5xl text-green-400 font-semibold uppercase leading-tight">Create</h2>
          <h2 className="text-5xl text-green-400 font-semibold uppercase leading-tight mb-4">NFC</h2>
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

            <div className="w-full mb-2">
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
            </div>
            <div className="w-full mb-2">
              <label className="block">Engine CC</label>
              <input
                type="number"
                className="block w-full px-3 py-2 border rounded-lg"
                placeholder="250"
                value={EngineCC}
                onChange={(e) => setEngineCC(e.target.value)}
              />
            </div>

            <div className="w-full mb-2">
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
              <label className="block">Vin Number <span className="text-slate-300">- optional</span></label>
              <input
                type="text"
                className="block w-full px-3 py-2 border rounded-lg"
                placeholder="1HD1BJY102Y123456"
                value={VinNumber ?? ""}
                onChange={(e) => setVinNumber(e.target.value)}
              />
            </div>
            <div className="w-full mb-2">
              <label className="block">Licence Plate <span className="text-slate-300">- optional</span></label>
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
