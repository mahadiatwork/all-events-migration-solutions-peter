import { Autocomplete, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";

export default function AccountField({ value, handleInputChange, ZOHO }) {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    async function getData() {
      if (ZOHO) {
        const accountsResponse = await ZOHO.CRM.API.getAllRecords({
          Entity: "Accounts",
          sort_order: "asc",
          per_page: 100,
          page: 1,
        });
        setAccounts(accountsResponse.data); // assuming accountsResponse contains 'data'
      }
    }
    getData();
  }, [ZOHO]); // Add ZOHO as a dependency

  return (
    <Autocomplete
      freeSolo // Allows users to type custom values in addition to selecting from options
      options={accounts} // Array of accounts for the autocomplete
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.Account_Name // Assuming accounts have an 'Account_Name' property
      }
      value={value}
      onChange={(event, newValue) => {
        handleInputChange("associateWith", newValue);
      }}
      onInputChange={(event, newInputValue) => {
        handleInputChange("associateWith", newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          size="small"
          variant="outlined"
          label="Associate with"
        />
      )}
    />
  );
}
