import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Cookies from "js-cookie";

import LogHistory from "../componets/LogHistory";
import LogInfo from "../componets/LogInfo";
import { LoadingScreen } from "../componets/LoadingScreen";

const TTL_DURATION = 45 * 60; // 45 minutes (in seconds)

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

  const checkCookieExpiration = useCallback(() => {
    const expiration = Cookies.get("pageExpiration");
    const now = Math.floor(Date.now() / 1000); // Convert to seconds

    if (now > Number(expiration)) {
      console.log("now > Number(expiration)");
      // Expired: Remove cookie and redirect
      Cookies.remove("pageExpiration");
      navigate("/404");
    } else if (!expiration) {
      console.log("!expiration");

      // No expiration set: Create a new one
      const expirationTime = now + TTL_DURATION;
      Cookies.set("pageExpiration", String(expirationTime), {
        expires: 365 * 100,
      });
    }
  }, [navigate]);

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
          "https://logmate.azurewebsites.net/api/ActivateOneLifeUrl?token=" +
            token +
            ""
          // "http://localhost:7071/api/ActivateOneLifeUrl?token=" + token + ""
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


          
          const myRecords: ServiceRecord[] =[];
          try {
            data.records.forEach((record: any) => {
              const myCompletedTasks: TaskCompleted[] = [];

              record["completedTasks"].forEach((task: any) => {
                myCompletedTasks.push({
                  Task: task["task"] ?? "",
                  Comment: task["comment"] ?? "",
                  Receipts: task["receipts"] ?? []
                });
              });

              myRecords.push({
                id: "",
                TagID: "",
                EnteredDate: record["enteredDate"] ?? "",
                ServicedDate: record["servicedDate"],
                MechanicName: record["mechanicName"] ?? "",
                Odometer: record["odometer"] ?? "",
                CompletedTasks: myCompletedTasks,
                PendingCompletedTasks: []
              });
            });

            setServiceRecords(myRecords)
          } catch {
            setServiceRecords([]);
          }

          setIsRetrievingData(false);
        })
        .catch((error) => {
          console.log(error);
        });



        // const response = await fetch(
        //   // "https://logmate.azurewebsites.net/api/ActivateOneLifeUrl?token=" +
        //   //   token +
        //   //   ""
        //   "http://localhost:7071/api/ActivateOneLifeUrl?token=" + token + ""
        // );

        // if (!response.ok) {
        //   navigate(`/404`);
        // }
        // console.log(await response.json());
        // const jsonResponse: JSON = await response.json();

        // const tag: ServiceTag = jsonResponse["jsonTagInfo"];
        // setTag(tag);

        // const records: ServiceRecord[] = jsonResponse["jsonRecords"];
        // setServiceRecords(records);


        // // console.log(result);
        // setIsRetrievingData(false);
      } catch (err: any) {
        console.log(err);
      }
    };

    fetchData();
    checkCookieExpiration();
  }, [navigate, token, checkCookieExpiration]);


  const RenderThis = () => {
    if (isRetrievingData) {
      return <LoadingScreen text={"Retrieving Logm8 Data..."} />;
    } else {
      return (
        <>
          <LogInfo tag={tag}></LogInfo>
          <LogHistory
            logServiceRecords={serviceRecords}
            checkExpiration={() => checkCookieExpiration()}
          ></LogHistory>
        </>
      );
    }
      
  };
  return <div>{RenderThis()}</div>;
}
