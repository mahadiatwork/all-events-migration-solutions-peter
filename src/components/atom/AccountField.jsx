import { Autocomplete, TextField, Button, Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"; // Icon for "Not Found" message

export default function AccountField({ value, handleInputChange, ZOHO, selectedRowData }) {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null); // Selected account object
  const [inputValue, setInputValue] = useState(""); // Initialize inputValue without using selectedRowData here
  const [notFoundMessage, setNotFoundMessage] = useState(""); // Message if nothing is found

  // Ensure `inputValue` and `selectedAccount` stays in sync with the `value` prop and fetched accounts
  useEffect(() => {
    if (value?.id) {
      // If `value` is passed from parent (formData), find the account from fetched accounts
      const matchedAccount = accounts.find(account => account.id === value.id);
      if (matchedAccount) {
        setSelectedAccount(matchedAccount);
        setInputValue(matchedAccount.Account_Name); // Set the input to the matched account name
      }
    } else if (selectedRowData?.What_Id?.id) {
      // If `selectedRowData` is provided, try to find the account by What_Id
      const matchedAccount = accounts.find(account => account.id === selectedRowData.What_Id.id);
      if (matchedAccount) {
        setSelectedAccount(matchedAccount);
        setInputValue(matchedAccount.Account_Name); // Set the input to the matched account name
      }
    } else {
      setSelectedAccount(null);
      setInputValue(""); // Reset inputValue if no value is available
    }
  }, [value, selectedRowData, accounts]); // Trigger when `value`, `selectedRowData`, or `accounts` change

  // Fetch accounts from Zoho CRM when ZOHO is available
  useEffect(() => {
    async function getData() {
      if (ZOHO) {
        const accountsResponse = await ZOHO.CRM.API.getAllRecords({
          Entity: "Accounts",
          sort_order: "asc",
          per_page: 100,
          page: 1,
        });
        if (accountsResponse?.data) {
          setAccounts(accountsResponse.data); // Store fetched accounts
        }
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
          typeof option === "string" ? option : option.Account_Name || ""
        }
        value={selectedAccount || null} // Use `selectedAccount` directly for the selected account
        onChange={(event, newValue) => {
          setSelectedAccount(newValue); // Set selected account
          handleInputChange("associateWith", newValue); // Handle the selected value
        }}
        inputValue={inputValue} // Controlled by inputValue state
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
