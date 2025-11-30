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
        
        fetch(
          "https://logmate.azurewebsites.net/api/GetLogData?token=" + token + ""
          // "http://localhost:7071/api/GetLogData?token=" + token + ""
        )
        .then((response) => {
          if (!response.ok) {
            navigate(`/404`);
          }
          
          return response.json();
        })
        .then((data) => {
          const myTag: ServiceTag = {
            Token: data.tag.token,
            Id: data.tag.id,
            Make: data.tag.make,
            Model: data.tag.model,
            Year: data.tag.year,
            Vehicle: data.tag.vehicle,
            Style: data.tag.style,
            Engine: data.tag.engine,
            Fuel: data.tag.fuel,
            Transmission: data.tag.transmission,
            Color: data.tag.color,
            VinNumber: data.tag.vinNumber,
            LicencePlate: data.tag.licencePlate
          };

          setTag(myTag);

          console.log("data", data);
          const myRecords: ServiceRecord[] =[];
          try {
            data.records.forEach((record: any) => {
              myRecords.push({
                Token: record["token"],
                id: record["id"],
                TagID: "",
                EnteredDate: record["enteredDate"] ?? "",
                ServicedDate: record["servicedDate"],
                MechanicName: record["mechanicName"] ?? "",
                Odometer: record["odometer"] ?? "",
                ServiceCategory: record["serviceCategory"],
                ServiceType: record["serviceType"],
                Comment: record["comment"],
                FileUrls: record["fileUrls"],
                ServiceOption: record["serviceOption"],
              });
            });

            setServiceRecords(myRecords)
            
          } catch {
            setServiceRecords([]);
          }

          console.log("myRecords", myRecords)
          try {
            setViewMode(UserMode[data.mode]);
            console.log("viewMode:", UserMode[data.mode])
            
          } catch {
            setViewMode(UserMode[1]);
          }


          setIsRetrievingData(false);

          // return;
          // try {
          //   fetch(
          //     "https://logmate.azurewebsites.net/api/ConsumeOneLifeUrl?token=" +
          //       token +
          //       ""
          //     "http://localhost:7071/api/ConsumeOneLifeUrl?token=" + token + ""
          //   )
          // } catch {
          //   console.log("failed ConsumeOneLifeUrl API call")
          // }
        })
        .catch((error) => {
          console.log(error);
        });

      } catch (err: any) {
        console.log(err);
      }
    };

    fetchData();

    const fetchServiceOptions = async () => {
      try {
        
       await fetch(
          "https://logmate.azurewebsites.net/api/GetMotorbikeOptions"
          // "http://localhost:7071/api/GetMotorbikeOptions"
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
