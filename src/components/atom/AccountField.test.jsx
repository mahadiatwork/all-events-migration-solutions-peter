import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AccountField from "./AccountField";

const makeZoho = () => ({
  CRM: {
    API: {
      searchRecord: vi.fn(),
    },
  },
});

const renderAccountField = ({
  formData = { What_Id: null },
  handleInputChange = vi.fn(),
  ZOHO = makeZoho(),
} = {}) => {
  const view = render(
    <AccountField
      formData={formData}
      handleInputChange={handleInputChange}
      ZOHO={ZOHO}
    />
  );

  return {
    ...view,
    input: screen.getByRole("combobox", { name: /associate with/i }),
    handleInputChange,
    ZOHO,
  };
};

const advanceSearch = async (milliseconds = 500) => {
  await act(async () => {
    vi.advanceTimersByTime(milliseconds);
  });
};

describe("AccountField", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("debounces searches for 500ms and only searches the latest input", async () => {
    const ZOHO = makeZoho();
    ZOHO.CRM.API.searchRecord.mockResolvedValue({ data: [] });
    const { input } = renderAccountField({ ZOHO });

    fireEvent.change(input, { target: { value: "Ac" } });
    await advanceSearch(300);
    fireEvent.change(input, { target: { value: "  Acme  " } });
    await advanceSearch(499);

    expect(ZOHO.CRM.API.searchRecord).not.toHaveBeenCalled();

    await advanceSearch(1);

    expect(ZOHO.CRM.API.searchRecord).toHaveBeenCalledTimes(1);
    expect(ZOHO.CRM.API.searchRecord).toHaveBeenCalledWith({
      Entity: "Accounts",
      Type: "word",
      Query: "Acme",
    });
  });

  it("renders results and commits the selected account", async () => {
    const ZOHO = makeZoho();
    const handleInputChange = vi.fn();
    ZOHO.CRM.API.searchRecord.mockResolvedValue({
      data: [{ id: "account-1", Account_Name: "Acme Pty Ltd" }],
    });
    const { input } = renderAccountField({ ZOHO, handleInputChange });

    fireEvent.change(input, { target: { value: "Acme" } });
    await advanceSearch();
    fireEvent.click(
      screen.getByRole("option", { name: "Acme Pty Ltd" })
    );

    expect(handleInputChange).toHaveBeenCalledWith("What_Id", {
      id: "account-1",
      name: "Acme Pty Ltd",
    });
    expect(input).toHaveValue("Acme Pty Ltd");
  });

  it("shows a not-found message and removes stale results", async () => {
    const ZOHO = makeZoho();
    ZOHO.CRM.API.searchRecord
      .mockResolvedValueOnce({
        data: [{ id: "account-1", Account_Name: "Acme Pty Ltd" }],
      })
      .mockResolvedValueOnce({ data: [] });
    const { input } = renderAccountField({ ZOHO });

    fireEvent.change(input, { target: { value: "Acme" } });
    await advanceSearch();
    expect(
      screen.getByRole("option", { name: "Acme Pty Ltd" })
    ).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "Missing" } });
    await advanceSearch();
    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(
      screen.queryByRole("option", { name: "Acme Pty Ltd" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('"Missing" not found in the database')
    ).toBeInTheDocument();
  });

  it("shows an error message and removes stale results when Zoho rejects", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const ZOHO = makeZoho();
    ZOHO.CRM.API.searchRecord
      .mockResolvedValueOnce({
        data: [{ id: "account-1", Account_Name: "Acme Pty Ltd" }],
      })
      .mockRejectedValueOnce(new Error("Zoho unavailable"));
    const { input } = renderAccountField({ ZOHO });

    fireEvent.change(input, { target: { value: "Acme" } });
    await advanceSearch();
    fireEvent.change(input, { target: { value: "Other" } });
    await advanceSearch();
    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(
      screen.queryByRole("option", { name: "Acme Pty Ltd" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("An error occurred while searching. Please try again.")
    ).toBeInTheDocument();
  });

  it("ignores an older response that resolves after the latest search", async () => {
    const ZOHO = makeZoho();
    let resolveOlderSearch;
    ZOHO.CRM.API.searchRecord
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveOlderSearch = resolve;
          })
      )
      .mockResolvedValueOnce({
        data: [{ id: "new", Account_Name: "New Account" }],
      });
    const { input } = renderAccountField({ ZOHO });

    fireEvent.change(input, { target: { value: "Old" } });
    await advanceSearch();
    fireEvent.change(input, { target: { value: "New" } });
    await advanceSearch();

    expect(
      screen.getByRole("option", { name: "New Account" })
    ).toBeInTheDocument();

    await act(async () => {
      resolveOlderSearch({
        data: [{ id: "old", Account_Name: "Old Account" }],
      });
    });

    expect(
      screen.queryByRole("option", { name: "Old Account" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "New Account" })
    ).toBeInTheDocument();
  });

  it("cancels a pending search when unmounted", async () => {
    const ZOHO = makeZoho();
    ZOHO.CRM.API.searchRecord.mockResolvedValue({ data: [] });
    const { input, unmount } = renderAccountField({ ZOHO });

    fireEvent.change(input, { target: { value: "Acme" } });
    unmount();

    await advanceSearch();

    expect(ZOHO.CRM.API.searchRecord).not.toHaveBeenCalled();
  });
});
