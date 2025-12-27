import { useEffect, useState } from "react";
import { ServiceHierarchyResult, ServiceOptionResult } from "../types/global";

type TreeProps = {
  nodes?: ServiceOptionResult[] | null;
  level?: number;
};


const serviceTypes = [
  { id: 1, name: "Maintenance" },
  { id: 2, name: "Replacement" },
  { id: 3, name: "Inspection" },
  { id: 4, name: "Adjustment" },
  { id: 5, name: "Tune" },
  { id: 6, name: "WOF" },
  { id: 7, name: "Registration" },
  { id: 8, name: "Certification" }
];

const categoryIds = [
  { id: 1, name: "Service" },
  { id: 2, name: "Ownership" }
];

function flattenOptions(nodes: ServiceOptionResult[]): ServiceOptionResult[] {
  const map = new Map<number, ServiceOptionResult>();

  const walk = (list: ServiceOptionResult[]) => {
    for (const node of list) {
      if (!map.has(node.id)) {
        map.set(node.id, node);
      }
      if (Array.isArray(node.children) && node.children.length > 0) {
        walk(node.children);
      }
    }
  };

  walk(nodes);
  return Array.from(map.values());
}


function flattenWithParents(
  nodes: ServiceOptionResult[],
  parent: ServiceOptionResult | null = null,
  map = new Map<number, { node: ServiceOptionResult; parents: ServiceOptionResult[] }>()
) {
  for (const node of nodes) {
    if (!map.has(node.id)) {
      map.set(node.id, { node, parents: [] });
    }

    // ✅ Add this parent (if exists)
    if (parent) {
      map.get(node.id)!.parents.push(parent);
    }

    // ✅ Recurse into children
    if (node.children?.length) {
      flattenWithParents(node.children, node, map);
    }
  }

  return map;
}


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
                  <span className="text-xl text-gray-500 mt-1">{node.description}</span>
                )}
              </div>

              {serviceTypes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2 sm:mt-0">
                  {serviceTypes.map((type, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 text-md px-2 py-0.5 rounded-full"
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


function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[400px] relative">
        <button
          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-70"
          onClick={onClose}
        >
          Close
        </button>
        <h2 className="text-xl font-semibold mb-4">{title}</h2>

        {children}

      </div>
    </div>
  );
}



export default function ServiceRecordHierarchyEditor() {
  const [data, setData] = useState<ServiceHierarchyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  const [modalType, setModalType] = useState<"parent" | "serviceType" | "createServiceOption" | null>(null);
  const [selectedOption, setSelectedOption] = useState<ServiceOptionResult | null>(null);
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState(0);
  const [selectedParentId, setSelectedParentId] = useState("");
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionDescription, setNewOptionDescription] = useState("");
  const [newOptionCategory, setNewOptionCategory] = useState("");

  const openModal = (type: "parent" | "serviceType" | "createServiceOption", option?: ServiceOptionResult) => {
    setSelectedOption(option ?? null);
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedOption(null);
  };

  const toggle = (id: number) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  const motorbikeMap = flattenWithParents(data?.MotorbikeOptions ?? []);
  const ownershipMap = flattenWithParents(data?.OwnershipOptions ?? []);

  const allUniqueOptions = [
    ...flattenOptions(data?.MotorbikeOptions ?? []),
    ...flattenOptions(data?.OwnershipOptions ?? []),
  ];

  const uniqueById = Array.from(
    new Map(allUniqueOptions.map(o => [o.id, o])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));


  // ✅ Merge both maps
  const merged = new Map([...motorbikeMap, ...ownershipMap]);

  // ✅ Convert to array
  const flatList = Array.from(merged.values()).map(x => ({
    ...x.node,
    parents: x.parents
  }));

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const res = await fetch(
          "https://logmate.azurewebsites.net/api/GetServiceOptionHierarchy",
          // "http://localhost:7071/api/GetServiceOptionHierarchy",
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




  const handleAddServiceType = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOption) return;

    const payload = {
      optionId: selectedOption.id,
      serviceTypeId: selectedServiceTypeId,
    };

    try {
      const res = await fetch(
        "https://logmate.azurewebsites.net/api/AddServiceOptionServiceType",
        // "http://localhost:7071/api/AddServiceOptionServiceType", 
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      console.log("Service type added successfully");
      closeModal(); // optional

    } catch (err) {
      console.error("Failed to add service type", err);
    }
  };


  const handleAddParent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOption || !selectedParentId) return;

    const payload = {
      optionId: selectedOption.id,
      parentId: Number(selectedParentId),
    };

    try {
      const res = await fetch(
        "https://logmate.azurewebsites.net/api/AddParentServiceOption",
        // "http://localhost:7071/api/AddParentServiceOption",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      console.log("Parent added successfully");
      closeModal(); // optional

    } catch (err) {
      console.error("Failed to add parent", err);
    }
  };


  const handleCreateServiceOption = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: newOptionName,
      description: newOptionDescription,
      categoryId: Number(newOptionCategory),
    };

    try {
      const res = await fetch(
        "https://logmate.azurewebsites.net/api/AddServiceOption",
        // "http://localhost:7071/api/AddServiceOption",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      console.log("Service option created successfully");
      closeModal(); // optional

    } catch (err) {
      console.error("Failed to create service option", err);
    }
  };


  return (
    <>
      <div className="flex gap-32">
        <div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Motorbike Service Options</h2>
            <ServiceOptionTree nodes={data.MotorbikeOptions} />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Ownership Options</h2>
            <ServiceOptionTree nodes={data.OwnershipOptions} />
          </div>
        </div>


        <div className="w-full">
          <div className="flex gap-4 mb-4">
            <h2 className="text-2xl font-bold mb-4">All Unique Service Options</h2>


            <button
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-blue-700 ml-auto"
              onClick={(e) => {
                e.stopPropagation();
                openModal("createServiceOption");
              }}
            >
              Create Service Option
            </button>

          </div>
          <ul className="space-y-2">
            {flatList.map(option => {
              const isOpen = openId === option.id;

              return (
                <li
                  key={option.id}
                  className="p-2 border rounded cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => toggle(option.id)}
                >
                  {/* Header row */}
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-gray-800">{option.name}</div>
                    <span className="text-gray-500">{isOpen ? "▲" : "▼"}</span>
                  </div>

                  {/* Description */}
                  {option.description && (
                    <div className="text-gray-500 text-sm">{option.description}</div>
                  )}

                  {/* Parents */}
                  {option.parents.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {option.parents.map((p, i) => (
                        <span
                          key={i}
                          className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full"
                        >
                          Parent: {p.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* ✅ Expandable button section */}
                  {isOpen && (
                    <div className="mt-3 flex gap-2">
                      <button
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal("parent", option);
                        }}
                      >
                        Add Parent
                      </button>

                      <button
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal("serviceType", option);
                        }}
                      >
                        Add Service Type
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <Modal
        open={modalType !== null}
        onClose={closeModal}
        title={
          modalType === "parent"
            ? `Add Parent to ${selectedOption?.name}`
            : modalType === "serviceType"
              ? `Add Service Type to ${selectedOption?.name}`
              : ""
        }
      >
        {modalType === "parent" && (
          <form onSubmit={handleAddParent}>
            <p className="text-gray-700 mb-2">
              Here you can add a parent to <strong>{selectedOption?.name}</strong>.
            </p>

            <select
              className="text-2xl bg-slate-200 w-full p-2 rounded"
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
              required
            >
              <option value="">-- Select parent service option --</option>
              {uniqueById.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <div className="flex justify-center">
              <button
                type="submit"
                className="w-1/2 p-2 bg-rose-500 text-white font-bold uppercase rounded mt-4 hover:bg-rose-600"
              >
                Submit
              </button>
            </div>
          </form>
        )}

        {modalType === "serviceType" && (
          <form onSubmit={handleAddServiceType}>
            <p className="text-gray-700 mb-2">
              Add a service type to <strong>{selectedOption?.name}</strong>.
            </p>

            <select
              className="text-2xl bg-slate-200 w-full p-2 rounded"
              value={selectedServiceTypeId}
              onChange={(e) => setSelectedServiceTypeId(Number(e.target.value))}
              required
            >
              <option value="">-- Select a service type --</option>
              {serviceTypes.map((s) => (
                <option key={`${s.id}-${s.name}`} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <div className="flex justify-center">
              <button
                type="submit"
                className="w-1/2 p-2 bg-rose-500 text-white font-bold uppercase rounded mt-4 hover:bg-rose-600"
              >
                Submit
              </button>
            </div>
          </form>
        )}

        {modalType === "createServiceOption" && (
          <form onSubmit={handleCreateServiceOption}>
            <p className="text-gray-700 mb-2">
              <strong>Create new Service Option</strong>.
            </p>

            {/* Name */}
            <div className="mb-4 w-full">
              <label className="block text-sm font-medium mb-1" htmlFor="ServiceOptionName">
                Name
              </label>
              <input
                type="text"
                id="ServiceOptionName"
                className="w-full p-2 border rounded"
                placeholder="Oil Change"
                value={newOptionName}
                onChange={(e) => setNewOptionName(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="mb-4 w-full">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="ServiceOptionDescription"
              >
                Description
              </label>

              <textarea
                id="ServiceOptionDescription"
                className="w-full p-2 border rounded h-28 resize-y"
                placeholder="Drain and replace engine oil and oil filter to maintain lubrication and performance"
                value={newOptionDescription}
                onChange={(e) => setNewOptionDescription(e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="mb-4 w-full">
              <label className="block text-sm font-medium mb-1">
                Category
              </label>
              <select
                className="w-full p-2 border rounded bg-slate-200"
                value={newOptionCategory}
                onChange={(e) => setNewOptionCategory(e.target.value)}
                required
              >
                <option value="">-- Select a category --</option>
                {categoryIds.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="w-1/2 p-2 bg-rose-500 text-white font-bold uppercase rounded mt-4 hover:bg-rose-600"
              >
                Submit
              </button>
            </div>
          </form>
        )}
      </Modal>

    </>


  );
}
