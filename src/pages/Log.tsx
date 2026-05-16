import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiClient } from "../api/client";

// import Cookies from "js-cookie";

import LogHistory from "../components/log/LogHistory";
import LogInfo from "../components/log/LogInfo";
import { LoadingScreen } from "../components/common/LoadingScreen";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiClient.get<any>(`GetLogData?token=${token}`);
        setTag({
          Token: "",
          Id: data.tag.id ?? data.tag.Id,
          Make: data.tag.Make ?? data.tag.make,
          Model: data.tag.Model ?? data.tag.model,
          Year: data.tag.Year ?? data.tag.year,
          Vehicle: data.tag.Vehicle ?? data.tag.vehicle,
          Style: data.tag.Style ?? data.tag.style,
          Engine: data.tag.Engine ?? data.tag.engine,
          Fuel: data.tag.Fuel ?? data.tag.fuel,
          Transmission: data.tag.Transmission ?? data.tag.transmission,
          Color: data.tag.Color ?? data.tag.color,
          VinNumber: data.tag.VinNumber ?? data.tag.vinNumber ?? data.tag.vinumber,
          LicencePlate: data.tag.LicencePlate ?? data.tag.licencePlate ?? data.tag.licenceplate,
        });
        setServiceRecords(
          (data.records ?? []).map((record: any) => ({
            Token: record.Token ?? record.token,
            id: record.id ?? record.Id,
            TagID: "",
            EnteredDate: record.EnteredDate ?? record.enteredDate ?? "",
            ServicedDate: record.ServicedDate ?? record.servicedDate,
            MechanicName: record.MechanicName ?? record.mechanicName ?? "",
            Odometer: record.Odometer ?? record.odometer ?? "",
            ServiceCategory: record.ServiceCategory ?? record.serviceCategory,
            ServiceType: record.ServiceType ?? record.serviceType,
            Comment: record.Comment ?? record.comment,
            FileUrls: record.FileUrls ?? record.fileUrls,
            ServiceOption: record.ServiceOption ?? record.serviceOption,
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

    const fetchServiceOptions = async () => {
      try {
        const json = await apiClient.get<any>("GetServiceRecordHierarchy");
        setServiceOptions(json.MotorbikeOptions);
        setOwnershipOptions(json.OwnershipOptions);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
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
