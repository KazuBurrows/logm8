import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLog } from "../api/useLog";

export enum UserMode {
  Service = 0,
  Guest = 1,
}

const emptyTag: ServiceTag = {
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

interface LogDataContextValue {
  isRetrievingData: boolean;
  tag: ServiceTag;
  serviceRecords: ServiceRecord[];
  serviceOptions: ServiceOption[];
  ownershipOptions: ServiceOption[];
  viewMode: string;
  addRecord: (record: ServiceRecord) => void;
  updateRecord: (record: ServiceRecord) => void;
}

const LogDataContext = createContext<LogDataContextValue | undefined>(undefined);

export interface LogDataProviderProps {
  token: string;
  onNotFound: () => void;
  children: ReactNode;
}

export function LogDataProvider({ token, onNotFound, children }: LogDataProviderProps) {
  const { getLogData, getServiceRecordHierarchy } = useLog();

  const [isRetrievingData, setIsRetrievingData] = useState(true);
  const [tag, setTag] = useState<ServiceTag>(emptyTag);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [ownershipOptions, setOwnershipOptions] = useState<ServiceOption[]>([]);
  const [viewMode, setViewMode] = useState<string>(UserMode[1]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLogData(token);
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
            TagId: record.TagId ?? record.tagId ?? "",
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
        onNotFound();
      } finally {
        setIsRetrievingData(false);
      }
    };

    const fetchServiceOptions = async () => {
      try {
        const json = await getServiceRecordHierarchy();
        setServiceOptions(json.MotorbikeOptions);
        setOwnershipOptions(json.OwnershipOptions);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    fetchServiceOptions();
  }, [token, getLogData, getServiceRecordHierarchy, onNotFound]);

  const addRecord = useCallback((newRecord: ServiceRecord) => {
    setServiceRecords((prev) => [newRecord, ...prev]);
  }, []);

  const updateRecord = useCallback((updatedRecord: ServiceRecord) => {
    setServiceRecords((prev) =>
      prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
    );
  }, []);

  return (
    <LogDataContext.Provider
      value={{
        isRetrievingData,
        tag,
        serviceRecords,
        serviceOptions,
        ownershipOptions,
        viewMode,
        addRecord,
        updateRecord,
      }}
    >
      {children}
    </LogDataContext.Provider>
  );
}

export function useLogData(): LogDataContextValue {
  const ctx = useContext(LogDataContext);
  if (!ctx) throw new Error("useLogData must be used within a LogDataProvider");
  return ctx;
}
