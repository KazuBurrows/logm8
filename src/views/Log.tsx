import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// import Cookies from "js-cookie";

import LogHistory from "../componets/LogHistory";
import LogInfo from "../componets/LogInfo";
import { LoadingScreen } from "../componets/LoadingScreen";

// const TTL_DURATION = 45 * 60; // 45 minutes (in seconds)

export enum UserMode {
  Service = 0,
  Guest = 1,
}

const data: ServiceTag = {
  Token: "",
  Id: "",
  Make: "undefiend",
  Model: "undefiend",
  Year: 0,
  Vehicle: "undefiend",
  Style: "undefiend",
  Engine: 0,
  Fuel: ["undefiend"],
  Transmission: "undefiend",
  Color: "undefiend",
  VinNumber: "undefiend",
  LicencePlate: "undefiend",
};



export default function Log() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token"); // Extract the 'token' value
  const navigate = useNavigate();

  const [isRetrievingData, setIsRetrievingData] = useState(true);

  // State to hold the service logs
  const [tag, setTag] = useState<ServiceTag>(data);
  // State to hold the service logs
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [ownershipOptions, setOwnershipOptions] = useState<ServiceOption[]>([]);


  const [viewMode, setViewMode] = useState<string>(UserMode[1]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchData = async () => {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}GetLogData?token=${token}`
    );

    if (!res.ok) {
      navigate("/404");
      return;
    }

    const data = await res.json();
    console.log("my data:", data)
    setTag({
      // Token: data.tag.token,
      Token: "",
      Id: data.tag.id,
      Make: data.tag.Make,
      Model: data.tag.Model,
      Year: data.tag.Year,
      Vehicle: data.tag.Vehicle,
      Style: data.tag.Style,
      Engine: data.tag.Engine,
      Fuel: data.tag.Fuel,
      Transmission: data.tag.Transmission,
      Color: data.tag.Color,
      VinNumber: data.tag.VinNumber,
      LicencePlate: data.tag.LicencePlate
    });

    setServiceRecords(
      (data.records ?? []).map((record: any) => ({
        Token: record.Token,
        id: record.id,
        TagID: "",
        EnteredDate: record.EnteredDate ?? "",
        ServicedDate: record.ServicedDate,
        MechanicName: record.MechanicName ?? "",
        Odometer: record.Odometer ?? "",
        ServiceCategory: record.ServiceCategory,
        ServiceType: record.ServiceType,
        Comment: record.Comment,
        FileUrls: record.FileUrls,
        ServiceOption: record.ServiceOption,
      }))
    );

    setViewMode(UserMode[data.mode ?? 1]);
  } catch (err) {
    console.error(err);
    navigate("/404");
  } finally {
    setIsRetrievingData(false);
  }
};


    fetchData();

    const fetchServiceOptions = async () => {
      try {
        
       await fetch(
        `${process.env.REACT_APP_API_BASE_URL}GetServiceRecordHierarchy`
          // "https://logmate.azurewebsites.net/api/GetServiceRecordHierarchy",
          // "http://localhost:7071/api/GetServiceRecordHierarchy",
        )
        .then(async (response) => {
          if (!response.ok) throw new Error("Failed to fetch");
          const json = await response.json();
          console.log(json.OwnershipOptions)
          setServiceOptions(json.MotorbikeOptions);
          setOwnershipOptions(json.OwnershipOptions);
          console.log(json.MotorbikeOptions)
        })
        .catch((error) => {
          console.log(error);
        });

      } catch (err: any) {
        console.log(err);
      }
    };

    fetchServiceOptions();
  }, [navigate, token]);


  const RenderThis = () => {
    if (isRetrievingData) {
      return <LoadingScreen text={"Retrieving Data..."} />;
    } else {
      return (
        <>
        <div className="relative overflow-hidden bg-slate-950">

          
          <LogInfo tag={tag}></LogInfo>
          <LogHistory
            logServiceRecords={serviceRecords}
            logServiceOptions={serviceOptions}
            logOwnershipOptions={ownershipOptions}
            viewMode={viewMode}
          ></LogHistory>
          </div>
        </>
      );
    }
      
  };
  return <div>{RenderThis()}</div>;
}
