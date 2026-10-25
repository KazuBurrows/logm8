import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLog } from "../api/useLog";
import {
  applyCanEdit,
  latestLastModified,
  mergeRecords,
  readLastViewedLog,
  readLogCache,
  writeLogCache,
} from "../api/logCache";

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

function normalizeRecord(record: any): ServiceRecord {
  return {
    Token: record.Token ?? record.token,
    id: record.id ?? record.Id,
    TagId: record.TagId ?? record.tagId ?? "",
    EnteredDate: record.EnteredDate ?? record.enteredDate ?? "",
    LastModified: record.LastModified ?? record.lastModified ?? null,
    ServicedDate: record.ServicedDate ?? record.servicedDate,
    MechanicName: record.MechanicName ?? record.mechanicName ?? "",
    Odometer: record.Odometer ?? record.odometer ?? "",
    ServiceCategory: record.ServiceCategory ?? record.serviceCategory,
    ServiceType: record.ServiceType ?? record.serviceType,
    Comment: record.Comment ?? record.comment,
    FileUrls: record.FileUrls ?? record.fileUrls,
    ServiceOption: record.ServiceOption ?? record.serviceOption,
    UserId: record.UserId ?? record.userId ?? null,
    canEdit: record.canEdit ?? record.CanEdit ?? false,
  };
}

interface LogDataContextValue {
  isRetrievingData: boolean;
  isCheckingForUpdates: boolean;
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
  const [isCheckingForUpdates, setIsCheckingForUpdates] = useState(false);
  const [tag, setTag] = useState<ServiceTag>(emptyTag);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [ownershipOptions, setOwnershipOptions] = useState<ServiceOption[]>([]);
  const [viewMode, setViewMode] = useState<string>(UserMode[1]);
  // Only a server sync moves lastUpdated; local adds/edits are upserted without it, so a
  // change someone else made after our last sync is still returned by the next delta fetch.
  const syncedLastUpdatedRef = useRef("");

  useEffect(() => {
    // `data` is a GetLogData response, so the server has already named the tag being shown.
    const showLog = (data: any, records: ServiceRecord[], lastUpdated = latestLastModified(records)) => {
      if (data.userId !== undefined) {
        records = applyCanEdit(records, data.mode === UserMode.Service, data.userId);
      }
      syncedLastUpdatedRef.current = lastUpdated;

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
      setServiceRecords(records);
      setViewMode(UserMode[data.mode ?? 1]);
    };

    const fetchData = async () => {
      try {
        // A fresh token doesn't say which tag it's for, so send the last viewed tag's lastUpdated.
        const lastViewed = readLastViewedLog();
        const data = await getLogData(token, lastViewed?.lastUpdated || undefined);
        const tagId: string = data.tag.id ?? data.tag.Id;
        const incoming: ServiceRecord[] = (data.records ?? []).map(normalizeRecord);

        if (!lastViewed?.lastUpdated || lastViewed.id === tagId) {
          showLog(data, lastViewed?.lastUpdated ? mergeRecords(lastViewed.logHistory, incoming) : incoming);
          return;
        }

        // Those records were filtered by another tag's timestamp, so they're incomplete.
        const cached = readLogCache(tagId);
        if (!cached?.lastUpdated) {
          const full = await getLogData(token);
          showLog(full, (full.records ?? []).map(normalizeRecord));
          return;
        }

        // The server has named the tag, so its cached records can show while its own changes load.
        // Until they land, lastUpdated stays at this tag's last full sync.
        const confirmed = mergeRecords(cached.logHistory, incoming);
        showLog(data, confirmed, cached.lastUpdated);
        setIsRetrievingData(false);
        setIsCheckingForUpdates(true);
        try {
          const delta = await getLogData(token, cached.lastUpdated);
          showLog(delta, mergeRecords(confirmed, (delta.records ?? []).map(normalizeRecord)));
        } catch (err) {
          // Keep showing the cached records; the next visit fetches from cached.lastUpdated again.
          console.error(err);
        } finally {
          setIsCheckingForUpdates(false);
        }
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

  // Mirror the records into the device cache after each sync and after local adds/edits.
  useEffect(() => {
    if (isRetrievingData || isCheckingForUpdates || !tag.Id) return;
    writeLogCache({ lastUpdated: syncedLastUpdatedRef.current, id: tag.Id, logHistory: serviceRecords });
  }, [isRetrievingData, isCheckingForUpdates, tag.Id, serviceRecords]);

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
        isCheckingForUpdates,
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
