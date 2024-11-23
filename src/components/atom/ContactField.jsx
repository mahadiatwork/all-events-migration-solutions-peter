import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Typography,
} from "@mui/material";

export default function ContactField({
  handleInputChange,
  ZOHO,
  selectedRowData = {}, // Default to an empty object
}) {
  const [contacts, setContacts] = useState([]); // Fetched contacts
  const [selectedParticipants, setSelectedParticipants] = useState([]); // Selected participants
  const [searchType, setSearchType] = useState("First_Name"); // Search criteria
  const [searchText, setSearchText] = useState(""); // Search input
  const [filteredContacts, setFilteredContacts] = useState([]); // Filtered contacts for display
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const debounceTimer = useRef(null); // Debounce timer for search

  // Prepopulate and fetch missing data for selectedParticipants
  useEffect(() => {
    const fetchParticipantsDetails = async () => {
      if (selectedRowData.Participants && ZOHO) {
        const participants = await Promise.all(
          selectedRowData.Participants.map(async (participant) => {
            try {
              const contactDetails = await ZOHO.CRM.API.getRecord({
                Entity: "Contacts",
                RecordID: participant.participant, // Use participant ID
              });

              if (contactDetails.data && contactDetails.data.length > 0) {
                const contact = contactDetails.data[0];
                return {
                  id: contact.id,
                  First_Name: contact.First_Name || "N/A",
                  Last_Name: contact.Last_Name || "N/A",
                  Email: contact.Email || "No Email",
                  Mobile: contact.Mobile || "N/A",
                  Full_Name: `${contact.First_Name || "N/A"} ${
                    contact.Last_Name || "N/A"
                  }`,
                  ID_Number: contact.ID_Number || "N/A",
                };
              } else {
                return {
                  id: participant.participant,
                  Full_Name: participant.name || "Unknown",
                  Email: participant.Email || "No Email",
                };
              }
            } catch (error) {
              console.error(
                `Error fetching contact details for ID ${participant.participant}:`,
                error
              );
              return {
                id: participant.participant,
                Full_Name: participant.name || "Unknown",
                Email: participant.Email || "No Email",
              };
            }
          })
        );
        setSelectedParticipants(participants);
      }
    };

    fetchParticipantsDetails();
  }, [selectedRowData, ZOHO]);

  // Open modal and sync selected participants
  const handleOpen = () => {
    setFilteredContacts([]);
    setIsModalOpen(true);
  };

  // Close modal without saving changes
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // Fetch and filter contacts from the server based on search criteria
  const handleSearch = async () => {
    if (!ZOHO || !searchText.trim()) return;

    try {
      let searchResults;

      if (searchType === "Email") {
        searchResults = await ZOHO.CRM.API.searchRecord({
          Entity: "Contacts",
          Type: "email",
          Query: searchText.trim(),
        });
      } else if (searchType === "Mobile") {
        searchResults = await ZOHO.CRM.API.searchRecord({
          Entity: "Contacts",
          Type: "criteria",
          Query: `(Mobile:equals:${searchText.trim()})`,
        });
      } else if (searchType === "ID_Number") {
        searchResults = await ZOHO.CRM.API.searchRecord({
          Entity: "Contacts",
          Type: "criteria",
          Query: `(ID_Number:equals:${searchText.trim()})`,
        });
      } else if (searchType === "Full_Name") {
        searchResults = await ZOHO.CRM.API.searchRecord({
          Entity: "Contacts",
          Type: "word",
          Query: searchText.trim(),
        });
      } else {
        searchResults = await ZOHO.CRM.API.searchRecord({
          Entity: "Contacts",
          Type: "criteria",
          Query: `(${searchType}:equals:${searchText.trim()})`,
        });
      }

      if (searchResults.data && searchResults.data.length > 0) {
        const formattedContacts = searchResults.data.map((contact) => ({
          First_Name: contact.First_Name || "N/A",
          Last_Name: contact.Last_Name || "N/A",
          Email: contact.Email || "No Email",
          Mobile: contact.Mobile || "N/A",
          ID_Number: contact.ID_Number || "N/A", // Assuming ID_Number is available
          id: contact.id,
        }));
        setFilteredContacts(formattedContacts);
      } else {
        setFilteredContacts([]);
      }
    } catch (error) {
      console.error("Error during search:", error);
      setFilteredContacts([]);
    }
  };

  // Toggle selection of a contact
  const toggleContactSelection = (contact) => {
    setSelectedParticipants((prev) =>
      prev.some((c) => c.id === contact.id)
        ? prev.filter((c) => c.id !== contact.id)
        : [...prev, contact]
    );
  };

  // Save changes and close the modal
  const handleOk = () => {
    const updatedParticipants = selectedParticipants.map((participant) => ({
      Full_Name: participant.Full_Name || `${participant.First_Name} ${participant.Last_Name}`,
      Email: participant.Email,
      participant: participant.id,
      type: "contact",
    }));

    handleInputChange("scheduledWith", updatedParticipants);

    // Close the modal
    setIsModalOpen(false);
  };

  return (
    <Box>
      {/* Single-line display for selected contacts */}
      <Box display="flex" alignItems="center" gap={2}>
        <TextField
          fullWidth
          value={selectedParticipants
            .map((c) => c.Full_Name || `${c.First_Name} ${c.Last_Name}`)
            .join(", ")}
          variant="outlined"
          placeholder="Selected contacts"
          InputProps={{
            readOnly: true,
          }}
          size="small"
        />
        <Button
          variant="contained"
          onClick={handleOpen}
          sx={{ width: "100px" }}
        >
          Contacts
        </Button>
      </Box>

      {/* Modal */}
      <Dialog open={isModalOpen} onClose={handleCancel} fullWidth maxWidth="md">
        <DialogContent>
          {/* Search Controls */}
          <Box display="flex" gap={2} mb={2}>
            <TextField
              select
              label="Search By"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="First_Name">First Name</MenuItem>
              <MenuItem value="Last_Name">Last Name</MenuItem>
              <MenuItem value="Email">Email</MenuItem>
              <MenuItem value="Mobile">Mobile</MenuItem>
              <MenuItem value="ID_Number">MS File Number</MenuItem>
              <MenuItem value="Full_Name">Full Name</MenuItem>
            </TextField>
            <TextField
              label="Search Text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              fullWidth
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{ width: "150px" }} // Wider search button
            >
              Search
            </Button>
          </Box>

          {/* Search Results Table */}
          <TableContainer
            sx={{
              maxHeight: 300, // Limit height to 300px
              overflowY: "auto", // Enable vertical scrolling
            }}
          >
            <Table size="small" sx={{ tableLayout: "fixed", fontSize: "9pt" }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      backgroundColor: "background.paper",
                      fontWeight: "bold",
                      width: "50px",
                    }}
                  ></TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      backgroundColor: "background.paper",
                      fontWeight: "bold",
                    }}
                  >
                    First Name
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      backgroundColor: "background.paper",
                      fontWeight: "bold",
                    }}
                  >
                    Last Name
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      backgroundColor: "background.paper",
                      fontWeight: "bold",
                      width: "30%",
                    }}
                  >
                    Email
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      backgroundColor: "background.paper",
                      fontWeight: "bold",
                    }}
                  >
                    Mobile
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      backgroundColor: "background.paper",
                      fontWeight: "bold",
                    }}
                  >
                    MS File Number
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <TableRow
                      key={contact.id}
                      sx={{ "& .MuiTableCell-root": { padding: "4px 6px" } }}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedParticipants.some(
                            (c) => c.id === contact.id
                          )}
                          onChange={() => toggleContactSelection(contact)}
                        />
                      </TableCell>
                      <TableCell>{contact.First_Name}</TableCell>
                      <TableCell>{contact.Last_Name}</TableCell>
                      <TableCell>{contact.Email}</TableCell>
                      <TableCell>{contact.Mobile}</TableCell>
                      <TableCell>{contact.ID_Number}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      sx={{
                        padding: "8px",
                        fontStyle: "italic",
                        fontSize: "9pt",
                      }}
                    >
                      No data found. Please try another search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box mt={3}>
            <Typography variant="h6">Selected Contacts:</Typography>
            <TableContainer>
              <Table
                size="small"
                sx={{ tableLayout: "fixed", fontSize: "9pt" }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ width: "50px", fontWeight: "bold" }}
                    ></TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      First Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Last Name</TableCell>
                    <TableCell sx={{ width: "30%", fontWeight: "bold" }}>
                      Email
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Mobile</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      MS File Number
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedParticipants.map((contact) => (
                    <TableRow
                      key={contact.id}
                      sx={{ "& .MuiTableCell-root": { padding: "4px 6px" } }}
                    >
                      <TableCell>
                        <Checkbox
                          checked
                          onChange={() => toggleContactSelection(contact)}
                        />
                      </TableCell>
                      <TableCell>{contact.First_Name}</TableCell>
                      <TableCell>{contact.Last_Name}</TableCell>
                      <TableCell>{contact.Email}</TableCell>
                      <TableCell>{contact.Mobile}</TableCell>
                      <TableCell>{contact.ID_Number}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCancel} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleOk}
            variant="contained"
            color="primary"
            disabled={selectedParticipants.length === 0}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
