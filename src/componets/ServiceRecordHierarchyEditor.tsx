import { useEffect, useState } from "react";
import { ServiceHierarchyResult, ServiceOptionResult } from "../types/global";

type TreeProps = {
  nodes?: ServiceOptionResult[] | null;
  level?: number;
};

function ServiceOptionTree({ nodes, level = 0 }: TreeProps) {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return (
      <div className={`text-sm text-gray-400 pl-${level * 4}`}>
        No options available
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {nodes.map((node) => {
        if (!node || typeof node.id !== "number") return null;

        const children = Array.isArray(node.children) ? node.children : [];
        const serviceTypes = Array.isArray(node.serviceTypes)
          ? node.serviceTypes
          : [];

        return (
          <li key={node.id} className="pl-4 border-l border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800">{node.name ?? "Unnamed option"}</span>
                {node.description && (
                  <span className="text-sm text-gray-500 mt-1">{node.description}</span>
                )}
              </div>

              {serviceTypes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2 sm:mt-0">
                  {serviceTypes.map((type, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {children.length > 0 && (
              <ServiceOptionTree nodes={children} level={level + 1} />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function ServiceRecordHierarchyEditor() {
  const [data, setData] = useState<ServiceHierarchyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const res = await fetch(
          "http://localhost:7071/api/GetServiceRecordHierarchy"
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const normalize = (node: any): ServiceOptionResult => ({
          id: node.Id,
          name: node.Name,
          description: node.Description,
          serviceTypes: node.ServiceTypes ?? [],
          children: Array.isArray(node.Children)
            ? node.Children.map(normalize)
            : [],
        });

        const json: ServiceHierarchyResult = await res.json();
        setData({
          MotorbikeOptions: json.MotorbikeOptions.map(normalize),
          OwnershipOptions: json.OwnershipOptions.map(normalize),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchHierarchy();
  }, []);

  if (loading)
    return <div className="text-gray-600">Loading service options…</div>;
  if (error)
    return <div className="text-red-600 font-semibold">Error: {error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4">Motorbike Service Options</h2>
        <ServiceOptionTree nodes={data.MotorbikeOptions} />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Ownership Options</h2>
        <ServiceOptionTree nodes={data.OwnershipOptions} />
      </div>
    </div>
  );
}
