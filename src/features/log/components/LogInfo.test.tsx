import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LogInfo from "./LogInfo";

jest.mock("../context/LogDataContext", () => {
  const actual = jest.requireActual("../context/LogDataContext");
  return {
    ...actual,
    useLogData: () => ({
      serviceOptions: [],
      ownershipOptions: [],
      addRecord: () => {},
      serviceRecords: [],
    }),
  };
});

const tag = {
  Token: "",
  Id: "tag-1",
  Make: "Honda",
  Model: "CB750",
  Year: 2023,
  Vehicle: "Motorbike",
  Style: "",
  Engine: 755,
  Fuel: [],
  Transmission: "Manual",
  Color: "Red",
  VinNumber: null,
  LicencePlate: null,
} as ServiceTag;

function renderAs(viewMode: "Service" | "Guest") {
  render(
    <MemoryRouter initialEntries={["/log?token=t"]}>
      <LogInfo tag={tag} viewMode={viewMode} />
    </MemoryRouter>
  );
}

test("a service link can edit vehicle details and add records", () => {
  renderAs("Service");
  expect(screen.getByRole("button", { name: "Edit vehicle details" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Add record" })).toBeInTheDocument();
});

test("a read-only (guest) link offers neither; the API would refuse them", () => {
  renderAs("Guest");
  expect(screen.queryByRole("button", { name: "Edit vehicle details" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Add record" })).not.toBeInTheDocument();
  expect(screen.getByRole("img", { name: "logm8" })).toBeInTheDocument();
});
