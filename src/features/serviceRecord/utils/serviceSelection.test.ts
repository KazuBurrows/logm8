import { categoryPathNames, findServiceSelection } from "./serviceSelection";

const node = (Id: number, Name: string, Children: ServiceOption[] = []): ServiceOption => ({
  Id,
  Name,
  Description: "",
  ServiceTypes: [],
  Children,
});

const services = [
  node(1, "Engine", [node(11, "Oil", [node(111, "Oil Change")]), node(12, "Spark Plugs")]),
];
const ownership = [node(9, "Ownership", [node(91, "Warrant of Fitness")])];

test("finds a three-level path", () => {
  const found = findServiceSelection(
    { ServiceCategory: "Engine", ServiceOption: "Oil Change" },
    services,
    ownership
  );
  expect(found?.category.Name).toBe("Engine");
  expect(found?.subcategory?.Name).toBe("Oil");
  expect(found?.option?.Name).toBe("Oil Change");
});

test("searches every directory given", () => {
  expect(
    categoryPathNames({ ServiceCategory: "Ownership", ServiceOption: "Warrant of Fitness" }, services, ownership)
  ).toEqual(["Ownership", "Warrant of Fitness"]);
});

test("a category-level record doesn't repeat the category name", () => {
  expect(categoryPathNames({ ServiceCategory: "Engine", ServiceOption: "Engine" }, services)).toEqual([
    "Engine",
  ]);
});

test("falls back to the stored names when the tree hasn't loaded", () => {
  expect(categoryPathNames({ ServiceCategory: "Brakes", ServiceOption: "Pads" })).toEqual([
    "Brakes",
    "Pads",
  ]);
  expect(categoryPathNames({ ServiceCategory: "Brakes", ServiceOption: "" })).toEqual(["Brakes"]);
});
