import { useCallback } from "react";
import { useApi } from "../../../api/useApi";
import { getCached, setCached, CACHE_TTL_MS } from "../../../shared/utils/sessionCache";

interface ServiceRecordDto {
  Token?: string;
  token?: string;
  id?: string;
  Id?: string;
  TagId?: string;
  tagId?: string;
  EnteredDate?: string | null;
  enteredDate?: string | null;
  ServicedDate?: string;
  servicedDate?: string;
  MechanicName?: string;
  mechanicName?: string;
  Odometer?: string;
  odometer?: string;
  Certified?: boolean | null;
  certified?: boolean | null;
  ServiceCategory?: string;
  serviceCategory?: string;
  ServiceType?: string;
  serviceType?: string;
  ServiceOption?: string;
  serviceOption?: string;
  Comment?: string;
  comment?: string;
  FileUrls?: string[];
  fileUrls?: string[];
  canEdit?: boolean;
  CanEdit?: boolean;
}

function upsertCachedRecord(token: string, dto: ServiceRecordDto): void {
  const dtoId = dto.id ?? dto.Id;

  const cachedLogData = getCached<any>(`logData:${token}`);
  if (cachedLogData) {
    const records: ServiceRecordDto[] = cachedLogData.records ?? [];
    const index = records.findIndex((r) => (r.id ?? r.Id) === dtoId);
    const records2 = index >= 0
      ? records.map((r, i) => (i === index ? dto : r))
      : [dto, ...records];
    setCached(`logData:${token}`, { ...cachedLogData, records: records2 }, CACHE_TTL_MS);
  }

  const cachedHistory = getCached<ServiceRecordDto[]>(`logHistory:${token}`);
  if (cachedHistory) {
    const index = cachedHistory.findIndex((r) => (r.id ?? r.Id) === dtoId);
    const history2 = index >= 0
      ? cachedHistory.map((r, i) => (i === index ? dto : r))
      : [dto, ...cachedHistory];
    setCached(`logHistory:${token}`, history2, CACHE_TTL_MS);
  }
}

function toServiceRecord(dto: ServiceRecordDto): ServiceRecord {
  return {
    Token: (dto.Token ?? dto.token) as string,
    id: (dto.id ?? dto.Id) as string,
    TagId: (dto.TagId ?? dto.tagId) as string,
    EnteredDate: dto.EnteredDate ?? dto.enteredDate ?? null,
    ServicedDate: (dto.ServicedDate ?? dto.servicedDate) as string,
    MechanicName: (dto.MechanicName ?? dto.mechanicName) as string,
    Odometer: (dto.Odometer ?? dto.odometer) as string,
    ServiceCategory: (dto.ServiceCategory ?? dto.serviceCategory) as string,
    ServiceType: (dto.ServiceType ?? dto.serviceType) as string,
    ServiceOption: (dto.ServiceOption ?? dto.serviceOption) as string,
    Comment: (dto.Comment ?? dto.comment) as string,
    FileUrls: dto.FileUrls ?? dto.fileUrls ?? [],
    Certified: dto.Certified ?? dto.certified ?? undefined,
    canEdit: dto.canEdit ?? dto.CanEdit ?? true,
  };
}

export function useServiceRecord() {
  const { loading, error, post } = useApi();

  const submitRecord = useCallback(
    async (formData: FormData): Promise<ServiceRecord> => {
      const token = formData.get("Token") as string | null;
      const tagId = formData.get("TagId") as string | null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = token;
      if (tagId) headers["X-Tag-Id"] = tagId;
      const dto = await post<ServiceRecordDto>("SubmitRecord", formData, headers);
      if (!(dto?.id ?? dto?.Id)) {
        throw new Error("Server returned an unexpected response while creating the record.");
      }
      if (token) upsertCachedRecord(token, dto);
      return toServiceRecord(dto);
    },
    [post]
  );

  const updateServiceRecord = useCallback(
    async (formData: FormData): Promise<ServiceRecord> => {
      const token = formData.get("Token") as string | null;
      const tagId = formData.get("TagId") as string | null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = token;
      if (tagId) headers["X-Tag-Id"] = tagId;
      const dto = await post<ServiceRecordDto>("UpdateServiceRecord", formData, headers);
      if (!(dto?.id ?? dto?.Id)) {
        throw new Error("Server returned an unexpected response while updating the record.");
      }
      if (token) upsertCachedRecord(token, dto);
      return toServiceRecord(dto);
    },
    [post]
  );

  return { loading, error, submitRecord, updateServiceRecord };
}
