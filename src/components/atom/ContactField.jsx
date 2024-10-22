import { Autocomplete, TextField, Button, Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function ContactField({ value, handleInputChange, ZOHO, selectedRowData }) {
  const [contacts, setContacts] = useState([]); // Contacts fetched from Zoho
  const [selectedParticipants, setSelectedParticipants] = useState([]); // Selected values in autocomplete
  const [inputValue, setInputValue] = useState(""); // Store the input text
  const [notFoundMessage, setNotFoundMessage] = useState("");

  // Sync selectedParticipants with value and selectedRowData
  useEffect(() => {
    if (value?.length) {
      // Map value with fetched contacts to find their Full_Name
      const mappedParticipants = value.map((participant) => {
        const matchedContact = contacts.find(contact => contact.id === participant.participant);
        return {
          Full_Name: matchedContact ? matchedContact.Full_Name : 'Unknown',
          id: participant.participant,
        };
      });
      setSelectedParticipants(mappedParticipants);
    } else if (selectedRowData?.Participants) {
      // Otherwise, if selectedRowData is available, use it as the default
      const defaultParticipants = selectedRowData.Participants.map((participant) => ({
        Full_Name: participant.name, // Match with Full_Name for Autocomplete
        id: participant.participant,
      }));
      setSelectedParticipants(defaultParticipants);
    }
  }, [value, selectedRowData, contacts]); // Also depend on contacts to ensure matching

  // Fetch contacts from Zoho CRM
  useEffect(() => {
    async function getData() {
      if (ZOHO) {
        const usersResponse = await ZOHO.CRM.API.getAllRecords({
          Entity: "Contacts",
          sort_order: "asc",
          per_page: 100,
          page: 1,
        });
        // Assuming Zoho returns contacts with Full_Name, map the result correctly
        if (usersResponse?.data) {
          const formattedContacts = usersResponse.data.map((contact) => ({
            Full_Name: contact.Full_Name,
            id: contact.id,
          }));
          setContacts(formattedContacts); // Store contacts in correct structure
        }
      }
    }
    getData();
  }, [ZOHO]);

  const handleAdvancedSearch = async () => {
    setNotFoundMessage(""); // Reset the message

    // Perform advanced search using inputValue
    if (ZOHO && inputValue) {
      try {
        const searchCriteria = `(First_Name:equals:${inputValue})`; // Search criteria
        const searchResults = await ZOHO.CRM.API.searchRecord({
          Entity: "Contacts",
          Type: "criteria",
          Query: searchCriteria,
        });

        if (searchResults.data && searchResults.data.length > 0) {
          const formattedContacts = searchResults.data.map((contact) => ({
            Full_Name: contact.Full_Name,
            id: contact.id,
          }));
          setContacts(formattedContacts); // Update contacts list with search results
          setNotFoundMessage(""); // Clear the "Not Found" message
        } else {
          setNotFoundMessage(`"${inputValue}" not found in the database`); // Show "Not Found" message
        }
      } catch (error) {
        console.error("Error during advanced search:", error);
        setNotFoundMessage("An error occurred while searching. Please try again.");
      }
    } else {
      setNotFoundMessage("Please enter a valid search term.");
    }
  };

  const handleSelectionChange = (event, newValue) => {
    setSelectedParticipants(newValue); // Update the selected values
    // Update the parent component with the selected contacts
    handleInputChange(
      "scheduledWith",
      newValue.map((contact) => ({
        Full_Name: contact.Full_Name,
        participant: contact.id,
        type: "contact"
      }))
    );
  };

  return (
    <Box>
      <Autocomplete
        multiple
        options={contacts}
        getOptionLabel={(option) => option.Full_Name || ""}
        value={selectedParticipants} // Control the selected values
        onChange={handleSelectionChange} // Handle the selection of new values
        inputValue={inputValue} // Display input text
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue); // Update input value when typing
          setNotFoundMessage(""); // Clear the "Not found" message when user types again
        }}
        noOptionsText={
          <Box display="flex" alignItems="center">
            <Button
              variant="text"
              startIcon={<SearchIcon />}
              onClick={handleAdvancedSearch}
              sx={{ color: "#1976d2", textTransform: "none" }}
            >
              Search First Name
            </Button>
            {notFoundMessage && (
              <Box display="flex" alignItems="center" color="error.main" ml={2}>
                <ErrorOutlineIcon sx={{ mr: 1 }} />
                <Typography variant="body2">{notFoundMessage}</Typography>
              </Box>
            )}
          </Box>
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
