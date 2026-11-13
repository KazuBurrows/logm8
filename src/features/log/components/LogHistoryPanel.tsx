import { useCallback, useEffect, useState } from "react";

import { Section } from "../../../shared/components/Section";
import { RecordModal } from "../../serviceRecord/components/RecordModal";
import { RecordDetail } from "../../serviceRecord/components/RecordDetail";
import { categoryPathNames } from "../../serviceRecord/utils/serviceSelection";
import { recordTitle } from "../../serviceRecord/utils/recordDisplay";
import { groupedOptions } from "../../../shared/types/serviceOptions";
import { useLogData } from "../context/LogDataContext";
import { TaskOption } from "../../../shared/types/global";
import { RecordHistoryList } from "./RecordHistoryList";

function populateRecordFilter(records: ServiceRecord[]) {
  function groupBy<T, K extends keyof any>(
    array: T[],
    getKey: (item: T) => K
  ): Record<K, T[]> {
    return array.reduce((acc, item) => {
      const key = getKey(item);
      (acc[key] ??= []).push(item);
      return acc;
    }, {} as Record<K, T[]>);
  }

  const groupedByCategory = groupBy(records, (r) => r.ServiceCategory);

  Object.entries(groupedByCategory).forEach(([category, serviceRecords]) => {
    const records = Array.from(
      new Map(
        serviceRecords.map((r): [string, TaskOption] => [
          recordTitle(r),
          { value: recordTitle(r), label: recordTitle(r) },
        ])
      ).values()
    );

    groupedOptions.push({
      label: category,
      options: records,
    });
  });
}

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

  useEffect(() => {
    populateRecordFilter(serviceRecords);
  }, [serviceRecords]);

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
