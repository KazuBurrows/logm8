import React, { useState } from "react";
import { apiClient } from "../../api/client";

interface ReplaceTagRequest {
  oldTagId: string;
  newTagId: string;
}

export default function TransferSticker() {
  const [oldTagId, setOldTagId] = useState("");
  const [newTagId, setNewTagId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const payload: ReplaceTagRequest = {
      oldTagId,
      newTagId,
    };

    try {
      const text = await apiClient.postText("ReplaceNfcTag", payload);
      setMessage(`✅ ${text}`);
    } catch (err) {
      setMessage(`❌ ${err instanceof Error ? err.message : "Network error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg space-y-4"
    >
      <h2 className="text-xl font-semibold text-gray-800">
        Transfer Logm8 Sticker
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Old Sticker ID
        </label>
        <input
          type="text"
          value={oldTagId}
          onChange={(e) => setOldTagId(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter old sticker ID"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          New Sticker ID
        </label>
        <input
          type="text"
          value={newTagId}
          onChange={(e) => setNewTagId(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter new sticker ID"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Transferring..." : "Submit"}
      </button>

      {message && (
        <p className="text-sm text-center mt-2 text-gray-700">{message}</p>
      )}
    </form>
  );
}
