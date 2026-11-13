export interface ServiceSelectionPath {
  category: ServiceOption;
  subcategory: ServiceOption | null;
  option: ServiceOption | null;
}

/**
 * Finds where a record's category/option sit in the service option tree. A
 * record only stores its category name and its deepest option name, so the
 * subcategory in between has to be looked up.
 */
export function findServiceSelection(
  record: Pick<ServiceRecord, "ServiceCategory" | "ServiceOption">,
  ...directories: ServiceOption[][]
): ServiceSelectionPath | null {
  const { ServiceCategory: catName, ServiceOption: optName } = record;
  for (const dir of directories) {
    for (const cat of dir ?? []) {
      if (cat.Name !== catName) continue;
      for (const sub of cat.Children ?? []) {
        if (sub.Name === optName) return { category: cat, subcategory: sub, option: null };
        for (const opt of sub.Children ?? []) {
          if (opt.Name === optName) return { category: cat, subcategory: sub, option: opt };
        }
      }
      return { category: cat, subcategory: null, option: null };
    }
  }
  return null;
}

/**
 * The record's category path as names, e.g. ["Engine", "Oil", "Oil Change"].
 * Falls back to the stored category and option when the tree hasn't loaded or
 * no longer contains them.
 */
export function categoryPathNames(
  record: Pick<ServiceRecord, "ServiceCategory" | "ServiceOption">,
  ...directories: ServiceOption[][]
): string[] {
  const found = findServiceSelection(record, ...directories);
  const names = found
    ? [found.category.Name, found.subcategory?.Name, found.option?.Name]
    : [record.ServiceCategory, record.ServiceOption];
  // A category-level record stores the category name as its option too.
  return names.filter(
    (name, i, all): name is string => !!name && name.trim() !== "" && all.indexOf(name) === i
  );
}
