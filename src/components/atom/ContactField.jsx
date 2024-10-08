import { Autocomplete, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";

export default function ContactField({ value, handleInputChange, ZOHO }) {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    async function getData() {
      if (ZOHO) {
        const usersResponse = await ZOHO.CRM.API.getAllRecords({
          Entity: "Contacts",
          sort_order: "asc",
          per_page: 100,
          page: 1,
        });
        setContacts(usersResponse.data); // assuming usersResponse contains 'data'
      }
    }
    getData();
  }, [ZOHO]); // Add ZOHO as a dependency

  return (
    <Autocomplete
      freeSolo // Allows users to type custom values in addition to selecting from options
      options={contacts} // Array of contacts for the autocomplete
      getOptionLabel={(option) => 
        typeof option === "string" ? option : option.Full_Name
      } // Assuming contacts have a 'Full_Name' property
      value={value}
      onChange={(event, newValue) => {
        handleInputChange("scheduleWith", newValue);
      }}
      onInputChange={(event, newInputValue) => {
        handleInputChange("scheduleWith", newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          size="small"
          variant="outlined"
            label="Scheduled with"
        />
      )}
    />
  );
}
