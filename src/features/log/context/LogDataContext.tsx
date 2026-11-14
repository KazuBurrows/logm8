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
  LogCache,
  mergeRecords,
  OwnerKeyKind,
  ownerKeyKind,
  readLastViewedLog,
  readLogCache,
  writeLogCache,
} from "../api/logCache";
import { ApiError } from "../../../api/client";
import { dispatchToast } from "../../../shared/components/Toast/toastService";

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
    OwnerKey: record.OwnerKey ?? record.ownerKey ?? null,
    UserId: record.UserId ?? record.userId ?? null,
    canEdit: record.canEdit ?? record.CanEdit ?? false,
  };
}

function toServiceTag(tag: any): ServiceTag {
  return {
    Token: "",
    Id: tag.id ?? tag.Id,
    Make: tag.Make ?? tag.make,
    Model: tag.Model ?? tag.model,
    Year: tag.Year ?? tag.year,
    Vehicle: tag.Vehicle ?? tag.vehicle,
    Style: tag.Style ?? tag.style,
    Engine: tag.Engine ?? tag.engine,
    Fuel: tag.Fuel ?? tag.fuel,
    Transmission: tag.Transmission ?? tag.transmission,
    Color: tag.Color ?? tag.color,
    VinNumber: tag.VinNumber ?? tag.vinNumber ?? tag.vinumber,
    LicencePlate: tag.LicencePlate ?? tag.licencePlate ?? tag.licenceplate,
  };
}

// The records to show from a GetLogData response. A delta can't say a record was deleted, so
// any record missing from recordIds (every record the tag has now) is dropped; an older server
// sends no recordIds, and then nothing is. canEdit is set for the viewer the response names:
// its opaque viewerKey, or the raw userId an older server sent.
function shownFor(data: any, records: ServiceRecord[]): ServiceRecord[] {
  if (Array.isArray(data.recordIds)) {
    const live = new Set<string>(data.recordIds);
    records = records.filter((r) => live.has(r.id));
  }
  const kind = ownerKeyKind(data);
  const viewer = kind === "owner" ? data.viewerKey : data.userId;
  return viewer === undefined
    ? records
    : applyCanEdit(records, data.mode === UserMode.Service, viewer, kind);
}

// A cache written under the other owner-key kind (e.g. before the API switched to opaque keys)
// can't have canEdit worked out for this viewer, so it's refetched in full instead of merged.
const cacheUsableFor = (cache: LogCache | null | undefined, kind: OwnerKeyKind) =>
  !!cache?.lastUpdated && (cache.keyKind ?? "user") === kind;

interface LogDataContextValue {
  isRetrievingData: boolean;
  isCheckingForUpdates: boolean;
  tag: ServiceTag;
  serviceRecords: ServiceRecord[];
  serviceOptions: ServiceOption[];
  ownershipOptions: ServiceOption[];
  viewMode: string;
  /** When the link this page was opened with stops working (ISO), if the API says. */
  linkExpiresAt: string | null;
  addRecord: (record: ServiceRecord) => void;
  updateRecord: (record: ServiceRecord) => void;
  removeRecord: (id: string) => void;
  /** Fetches changes since the last sync and merges them in; resolves even if it fails. */
  refresh: () => Promise<void>;
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
  const [linkExpiresAt, setLinkExpiresAt] = useState<string | null>(null);
  // Only a server sync moves lastUpdated; local adds/edits are upserted without it, so a
  // change someone else made after our last sync is still returned by the next delta fetch.
  const syncedLastUpdatedRef = useRef("");
  // The owner-key kind of the last response, saved with the cache (see cacheUsableFor).
  const keyKindRef = useRef<OwnerKeyKind>("owner");

  useEffect(() => {
    // `data` is a GetLogData response, so the server has already named the tag being shown.
    const showLog = (data: any, records: ServiceRecord[], lastUpdated = latestLastModified(records)) => {
      syncedLastUpdatedRef.current = lastUpdated;
      keyKindRef.current = ownerKeyKind(data);
      setTag(toServiceTag(data.tag));
      setServiceRecords(shownFor(data, records));
      setViewMode(UserMode[data.mode ?? 1]);
      setLinkExpiresAt(data.expiresAt ?? null);
    };

    const fetchData = async () => {
      try {
        // A fresh token doesn't say which tag it's for, so send the last viewed tag's lastUpdated.
        const lastViewed = readLastViewedLog();
        const data = await getLogData(token, lastViewed?.lastUpdated || undefined);
        const tagId: string = data.tag.id ?? data.tag.Id;
        const incoming: ServiceRecord[] = (data.records ?? []).map(normalizeRecord);
        const kind = ownerKeyKind(data);

        if (!lastViewed?.lastUpdated || (lastViewed.id === tagId && cacheUsableFor(lastViewed, kind))) {
          showLog(data, lastViewed?.lastUpdated ? mergeRecords(lastViewed.logHistory, incoming) : incoming);
          return;
        }

        // Those records were filtered by another tag's timestamp (or come from a cache that
        // can't be used for this viewer), so they're incomplete.
        const cached = readLogCache(tagId);
        if (!cached || !cacheUsableFor(cached, kind)) {
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
    writeLogCache({
      lastUpdated: syncedLastUpdatedRef.current,
      id: tag.Id,
      logHistory: serviceRecords,
      keyKind: keyKindRef.current,
    });
  }, [isRetrievingData, isCheckingForUpdates, tag.Id, serviceRecords]);

  const addRecord = useCallback((newRecord: ServiceRecord) => {
    setServiceRecords((prev) => [newRecord, ...prev]);
  }, []);

  const updateRecord = useCallback((updatedRecord: ServiceRecord) => {
    setServiceRecords((prev) =>
      prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
    );
  }, []);

  // Other devices drop it on their next sync, as it's missing from recordIds.
  const removeRecord = useCallback((id: string) => {
    setServiceRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const refresh = useCallback(async () => {
    // The first load's own update check is already fetching the same changes.
    if (isRetrievingData || isCheckingForUpdates) return;
    try {
      const since = syncedLastUpdatedRef.current;
      const data = await getLogData(token, since || undefined);
      const incoming: ServiceRecord[] = (data.records ?? []).map(normalizeRecord);
      // From the server's records only, so a local add/edit can't move it past others' changes.
      syncedLastUpdatedRef.current = latestLastModified(incoming) || since;
      setTag(toServiceTag(data.tag));
      // Merged into what's showing. A record added here while this was in flight is dropped if
      // the server read its records before the add, but then lastUpdated (taken from those
      // records) is older than it, so the next sync brings it back.
      setServiceRecords((shown) => shownFor(data, mergeRecords(shown, incoming)));
      setViewMode(UserMode[data.mode ?? 1]);
      setLinkExpiresAt(data.expiresAt ?? null);
    } catch (err) {
      // Unlike the first load, a failed refresh keeps the log on screen.
      console.error(err);
      // The API client has already shown a toast for every other failure.
      if (!(err instanceof ApiError) || err.status === 404) {
        dispatchToast("Couldn't refresh the log. Please try again.", "error");
      }
    }
  }, [token, getLogData, isRetrievingData, isCheckingForUpdates]);

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
        linkExpiresAt,
        addRecord,
        updateRecord,
        removeRecord,
        refresh,
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
