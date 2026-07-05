import { useCallback } from "react";
import { useApi } from "../../../api/useApi";

interface ServiceRecordDto {
  token: string;
  id: string;
  tagId: string;
  enteredDate: string | null;
  servicedDate: string;
  mechanicName: string;
  odometer: string;
  certified: boolean | null;
  serviceCategory: string;
  serviceType: string;
  serviceOption: string;
  comment: string;
  fileUrls: string[];
}

interface ServiceRecordResponse {
  success: boolean;
  message?: string;
  data: ServiceRecordDto;
}

function toServiceRecord(dto: ServiceRecordDto): ServiceRecord {
  return {
    Token: dto.token,
    id: dto.id,
    TagId: dto.tagId,
    EnteredDate: dto.enteredDate,
    ServicedDate: dto.servicedDate,
    MechanicName: dto.mechanicName,
    Odometer: dto.odometer,
    ServiceCategory: dto.serviceCategory,
    ServiceType: dto.serviceType,
    ServiceOption: dto.serviceOption,
    Comment: dto.comment,
    FileUrls: dto.fileUrls ?? [],
    Certified: dto.certified ?? undefined,
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
      const response = await post<ServiceRecordResponse>("SubmitRecord", formData, headers);
      if (!response?.data?.id) {
        throw new Error("Server returned an unexpected response while creating the record.");
      }
      return toServiceRecord(response.data);
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
      const response = await post<ServiceRecordResponse>("UpdateServiceRecord", formData, headers);
      if (!response?.data?.id) {
        throw new Error("Server returned an unexpected response while updating the record.");
      }
      return toServiceRecord(response.data);
    },
    [post]
  );

  return { loading, error, submitRecord, updateServiceRecord };
}
