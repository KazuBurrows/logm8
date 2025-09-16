import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// import Cookies from "js-cookie";

import LogHistory from "../componets/LogHistory";
import LogInfo from "../componets/LogInfo";
import { LoadingScreen } from "../componets/LoadingScreen";

// const TTL_DURATION = 45 * 60; // 45 minutes (in seconds)

const data: ServiceTag = {
  Make: "undefiend",
  Model: "undefiend",
  Year: 0,
  Vehicle: "undefiend",
  Style: "undefiend",
  Engine: 0,
  Fuel: "undefiend",
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

          console.log(data)
          const myRecords: ServiceRecord[] =[];
          try {
            data.records.forEach((record: any) => {
              
              // const myCompletedTasks: TaskCompleted[] = [];

              // record["completedTasks"].forEach((task: any) => {
              //   myCompletedTasks.push({
              //     Task: task["task"] ?? "",
              //     Comment: task["comment"] ?? "",
              //     Receipts: task["receipts"] ?? []
              //   });
              // });

              myRecords.push({
                id: "",
                TagID: "",
                EnteredDate: record["enteredDate"] ?? "",
                ServicedDate: record["servicedDate"],
                MechanicName: record["mechanicName"] ?? "",
                Odometer: record["odometer"] ?? "",
                // CompletedTasks: myCompletedTasks,
                // PendingCompletedTasks: [],
                ServiceType: record["serviceType"],
                Comment: record["comment"],
                FileUrls: record["fileUrls"]
              });
            });

            setServiceRecords(myRecords)
          } catch {
            setServiceRecords([]);
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
  }, [navigate, token]);


  const RenderThis = () => {
    if (isRetrievingData) {
      return <LoadingScreen text={"Retrieving Data..."} />;
    } else {
      return (
        <>
          <LogInfo tag={tag}></LogInfo>
          <LogHistory
            logServiceRecords={serviceRecords}
          ></LogHistory>
        </>
      );
    }
      
  };
  return <div>{RenderThis()}</div>;
}
