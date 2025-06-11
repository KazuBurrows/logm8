import React, { useState, useEffect } from "react";
import { Section } from "./Section";
import { Button } from "./Button";
import { useNavigate } from "react-router-dom";



export default function LogRecent() {
  const navigate = useNavigate();

  const handleRedirect = (id: number) => {
    navigate(`/log/details/${id}`);
  };

  // State to hold the service logs
  const [recentLogs, setRecentLogs] = useState<RecentLogs>([]);

  // Simulate fetching the JSON data
  useEffect(() => {
    const fetchData = async () => {
      const jsonData: RecentLogs = await fetch("/data/recent.json").then(
        (res) => res.json()
      );
      setRecentLogs(jsonData);
    };
    fetchData();
  }, []);

  return (
    <Section id={""} className="h-screen py-8 mt-12 bg-slate-100">
      <h1 className="text-5xl text-green-400 lexend-font font-medium w-9/12 mx-auto text-center pt-8 pb-4">
        Recent Logs
      </h1>

      {/* Table */}
      <div className="rounded-lg shadow lexend-font w-9/12 mx-auto">
        {/* Large Table */}
        <table className="w-full border-collapse bg-white text-left text-sm lg:table hidden">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-3">Serviced Date</th>
              <th className="p-3 pl-4">Make</th>
              <th className="p-3">Model</th>
              <th className="p-3">Year</th>
              <th className="p-3">Service Type</th>
              <th className="p-3">Service Comment</th>
              <th className="p-3">Serviced By</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="font-light">
            {recentLogs.map((recent) => (
              <tr key={recent.ID} className={`border-b`}>
                <td className="p-3">{recent.ServicedDate}</td>
                <td className="p-3 pl-4">{recent.Make}</td>
                <td className="p-3">{recent.Model}</td>
                <td className="p-3">{recent.Year}</td>
                <td className="p-3">{recent.ServiceType}</td>
                <td className="p-3">{recent.ServiceComment}</td>
                <td className="p-3">{recent.ServicedByName}</td>
                <td className="p-3">
                  <Button
                    label={"↪"}
                    className="text-sm font-light bg-green-500 text-white mx-2 lexend-font"
                    type="button"
                    size="small"
                    onClick={handleRedirect}
                    param={recent.ID}
                  ></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
