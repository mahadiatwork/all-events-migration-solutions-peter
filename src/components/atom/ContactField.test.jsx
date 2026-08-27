import {
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ContactField from "./ContactField";

const makeZoho = () => ({
  CRM: {
    API: {
      getRecord: vi.fn(),
      searchRecord: vi.fn(),
    },
  },
});

const renderContactField = ({
  formData = { scheduledWith: [] },
  handleInputChange = vi.fn(),
  ZOHO = makeZoho(),
} = {}) => {
  render(
    <ContactField
      formData={formData}
      handleInputChange={handleInputChange}
      ZOHO={ZOHO}
    />
  );

  return { handleInputChange, ZOHO };
};

const openPicker = async (user) => {
  await user.click(screen.getByRole("button", { name: "Contacts" }));
  return screen.getByRole("dialog", { name: "Select Contacts" });
};

const chooseSearchType = async (user, dialog, label) => {
  if (label === "First Name") return;
  await user.click(
    within(dialog).getByRole("combobox", { name: "Search By" })
  );
  await user.click(screen.getByRole("option", { name: label }));
};

const requestCases = [
  {
    label: "First Name",
    text: "  Ada  ",
    request: {
      Entity: "Contacts",
      Type: "criteria",
      Query: "(First_Name:equals:Ada)",
    },
  },
  {
    label: "Last Name",
    text: "Lovelace",
    request: {
      Entity: "Contacts",
      Type: "criteria",
      Query: "(Last_Name:equals:Lovelace)",
    },
  },
  {
    label: "Email",
    text: "ada@example.com",
    request: {
      Entity: "Contacts",
      Type: "email",
      Query: "ada@example.com",
    },
  },
  {
    label: "Mobile",
    text: "0400123456",
    request: {
      Entity: "Contacts",
      Type: "criteria",
      Query: "(Mobile:equals:0400123456)",
    },
  },
  {
    label: "MS File Number",
    text: "MS-123",
    request: {
      Entity: "Contacts",
      Type: "criteria",
      Query: "(ID_Number:equals:MS-123)",
    },
  },
];

describe("ContactField", () => {
  it("renders Search By options above the contact picker", async () => {
    const user = userEvent.setup();
    renderContactField();
    const dialog = await openPicker(user);

    await user.click(
      within(dialog).getByRole("combobox", { name: "Search By" })
    );

    const menu = screen.getByRole("listbox").closest(".MuiModal-root");
    expect(menu).toHaveStyle({ zIndex: "2001" });
  });

  it.each(requestCases)(
    "maps $label searches to the Zoho request",
    async ({ label, text, request }) => {
      const user = userEvent.setup();
      const ZOHO = makeZoho();
      ZOHO.CRM.API.searchRecord.mockResolvedValue({ data: [] });
      renderContactField({ ZOHO });
      const dialog = await openPicker(user);
      await chooseSearchType(user, dialog, label);
      await user.type(
        within(dialog).getByRole("textbox", { name: "Search Text" }),
        text
      );

      await user.click(
        within(dialog).getByRole("button", { name: "Search" })
      );

      await waitFor(() =>
        expect(ZOHO.CRM.API.searchRecord).toHaveBeenCalledWith(request)
      );
    }
  );

  it("loads all paginated staff contacts into the Search Text dropdown", async () => {
    const user = userEvent.setup();
    const ZOHO = makeZoho();
    ZOHO.CRM.API.searchRecord
      .mockResolvedValueOnce({
        data: [
          {
            id: "staff-1",
            First_Name: "Grace",
            Last_Name: "Hopper",
            Staff_Type: "Active",
          },
          {
            id: "contact-1",
            First_Name: "Not",
            Last_Name: "Staff",
            Staff_Type: "Client",
          },
        ],
        info: { more_records: true },
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: "staff-2",
            First_Name: "Ada",
            Last_Name: "Lovelace",
            Staff_Type: "Active",
          },
        ],
        info: { more_records: false },
      });
    renderContactField({ ZOHO });
    const dialog = await openPicker(user);

    await chooseSearchType(user, dialog, "Staff");

    await waitFor(() =>
      expect(ZOHO.CRM.API.searchRecord).toHaveBeenCalledTimes(2)
    );
    expect(ZOHO.CRM.API.searchRecord).toHaveBeenNthCalledWith(
      1,
      {
        Entity: "Contacts",
        Type: "criteria",
        Query: "(Staff_Type:equals:Active)",
        page: 1,
        per_page: 200,
      }
    );
    expect(ZOHO.CRM.API.searchRecord).toHaveBeenNthCalledWith(
      2,
      {
        Entity: "Contacts",
        Type: "criteria",
        Query: "(Staff_Type:equals:Active)",
        page: 2,
        per_page: 200,
      }
    );
    const staffSearch = within(dialog).getByRole("combobox", {
      name: "Search Text",
    });
    await user.click(staffSearch);

    const graceOption = await screen.findByRole("option", {
      name: "Grace Hopper",
    });
    expect(
      screen.getByRole("option", { name: "Ada Lovelace" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Not Staff" })
    ).not.toBeInTheDocument();
    expect(graceOption.closest(".MuiAutocomplete-popper")).toHaveStyle({
      zIndex: "2001",
    });

    await user.click(graceOption);

    expect(
      within(dialog).getByRole("checkbox", { name: "Remove Grace Hopper" })
    ).toBeChecked();
    expect(within(dialog).getByRole("button", { name: "OK" })).toBeEnabled();
    expect(
      within(dialog).queryByRole("button", { name: "Search" })
    ).not.toBeInTheDocument();
  });

  it("selects a search result and commits it with OK", async () => {
    const user = userEvent.setup();
    const ZOHO = makeZoho();
    const handleInputChange = vi.fn();
    ZOHO.CRM.API.searchRecord.mockResolvedValue({
      data: [
        {
          id: "contact-1",
          First_Name: "Ada",
          Last_Name: "Lovelace",
          Email: "ada@example.com",
          Mobile: "0400123456",
          ID_Number: "MS-123",
        },
      ],
    });
    renderContactField({ ZOHO, handleInputChange });
    const dialog = await openPicker(user);
    await user.type(
      within(dialog).getByRole("textbox", { name: "Search Text" }),
      "Ada"
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Search" })
    );

    await user.click(
      await screen.findByRole("checkbox", { name: "Select Ada Lovelace" })
    );
    await user.click(within(dialog).getByRole("button", { name: "OK" }));

    expect(handleInputChange).toHaveBeenCalledWith("scheduledWith", [
      {
        Full_Name: "Ada Lovelace",
        Email: "ada@example.com",
        participant: "contact-1",
        type: "contact",
      },
    ]);
    expect(screen.getByPlaceholderText("Selected contacts")).toHaveValue(
      "Ada Lovelace"
    );
    expect(
      screen.queryByRole("dialog", { name: "Select Contacts" })
    ).not.toBeInTheDocument();
  });

  it("discards draft selections when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const ZOHO = makeZoho();
    const handleInputChange = vi.fn();
    ZOHO.CRM.API.searchRecord.mockResolvedValue({
      data: [
        {
          id: "contact-1",
          First_Name: "Ada",
          Last_Name: "Lovelace",
          Email: "ada@example.com",
        },
      ],
    });
    renderContactField({ ZOHO, handleInputChange });
    const dialog = await openPicker(user);
    await user.type(
      within(dialog).getByRole("textbox", { name: "Search Text" }),
      "Ada"
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Search" })
    );
    await user.click(
      await screen.findByRole("checkbox", { name: "Select Ada Lovelace" })
    );

    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    expect(handleInputChange).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText("Selected contacts")).toHaveValue("");
    expect(
      screen.queryByRole("dialog", { name: "Select Contacts" })
    ).not.toBeInTheDocument();
  });

  it("hydrates existing participants from Zoho", async () => {
    const ZOHO = makeZoho();
    const handleInputChange = vi.fn();
    ZOHO.CRM.API.getRecord.mockResolvedValue({
      data: [
        {
          id: "contact-1",
          First_Name: "Ada",
          Last_Name: "Lovelace",
          Email: "ada@example.com",
          Mobile: "0400123456",
          ID_Number: "MS-123",
        },
      ],
    });

    renderContactField({
      ZOHO,
      handleInputChange,
      formData: {
        scheduledWith: [{ participant: "contact-1", name: "Ada" }],
      },
    });

    await waitFor(() =>
      expect(ZOHO.CRM.API.getRecord).toHaveBeenCalledWith({
        Entity: "Contacts",
        RecordID: "contact-1",
      })
    );
    const hydratedParticipant = {
      id: "contact-1",
      First_Name: "Ada",
      Last_Name: "Lovelace",
      Email: "ada@example.com",
      Mobile: "0400123456",
      Full_Name: "Ada Lovelace",
      ID_Number: "MS-123",
      type: "contact",
      participant: "contact-1",
    };
    await waitFor(() =>
      expect(handleInputChange).toHaveBeenCalledWith("scheduledWith", [
        hydratedParticipant,
      ])
    );
    expect(screen.getByPlaceholderText("Selected contacts")).toHaveValue(
      "Ada Lovelace"
    );
  });
});
