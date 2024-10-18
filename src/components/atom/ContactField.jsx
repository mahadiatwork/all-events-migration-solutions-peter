import { Autocomplete, TextField, Button, Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"; // Import an icon for the "Not Found" message

export default function ContactField({ value, handleInputChange, ZOHO, selectedRowData }) {
  const [contacts, setContacts] = useState([]);
  const [inputValue, setInputValue] = useState(""); // Store the input text
  const [advancedSearchActivated, setAdvancedSearchActivated] = useState(false);
  const [notFoundMessage, setNotFoundMessage] = useState("");

  // Extract participants from selectedRowData and set as default values for the autocomplete
  const defaultParticipants = selectedRowData?.Participants || [];

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
  }, [ZOHO]);

  const handleAdvancedSearch = async () => {
    setAdvancedSearchActivated(true);
    setNotFoundMessage(""); // Reset the message
  
    // Use the inputValue to perform the advanced search in Zoho CRM
    if (ZOHO && inputValue) {
      try {
        const searchCriteria = `(First_Name:equals:${inputValue})`; // Search criteria for the contact name
        const searchResults = await ZOHO.CRM.API.searchRecord({
          Entity: "Contacts", // You can change this to "Leads" or another module if needed
          Type: "criteria",
          Query: searchCriteria,
        });
  
        if (searchResults.data && searchResults.data.length > 0) {
          setContacts(searchResults.data); // Update the contacts with the search results
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

  console.log({defaultParticipants: selectedRowData  })

  return (
    <Box>
      <Autocomplete
        multiple // Enables multi-selection
        options={contacts} // Array of contacts for the autocomplete
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.Full_Name
        } // Assuming contacts have a 'Full_Name' property
        value={ defaultParticipants.map((participant) => ({
          Full_Name: participant.name, // Set default value based on participant name
          id: participant.participant, // Use participant ID as well for reference
        }))} // Default value is mapped from selectedRowData Participants
        onChange={(event, newValue) => {
          handleInputChange("scheduleWith", newValue); // Set the entire array of selected values
        }}
        inputValue={inputValue} // Display input text in the field
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue); // Update input value as the user types
          setNotFoundMessage(""); // Reset the "Not found" message when the user types again
        }}
        noOptionsText={
          notFoundMessage ? (
            // Display "Not found" message with an icon
            <Box display="flex" alignItems="center" color="error.main">
              <ErrorOutlineIcon sx={{ mr: 1 }} />
              <Typography variant="body2">{notFoundMessage}</Typography>
            </Box>
          ) : (
            // Display "Advanced Search" button if no "Not found" message
            <Button
              variant="text"
              startIcon={<SearchIcon />}
              onClick={handleAdvancedSearch}
              sx={{ color: "#1976d2", textTransform: "none" }}
            >
              Search First Name
            </Button>
          )
        }
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
    </Box>
  );
}
