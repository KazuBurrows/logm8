import { useCallback, useState } from "react";

import { Section } from "../../../shared/components/Section";
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
  } = useLogData();

  // Tapping a record opens the read-only detail; its Edit button opens the form on top.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  // Looked up by id so the detail shows the saved version after an edit.
  const selectedRecord = serviceRecords.find((r) => r.id === selectedId);

  const openRecord = (record: ServiceRecord) => {
    setSelectedId(record.id);
    setIsDetailOpen(true);
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
