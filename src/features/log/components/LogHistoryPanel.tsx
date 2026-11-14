import { useCallback, useState } from "react";
import { useLocation } from "react-router-dom";

import { ApiError } from "../../../api/client";
import { Section } from "../../../shared/components/Section";
import { dispatchToast } from "../../../shared/components/Toast/toastService";
import { useServiceRecord } from "../../serviceRecord/api/useServiceRecord";
import { RecordModal } from "../../serviceRecord/components/RecordModal";
import { RecordDetail } from "../../serviceRecord/components/RecordDetail";
import { categoryPathNames } from "../../serviceRecord/utils/serviceSelection";
import { useLogData } from "../context/LogDataContext";
import { RecordHistoryList } from "./RecordHistoryList";

export default function LogHistoryPanel() {
  const {
    serviceRecords,
    isCheckingForUpdates,
    serviceOptions: logServiceOptions,
    ownershipOptions: logOwnershipOptions,
    updateRecord,
    removeRecord,
  } = useLogData();
  const token = new URLSearchParams(useLocation().search).get("token") ?? "";
  const { deleteServiceRecord } = useServiceRecord();

  // Tapping a record opens the read-only detail; its Edit button opens the form on top.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  // Keeps a just-deleted record showing while its detail slides closed.
  const [deletedRecord, setDeletedRecord] = useState<ServiceRecord>();
  // Looked up by id so the detail shows the saved version after an edit.
  const selectedRecord = serviceRecords.find((r) => r.id === selectedId) ?? deletedRecord;

  const openRecord = (record: ServiceRecord) => {
    setSelectedId(record.id);
    setDeletedRecord(undefined);
    setIsDetailOpen(true);
  };

  const deleteSelected = async () => {
    if (!selectedRecord) return;
    try {
      await deleteServiceRecord(selectedRecord, token);
    } catch (err) {
      // A 404 means it's already gone (e.g. deleted on another device), so finish the job here.
      // Any other error has been shown by the API client, and the record stays.
      if (!(err instanceof ApiError && err.status === 404)) throw err;
    }
    setDeletedRecord(selectedRecord);
    setIsDetailOpen(false);
    removeRecord(selectedRecord.id);
    dispatchToast("Record deleted.", "success");
  };
  // Escape reaches every open panel; while the form is on top, only it should close.
  const closeDetail = useCallback(() => {
    if (!isEditOpen) setIsDetailOpen(false);
  }, [isEditOpen]);
  const openEdit = useCallback(() => setIsEditOpen(true), []);
  const closeEdit = useCallback(() => setIsEditOpen(false), []);

  return (
    <Section
      id={""}
      className="h-full w-full mx-0 xl:px-80 lg:px-48 md:px-24 sm:px-16 sm:py-16 py-2 pb-8 relative"
    >

      {/* <div className="flex justify-end">
         <Button
             type={"button"}
             size={"default"}
             className={"bg-rose-500 text-white my-8 font-bold"}
             label="Download PDF"
         />
      </div> */}
      <RecordHistoryList
        serviceRecords={serviceRecords}
        isCheckingForUpdates={isCheckingForUpdates}
        openRecord={openRecord}
      />

      <RecordDetail
        isOpen={isDetailOpen}
        onClose={closeDetail}
        record={selectedRecord}
        categoryPath={
          selectedRecord
            ? categoryPathNames(selectedRecord, logServiceOptions, logOwnershipOptions)
            : []
        }
        canEdit={selectedRecord?.canEdit !== false}
        onEdit={openEdit}
        onDelete={deleteSelected}
      />

      {/* After the detail so it stacks on top of it. */}
      <RecordModal
        mode="edit"
        recordToEdit={selectedRecord}
        isOpen={isEditOpen}
        onUpdate={updateRecord}
        onClose={closeEdit}
        logServiceOptions={logServiceOptions}
        logOwnershipOptions={logOwnershipOptions}
      />
    </Section>
  );
}
