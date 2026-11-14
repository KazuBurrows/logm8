import { useCallback } from "react";
import { useApi } from "../../../api/useApi";
import { oneLifeTokenHeaders } from "../../../api/oneLifeToken";

interface ServiceRecordDto {
  Token?: string;
  token?: string;
  id?: string;
  Id?: string;
  TagId?: string;
  tagId?: string;
  EnteredDate?: string | null;
  enteredDate?: string | null;
  LastModified?: string | null;
  lastModified?: string | null;
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
  UserId?: string | null;
  userId?: string | null;
  canEdit?: boolean;
  CanEdit?: boolean;
}

function toServiceRecord(dto: ServiceRecordDto): ServiceRecord {
  return {
    Token: (dto.Token ?? dto.token) as string,
    id: (dto.id ?? dto.Id) as string,
    TagId: (dto.TagId ?? dto.tagId) as string,
    EnteredDate: dto.EnteredDate ?? dto.enteredDate ?? null,
    LastModified: dto.LastModified ?? dto.lastModified ?? null,
    ServicedDate: (dto.ServicedDate ?? dto.servicedDate) as string,
    MechanicName: (dto.MechanicName ?? dto.mechanicName) as string,
    Odometer: (dto.Odometer ?? dto.odometer) as string,
    ServiceCategory: (dto.ServiceCategory ?? dto.serviceCategory) as string,
    ServiceType: (dto.ServiceType ?? dto.serviceType) as string,
    ServiceOption: (dto.ServiceOption ?? dto.serviceOption) as string,
    Comment: (dto.Comment ?? dto.comment) as string,
    FileUrls: dto.FileUrls ?? dto.fileUrls ?? [],
    Certified: dto.Certified ?? dto.certified ?? undefined,
    UserId: dto.UserId ?? dto.userId ?? null,
    canEdit: dto.canEdit ?? dto.CanEdit ?? true,
  };
}

// SubmitRecord and UpdateServiceRecord build their reply without knowing the caller, so it
// always says canEdit: false. Whoever just saved the record can edit it, so keep Edit and
// Delete showing.
function savedByViewer(dto: ServiceRecordDto): ServiceRecord {
  return { ...toServiceRecord(dto), canEdit: true };
}

export function useServiceRecord() {
  const { loading, error, post } = useApi();

  const submitRecord = useCallback(
    async (formData: FormData): Promise<ServiceRecord> => {
      // The form's Token field stays for API versions that read it from the body.
      const token = formData.get("Token") as string | null;
      const dto = await post<ServiceRecordDto>("SubmitRecord", formData, oneLifeTokenHeaders(token));
      if (!(dto?.id ?? dto?.Id)) {
        throw new Error("Server returned an unexpected response while creating the record.");
      }
      return savedByViewer(dto);
    },
    [post]
  );

  const updateServiceRecord = useCallback(
    async (formData: FormData): Promise<ServiceRecord> => {
      const token = formData.get("Token") as string | null;
      const dto = await post<ServiceRecordDto>("UpdateServiceRecord", formData, oneLifeTokenHeaders(token));
      if (!(dto?.id ?? dto?.Id)) {
        throw new Error("Server returned an unexpected response while updating the record.");
      }
      return savedByViewer(dto);
    },
    [post]
  );

  // Only the record's owner, in service mode, can delete it; the server checks.
  const deleteServiceRecord = useCallback(
    async (record: ServiceRecord, token: string): Promise<void> => {
      const formData = new FormData();
      formData.append("Id", record.id);
      formData.append("Token", token);
      await post("DeleteServiceRecord", formData, oneLifeTokenHeaders(token));
    },
    [post]
  );

  return { loading, error, submitRecord, updateServiceRecord, deleteServiceRecord };
}
