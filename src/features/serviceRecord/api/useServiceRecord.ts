import { useCallback } from "react";
import { useApi } from "../../../api/useApi";

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
      return toServiceRecord(dto);
    },
    [post]
  );

  return { loading, error, submitRecord, updateServiceRecord };
}
