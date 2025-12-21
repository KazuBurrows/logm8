import { useState } from "react";
import TransferSticker from "../componets/TransferSticker";
import ServiceRecordHierarchyEditor from "../componets/ServiceRecordHierarchyEditor";

type AdminView = "menu" | "transfer" | "serviceHierarchy";

export default function Admin() {
  const [view, setView] = useState<AdminView>("menu");

  return (
    <div className="w-2/3 mx-auto mt-10 p-4">
      {view === "menu" && (
        <>
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Admin Tools
          </h1>

          <button
            onClick={() => setView("transfer")}
            className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-md shadow-sm transition mb-3"
          >
            <span className="text-lg font-semibold text-gray-800">
              Transfer Logm8 Sticker
            </span>
          </button>

          <button
            onClick={() => setView("serviceHierarchy")}
            className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-md shadow-sm transition"
          >
            <span className="text-lg font-semibold text-gray-800">
              Service Record Hierarchy
            </span>
          </button>
        </>
      )}

      {view !== "menu" && (
        <div>
          {/* Back Button */}
          <button
            onClick={() => setView("menu")}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back
          </button>

          {view === "transfer" && <TransferSticker />}
          {view === "serviceHierarchy" && <ServiceRecordHierarchyEditor />}
        </div>
      )}
    </div>
  );
}
