import { useState } from "react";
import TransferSticker from "../componets/TransferSticker";

export default function Admin() {
  const [showTransfer, setShowTransfer] = useState(false);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      {!showTransfer && (
        <>
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Tools</h1>

          <button
            onClick={() => setShowTransfer(true)}
            className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-md shadow-sm transition"
          >
            <span className="text-lg font-semibold text-gray-800">
              Transfer Logm8 Sticker
            </span>
          </button>
        </>
      )}

      {showTransfer && (
        <div>
          {/* Back Button */}
          <button
            onClick={() => setShowTransfer(false)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back
          </button>

          {/* Full Page Component */}
          <TransferSticker />
        </div>
      )}
    </div>
  );
}