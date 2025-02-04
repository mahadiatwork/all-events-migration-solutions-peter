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
  currentContact
}) {
  const [contacts, setContacts] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [searchType, setSearchType] = useState("First_Name");
  const [searchText, setSearchText] = useState("");
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const debounceTimer = useRef(null);

  const commonTextStyles = {
    fontSize: "9pt", // Uniform font size
    "& .MuiOutlinedInput-input": { fontSize: "9pt" }, // Input text
    "& .MuiInputBase-input": { fontSize: "9pt" }, // Base input text
    "& .MuiTypography-root": { fontSize: "9pt" }, // Typography text
    "& .MuiFormLabel-root": { fontSize: "9pt" }, // Form labels
  };

  useEffect(() => {
    const fetchParticipantsDetails = async () => {
      if (selectedRowData.Participants && ZOHO) {
        const participants = await Promise.all(
          selectedRowData.Participants.map(async (participant) => {
            try {
              const contactDetails = await ZOHO.CRM.API.getRecord({
                Entity: "Contacts",
                RecordID: participant.participant,
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
      }else{
        if(selectedParticipants.length === 0){
          setSelectedParticipants([{
            id: currentContact.id,
            First_Name: currentContact.First_Name || "N/A",
            Last_Name: currentContact.Last_Name || "N/A",
            Email: currentContact.Email || "No Email",
            Mobile: currentContact.Mobile || "N/A",
            Full_Name: `${currentContact.First_Name || "N/A"} ${
              currentContact.Last_Name || "N/A"
            }`,
            ID_Number: currentContact.ID_Number || "N/A",
          }])
        }
      }
    };

    fetchParticipantsDetails();
  }, [selectedRowData, ZOHO]);

  const handleOpen = () => {
    setFilteredContacts([]);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

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
          ID_Number: contact.ID_Number || "N/A",
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

  const toggleContactSelection = (contact) => {
    setSelectedParticipants((prev) =>
      prev.some((c) => c.id === contact.id)
        ? prev.filter((c) => c.id !== contact.id)
        : [...prev, contact]
    );
  };

  const handleOk = () => {
    const updatedParticipants = selectedParticipants.map((participant) => ({
      Full_Name:
        participant.Full_Name ||
        `${participant.First_Name} ${participant.Last_Name}`,
      Email: participant.Email,
      participant: participant.id,
      type: "contact",
    }));

    handleInputChange("scheduledWith", updatedParticipants);
    setIsModalOpen(false);
  };

  console.log({currentContact})

  return (
    <Box>
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
          sx={commonTextStyles}
        />
        <Button
          variant="contained"
          onClick={handleOpen}
          sx={{ width: "100px", ...commonTextStyles }}
        >
          Contacts
        </Button>
      </Box>

      <Dialog open={isModalOpen} onClose={handleCancel} fullWidth maxWidth="md">
        <DialogContent>
          <Box display="flex" gap={2} mb={2}>
            <TextField
              select
              label="Search By"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              fullWidth
              size="small"
              sx={{
                ...commonTextStyles,
                "& .MuiOutlinedInput-root": {
                  padding: "0rem", // Adjust padding for consistent height
                  lineHeight: "1.5", // Ensure consistent line height
                },
                "& .MuiSelect-select": {
                  display: "flex",
                  alignItems: "center", // Vertically align text
                },
              }}
            >
              <MenuItem value="First_Name" sx={{ fontSize: "9pt" }}>
                First Name
              </MenuItem>
              <MenuItem value="Last_Name" sx={{ fontSize: "9pt" }}>
                Last Name
              </MenuItem>
              <MenuItem value="Email" sx={{ fontSize: "9pt" }}>
                Email
              </MenuItem>
              <MenuItem value="Mobile" sx={{ fontSize: "9pt" }}>
                Mobile
              </MenuItem>
              <MenuItem value="ID_Number" sx={{ fontSize: "9pt" }}>
                MS File Number
              </MenuItem>
            </TextField>

            <TextField
              label="Search Text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              fullWidth
              size="small"
              sx={{
                ...commonTextStyles,
                "& .MuiOutlinedInput-root": {
                  padding: "0rem", // Match padding to the select field
                  lineHeight: "1.5", // Match line height
                },
              }}
            />

            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{ width: "150px", ...commonTextStyles }}
            >
              Search
            </Button>
          </Box>

          <TableContainer
            sx={{
              maxHeight: 300,
              overflowY: "auto",
            }}
          >
            <Table size="small" sx={{ tableLayout: "fixed", fontSize: "9pt" }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: "bold", width: "5%" }}
                  ></TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>First Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Last Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
                    Email
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Mobile</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    MS File Number
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
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
                    <TableCell colSpan={6} align="center">
                      No data found. Please try another search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box mt={3}>
            <Typography variant="h6" sx={{ ...commonTextStyles }}>
              Selected Contacts:
            </Typography>
            <TableContainer>
              <Table
                size="small"
                sx={{ tableLayout: "fixed", fontSize: "9pt" }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ fontWeight: "bold", width: "5%" }}
                    ></TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      First Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Last Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
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
                    <TableRow key={contact.id}>
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
          <Button
            onClick={handleCancel}
            variant="outlined"
            sx={commonTextStyles}
          >
            Cancel
          </Button>
          <Button
            onClick={handleOk}
            variant="contained"
            color="primary"
            disabled={selectedParticipants.length === 0}
            sx={commonTextStyles}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
