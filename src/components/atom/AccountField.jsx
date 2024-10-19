import { Autocomplete, TextField, Button, Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"; // Icon for "Not Found" message

export default function AccountField({ value, handleInputChange, ZOHO, selectedRowData }) {
  const [accounts, setAccounts] = useState([]);
  const [inputValue, setInputValue] = useState(selectedRowData?.What_Id?.name || ""); // Set default to What_Id name
  const [notFoundMessage, setNotFoundMessage] = useState(""); // Message if nothing is found

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

  const handleAdvancedSearch = async () => {
    setNotFoundMessage(""); // Reset the message before new search

    // Use the inputValue to perform the advanced search in Zoho CRM
    if (ZOHO && inputValue) {
      try {
        const searchCriteria = `(Account_Name:equals:${inputValue})`; // Search criteria for the account name
        const searchResults = await ZOHO.CRM.API.searchRecord({
          Entity: "Accounts",
          Type: "criteria",
          Query: searchCriteria,
        });

        if (searchResults.data && searchResults.data.length > 0) {
          setAccounts(searchResults.data); // Update the accounts with the search results
          setNotFoundMessage(""); // Clear the not found message since we found something
        } else {
          setNotFoundMessage(`"${inputValue}" not found in the database`); // Display "Not found" message
        }
      } catch (error) {
        console.error("Error during advanced search:", error);
        setNotFoundMessage("An error occurred while searching. Please try again.");
      }
    } else {
      setNotFoundMessage("Please enter a valid search term.");
    }
  };

  return (
    <Box>
      <Autocomplete
        freeSolo // Allows users to type custom values in addition to selecting from options
        options={accounts} // Array of accounts for the autocomplete
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.Account_Name // Assuming accounts have an 'Account_Name' property
        }
        value={
          value.name || selectedRowData?.What_Id.name || null // Set default value based on selectedRowData What_Id
        }
        onChange={(event, newValue) => {
          handleInputChange("associateWith", newValue); // Handle the selected value
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue); // Update input value as the user types
          setNotFoundMessage(""); // Reset the "Not found" message when the user types again
        }}
        noOptionsText={
          inputValue ? (
            <Button
              variant="text"
              startIcon={<SearchIcon />}
              onClick={handleAdvancedSearch}
              sx={{ color: "#1976d2", textTransform: "none" }}
            >
              Search First Name
            </Button>
          ) : (
            <Typography variant="body2" color="textSecondary">
              Start typing to search...
            </Typography>
          )
        }
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

      {/* Display "Not found" message if applicable */}
      {notFoundMessage && (
        <Box display="flex" alignItems="center" color="error.main" sx={{ mt: 2 }}>
          <ErrorOutlineIcon sx={{ mr: 1 }} />
          <Typography variant="body2">{notFoundMessage}</Typography>
        </Box>
      )}
    </Box>
  );
}
