import { Autocomplete, TextField, Box, Typography } from "@mui/material";
import React, { useEffect, useState, useRef } from "react";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"; // Icon for "Not Found" message

export default function AccountField({
  formData,
  handleInputChange,
  ZOHO,
  selectedRowData,
}) {
  const [accounts, setAccounts] = useState([]); // No initial accounts
  const [selectedAccount, setSelectedAccount] = useState(formData?.What_Id || null); // Selected account object
  const [inputValue, setInputValue] = useState("");
  const [notFoundMessage, setNotFoundMessage] = useState(""); // Message if nothing is found
  const [loading, setLoading] = useState(false); // Loading state for search
  const debounceTimer = useRef(null); // Ref to store debounce timer
  const latestSearchId = useRef(0);

  // Sync selectedAccount with formData.What_Id for the default value
  useEffect(() => {
    if (formData.What_Id?.id) {
      const selected = {
        Account_Name: formData.What_Id.name,
        id: formData.What_Id.id,
      };
      setSelectedAccount(selected);
      setInputValue(formData.What_Id.name || "");
      setAccounts((prevAccounts) =>
        [selected, ...prevAccounts].filter(
          (v, i, a) => a.findIndex((t) => t.id === v.id) === i // Ensure no duplicates
        )
      );
    }
  }, [formData.What_Id]); // Rerun effect only when formData.What_Id changes

  useEffect(
    () => () => {
      clearTimeout(debounceTimer.current);
      latestSearchId.current += 1;
    },
    []
  );

  // Perform search with a query
  const performSearch = async (query, searchId) => {
    setNotFoundMessage(""); // Reset message before search

    if (ZOHO && query.trim()) {
      setLoading(true); // Start loading

      try {
        const searchResults = await ZOHO.CRM.API.searchRecord({
          Entity: "Accounts",
          Type: "word", // Full-text search
          Query: query.trim(),
        });

        if (searchId !== latestSearchId.current) return;

        if (searchResults?.data?.length > 0) {
          const formattedAccounts = searchResults.data.map((account) => ({
            Account_Name: account.Account_Name,
            id: account.id,
          }));
          setAccounts(formattedAccounts);
          setNotFoundMessage(""); // Clear the not-found message
        } else {
          setAccounts([]);
          setNotFoundMessage(`"${query.trim()}" not found in the database`);
        }
      } catch (error) {
        if (searchId !== latestSearchId.current) return;

        console.error("Error during search:", error);
        setAccounts([]);
        setNotFoundMessage(
          "An error occurred while searching. Please try again."
        );
      } finally {
        if (searchId === latestSearchId.current) {
          setLoading(false); // End loading
        }
      }
    } else {
      if (searchId === latestSearchId.current) setAccounts([]);
      setLoading(false);
    }
  };

  // Debounced input handler
  const handleInputChangeWithDebounce = (event, newInputValue, reason) => {
    setInputValue(newInputValue); // Update input value
    setNotFoundMessage(""); // Clear not-found message
    setLoading(false);
    const searchId = ++latestSearchId.current;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current); // Clear existing debounce timer
    }

    if (reason !== "input") return;

    // Set a new debounce timer
    debounceTimer.current = setTimeout(() => {
      performSearch(newInputValue, searchId); // Perform search after debounce
    }, 500); // 0.5 seconds debounce
  };

  const commonTextStyles = {
    fontSize: "9pt", // Set the font size to 9pt
    "& .MuiOutlinedInput-input": { fontSize: "9pt" }, // Input text size
    "& .MuiAutocomplete-input": { fontSize: "9pt" }, // Autocomplete input size
    "& .MuiTypography-root": { fontSize: "9pt" }, // Typography size
    "& .MuiFormLabel-root": { fontSize: "9pt" }, // Label text size
  };

  return (
    <Box>
      <Autocomplete
        freeSolo
        options={accounts}
        getOptionLabel={(option) => option.Account_Name || ""}
        value={selectedAccount}
        onChange={(event, newValue) => {
          setSelectedAccount(newValue); // Set selected account
          handleInputChange("What_Id", {
            id: newValue?.id || "",
            name: newValue?.Account_Name || "",
          }); // Trigger change handler
        }}
        inputValue={inputValue}
        onInputChange={handleInputChangeWithDebounce} // Use the debounced handler
        loading={loading} // Show loading indicator during search
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            size="small"
            variant="outlined"
            label="Associate with"
            placeholder="Start typing to search..."
            sx={{
              ...commonTextStyles,
              "& .MuiOutlinedInput-root": { padding: 0 },
            }}
          />
        )}
      />
      {notFoundMessage && (
        <Box
          role="alert"
          display="flex"
          alignItems="center"
          color="error.main"
          sx={{ ...commonTextStyles, mt: 0.5 }}
        >
          <ErrorOutlineIcon sx={{ mr: 1, fontSize: "9pt" }} />
          <Typography variant="body2" sx={{ ...commonTextStyles }}>
            {notFoundMessage}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
