// import React, { useState } from "react";
import { Search } from "../componets/Search";

interface Station {
  name: string;
  identifier: string;
  address: string;
  phone: string;
  email: string;
  mapURL: string;
}

const stations: Station[] = [
  // {
  //   name: "Station 09",
  //   identifier: "A064-09",
  //   address: "Grazhdanskaya St 14A",
  //   phone: "+7 (0640) 358-36-63",
  //   email: "you@email.com",
  //   mapURL: "https://maps.app.goo.gl/28AaJvdymRjTCHsw6",
  // },
  // {
  //   name: "Station 12",
  //   identifier: "A064-12",
  //   address: "Rahova St 22/17",
  //   phone: "+7 (0640) 255-36-63",
  //   email: "you@email.com",
  //   mapURL: "https://maps.app.goo.gl/28AaJvdymRjTCHsw6",
  // },
  // {
  //   name: "Station 13",
  //   identifier: "A064-13",
  //   address: "Moskovskaya St 22, Building 3",
  //   phone: "+7 (0640) 158-48-98",
  //   email: "you@email.com",
  //   mapURL: "https://maps.app.goo.gl/28AaJvdymRjTCHsw6",
  // },
  // {
  //   name: "Station 25",
  //   identifier: "A064-25",
  //   address: "Beloglinskaya St 13",
  //   phone: "+7 (0640) 685-45-00",
  //   email: "you@email.com",
  //   mapURL: "https://maps.app.goo.gl/28AaJvdymRjTCHsw6",
  // },
  // {
  //   name: "Station 31",
  //   identifier: "A064-31",
  //   address: "Popova St 187",
  //   phone: "+7 (0640) 698-98-97",
  //   email: "you@email.com",
  //   mapURL: "https://maps.app.goo.gl/28AaJvdymRjTCHsw6",
  // },
  // {
  //   name: "Station 38",
  //   identifier: "A064-38",
  //   address: "Shchorsa St 7",
  //   phone: "+7 (0640) 267-89-33",
  //   email: "you@email.com",
  //   mapURL: "https://maps.app.goo.gl/28AaJvdymRjTCHsw6",
  // },
  // {
  //   name: "Station 42",
  //   identifier: "A064-42",
  //   address: "Moskovskaya St 15",
  //   phone: "+7 (0640) 158-48-98",
  //   email: "you@email.com",
  //   mapURL: "https://maps.app.goo.gl/28AaJvdymRjTCHsw6",
  // },
];

export default function Locations() {
  return (
    <div className="lg:py-4 py-0 px-4">
      <Search id={""} placeHolder={"Search Country or State"}></Search>

      {/* Table */}
      <div className="overflow-auto rounded-lg shadow lexend-font 2xl:w-9/12 xl:w-10/12 lg:w-10/12 md:w-11/12 w-full mx-auto">
        {/* Large Table */}
        <table className="w-full border-collapse bg-white text-left text-sm lg:table hidden">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-3 pl-4">NAME</th>
              <th className="p-3">ADDRESS</th>
              <th className="p-3">PHONE</th>
              <th className="p-3">EMAIL</th>
              <th className="p-3">GOOGLE MAP</th>
            </tr>
          </thead>
          {stations.length === 0 ? (
            <tr key={"coming-soon-mechants"} className={`border-b`}>
              <td className="p-3 pl-4">{"coming soon"}</td>
              <td className="p-3">{"coming soon"}</td>
              <td className="p-3">{"coming soon"}</td>
              <td className="p-3">{"coming soon"}</td>
              <td className="p-3">{"coming soon"}</td>
            </tr>

          ) : (
            <>
              <tbody className="font-light">
                {stations.map((station) => (
                  <tr key={station.identifier} className={`border-b`}>
                    <td className="p-3 pl-4">{station.name}</td>
                    <td className="p-3">{station.address}</td>
                    <td className="p-3">{station.phone}</td>
                    <td className="p-3">{station.email}</td>
                    <td className="p-3">
                      <a href={station.mapURL} target="_blank" rel="noreferrer">
                        <svg
                          id="Layer_1"
                          data-name="Layer 1"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 105.93 122.88"
                          className="h-8 fill-blue-500 hover:fill-red-600" // Tailwind class for width and height
                        >
                          <defs>
                            <style>{`.cls-1{fill-rule:evenodd;}`}</style>
                          </defs>
                          <title>map</title>
                          <path
                            className="cls-1"
                            d="M56.92,73.14a1.62,1.62,0,0,1-1.86.06A65.25,65.25,0,0,1,38.92,58.8,51.29,51.29,0,0,1,28.06,35.37C26.77,27.38,28,19.7,32,13.45a27,27,0,0,1,6-6.66A29.23,29.23,0,0,1,56.36,0,26,26,0,0,1,73.82,7.12a26,26,0,0,1,4.66,5.68c4.27,7,5.19,16,3.31,25.12A55.29,55.29,0,0,1,56.92,73.14Zm-19,.74V101.7l30.15,13V78.87a65.17,65.17,0,0,0,6.45-5.63v41.18l25-12.59v-56l-9.61,3.7a61.61,61.61,0,0,0,2.38-7.81l9.3-3.59A3.22,3.22,0,0,1,105.7,40a3.18,3.18,0,0,1,.22,1.16v62.7a3.23,3.23,0,0,1-2,3L72.72,122.53a3.23,3.23,0,0,1-2.92,0l-35-15.17L4.68,122.53a3.22,3.22,0,0,1-4.33-1.42A3.28,3.28,0,0,1,0,119.66V53.24a3.23,3.23,0,0,1,2.32-3.1L18.7,43.82a58.63,58.63,0,0,0,2.16,6.07L6.46,55.44v59l25-12.59V67.09a76.28,76.28,0,0,0,6.46,6.79ZM55.15,14.21A13.72,13.72,0,1,1,41.43,27.93,13.72,13.72,0,0,1,55.15,14.21Z"
                          />
                        </svg>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </>
          )}

        </table>

        {/* Small Table */}
        <table className="w-full border-collapse bg-white text-left text-sm lg:hidden table">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-3 sm:px-16 px-8 w-full">Merchants</th>
            </tr>
          </thead>
          <tbody className="font-light">
            {stations.map((station) => (
              <tr key={station.identifier} className={`border-b`}>
                <td className="p-4 sm:px-16 px-8 grid md:grid-rows-2 md:grid-cols-3 grid-rows-4 grid-cols-2 gap-x-4">
                  <h3 className="text-xl font-medium row-start-1 col-start-1">
                    {station.name}
                  </h3>
                  <h2 className="font-normal text-gray-500 row-start-2 col-start-1">{station.address}</h2>
                  <h4 className="md:row-start-1 md:col-start-2 row-start-3 col-start-1">{station.phone}</h4>
                  <h4 className="md:row-start-2 md:col-start-2 row-start-4 col-start-1">{station.email}</h4>
                  <div className="w-min md:row-start-1 md:col-start-3 row-start-2 col-start-2 ml-auto">
                    <a href={station.mapURL} target="_blank" rel="noreferrer">
                      <svg
                        id="Layer_1"
                        data-name="Layer 1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 105.93 122.88"
                        className="h-8 fill-blue-500 hover:fill-red-600" // Tailwind class for width and height
                      >
                        <defs>
                          <style>{`.cls-1{fill-rule:evenodd;}`}</style>
                        </defs>
                        <title>map</title>
                        <path
                          className="cls-1"
                          d="M56.92,73.14a1.62,1.62,0,0,1-1.86.06A65.25,65.25,0,0,1,38.92,58.8,51.29,51.29,0,0,1,28.06,35.37C26.77,27.38,28,19.7,32,13.45a27,27,0,0,1,6-6.66A29.23,29.23,0,0,1,56.36,0,26,26,0,0,1,73.82,7.12a26,26,0,0,1,4.66,5.68c4.27,7,5.19,16,3.31,25.12A55.29,55.29,0,0,1,56.92,73.14Zm-19,.74V101.7l30.15,13V78.87a65.17,65.17,0,0,0,6.45-5.63v41.18l25-12.59v-56l-9.61,3.7a61.61,61.61,0,0,0,2.38-7.81l9.3-3.59A3.22,3.22,0,0,1,105.7,40a3.18,3.18,0,0,1,.22,1.16v62.7a3.23,3.23,0,0,1-2,3L72.72,122.53a3.23,3.23,0,0,1-2.92,0l-35-15.17L4.68,122.53a3.22,3.22,0,0,1-4.33-1.42A3.28,3.28,0,0,1,0,119.66V53.24a3.23,3.23,0,0,1,2.32-3.1L18.7,43.82a58.63,58.63,0,0,0,2.16,6.07L6.46,55.44v59l25-12.59V67.09a76.28,76.28,0,0,0,6.46,6.79ZM55.15,14.21A13.72,13.72,0,1,1,41.43,27.93,13.72,13.72,0,0,1,55.15,14.21Z"
                        />
                      </svg>
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
