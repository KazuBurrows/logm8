import { useEffect, useState } from "react";

import { Section } from "../../../shared/components/Section";
import { RecordModal } from "../../serviceRecord/components/RecordModal";
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
          r.ServiceOption,
          { value: r.ServiceOption, label: r.ServiceOption },
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
    serviceOptions: logServiceOptions,
    ownershipOptions: logOwnershipOptions,
    updateRecord,
  } = useLogData();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ServiceRecord | null>(null);

  const openRecord = (record: ServiceRecord) => {
    setEditingRecord(record);
    setIsEditOpen(true);
  };
  const closeRecord = () => setIsEditOpen(false);

  useEffect(() => {
    populateRecordFilter(serviceRecords);
  }, [serviceRecords]);

  return (
    <Section
      id={""}
      className="h-full w-full mx-0 xl:px-80 lg:px-48 md:px-24 sm:px-16 sm:py-16 py-2 pb-24 relative overflow-hidden z-2"
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
        openRecord={openRecord}
      />

      <RecordModal
        mode={editingRecord?.canEdit === false ? "view" : "edit"}
        recordToEdit={serviceRecords.find(r => r.id === editingRecord?.id)}
        isOpen={isEditOpen}
        onUpdate={updateRecord}
        onClose={closeRecord}
        logServiceOptions={logServiceOptions}
        logOwnershipOptions={logOwnershipOptions}
      />
    </Section>
  );
}
