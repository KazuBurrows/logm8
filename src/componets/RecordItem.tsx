// import { useHoldToEdit } from "../services/HoldToEdit";
import { Button } from "./Button";
import { Svg } from "./Svg";

export interface RecordItemProps {
  record: ServiceRecord;
  toggleInfo: (id: string) => void;
  expandedItemId: string | null;
  editingRecord: ServiceRecord | null;
  setEditingRecord: (record: ServiceRecord) => void;
  openEditModal: () => void;
}

export const RecordItem = ({
  record,
  toggleInfo,
  expandedItemId,
  editingRecord,
  setEditingRecord,
  openEditModal,
}: RecordItemProps) => {
  // Neon/futuristic color scheme for each service type
  const serviceTypeClasses: Record<string, string> = {
    Maintenance: "text-white bg-blue-900/50",
    Replacement: "text-white bg-red-900/50",
    Inspection: "text-white bg-green-900/50",
    Adjustment: "text-white bg-yellow-900/50",
    Tune: "text-white bg-purple-900/50",
  };

  const glowClasses: Record<string, string> = {
    Maintenance: "drop-shadow-[0_0_2px_rgba(59,130,246,0.7)]",
    Replacement: "drop-shadow-[0_0_2px_rgba(248,113,113,0.7)]",
    Inspection: "drop-shadow-[0_0_2px_rgba(34,197,94,0.7)]",
    Adjustment: "drop-shadow-[0_0_2px_rgba(253,224,71,0.7)]",
    Tune: "drop-shadow-[0_0_2px_rgba(139,92,246,0.7)]",
  };

  // const serviceStatClasses: Record<string, string> = {
  //   Maintenance: "text-white bg-blue-700/60",
  //   Replacement: "text-white bg-red-700/60",
  //   Inspection: "text-white bg-green-700/60",
  //   Adjustment: "text-white bg-yellow-700/60",
  //   Tune: "text-white bg-purple-700/60",
  // };

  // const hold = useHoldToEdit(() => {
  //   setEditingRecord(record); // sets this card as editing
  // });

  function onEdit(record: ServiceRecord) {
    console.log("Editing record:", record);
    openEditModal();
  }

  return (
    <li key={record.id} className="mb-1 relative">
      <div
        // {...hold}
        className={`w-full rounded-xl shadow-lg bg-black/60 backdrop-blur-md funnel-display-font leading-none ${
          serviceTypeClasses[record.ServiceType] || ""
        } relative`}
      >
        {editingRecord?.id === record.id && (
          <Button
            className="absolute -top-4 -right-4 z-20 w-12 h-12 bg-black/40 rounded-full flex items-center justify-center"
            type="button"
            size="xs"
            onClick={() => onEdit(record)}
          >
            <Svg type="pencil-1" color="green-500" size="lg" />
          </Button>
        )}

        <div
          className="w-full cursor-pointer"
          onClick={() => {
            toggleInfo(record.id);
            setEditingRecord(record); // show edit button when tapped
          }}
        >
          {/* Record content */}
          <div className="flex flex-col py-3 px-4 sm:px-8">
            {/* Line 1: Service Option */}
            <div className="font-semibold capitalize text-xl text-white tracking-wide mb-1">
              {record.ServiceOption}
            </div>

            {/* Line 2: Month + Year + Odometer */}
            <div className="flex justify-between items-center">
              <div className="flex flex-col text-left text-white/80">
                {(() => {
                  const date = new Date(record.ServicedDate);
                  const months = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ];
                  return (
                    <>
                      <div className="text-sm uppercase tracking-wider text-white/25">
                        {months[date.getMonth()]}{" "}
                        <span className="text-white/50">
                          {date.getFullYear()}
                        </span>
                      </div>
                      <div className="text-sm capitalize tracking-wider text-white/25">
                        {record.Odometer}
                      </div>
                    </>
                  );
                })()}
              </div>

              <div
                className={`text-sm font-thin capitalize px-3 py-1 rounded-full ${
                  serviceTypeClasses[record.ServiceType] ||
                  "text-gray-400 bg-gray-800/20"
                } ${glowClasses[record.ServiceType] || ""}`}
              >
                {record.ServiceType}
              </div>
            </div>
          </div>

          {/* Expand Button */}
          <div className="flex justify-center">
            <Button
              className="mx-auto flex p-0 m-[-25px] translate-y-[-13px]"
              type="button"
              size="small"
              onClick={toggleInfo}
              param={record.id}
            >
              <Svg type="angle-small-down2" size="md" color="white" />
            </Button>
          </div>

          {/* Expanded section */}
          {expandedItemId === record.id && (
            <div className="bg-black/30 text-white/80 text-left py-2 px-4 sm:px-8 rounded-b-2xl border-t border-gray-700">
              <div className="text-sm text-white/90 font-thin">
                {record.Comment}
              </div>

              <div className="px-4 py-2 flex flex-wrap gap-4">
                {record.FileUrls?.map((fileUrl, fileIndex) => (
                  <li key={fileIndex} className="list-none inline-flex px-2">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-center text-cyan-400 hover:text-cyan-300 text-lg roboto-flex-font flex items-center gap-1"
                    >
                      <Svg type="file-download1" size="2xl" color="sky-300" />
                      File {fileIndex + 1}
                    </a>
                  </li>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
};
