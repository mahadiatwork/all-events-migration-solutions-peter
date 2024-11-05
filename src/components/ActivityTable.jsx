import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Button,
  ListItemText,
} from "@mui/material";
import ClearActivityModal from "./ClearActivityModal";
import EditActivityModal from "./EditActivityModal";
import CreateActivityModal from "./CreateActivityModal";

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

const CustomTableCell = ({
  children,
  selectedRowIndex,
  index,
  row,
  highlightedRow,
  ...props
}) => {
  return (
    <TableCell
      sx={{
        color:
          highlightedRow === index
            ? "#FFFFFF"
            : selectedRowIndex === index
            ? "#FFFFFF"
            : row?.color || "black",
      }}
      {...props}
    >
      {children}
    </TableCell>
  );
};

function createData(event, type) {
  let startDateTime, endDateTime, time, duration, scheduledFor;

  try {
    startDateTime = event.Start_DateTime
      ? new Date(event.Start_DateTime)
      : new Date();
    endDateTime = event.End_DateTime
      ? new Date(event.End_DateTime)
      : new Date();
    time = startDateTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    duration = `${Math.round((endDateTime - startDateTime) / 60000)} minutes`;
    scheduledFor = event.Owner ? event.Owner.name : "Unknown";
  } catch (err) {
    console.error("Error processing event data", err);
  }

  const date = startDateTime ? startDateTime.toLocaleDateString() : "N/A";
  const priority = event.Event_Priority || "Low";
  const regarding = event.Regarding || "No Data";
  const associateWith = event.What_Id ? event.What_Id.name : "None";
  const id = event.id;
  const title = event.Event_Title || "Untitled Event";
  const participants = event.Participants || [];
  const color = event.Colour || "black";
  const Event_Status = event.Event_Status || "";
  return {
    title,
    type,
    date,
    time,
    priority,
    scheduledFor,
    participants,
    regarding,
    duration,
    associateWith,
    id,
    color,
    Event_Status,
  };
}

export default function ScheduleTable({
  events = [],
  ZOHO,
  users = [],
  filterDate,
  setFilterDate,
  loggedInUser,
  setEvents,
}) {
  const [selectedRowIndex, setSelectedRowIndex] = React.useState(null);
  const [highlightedRow, setHighlightedRow] = React.useState(null); // New state to manage highlighted row
  const [openClearModal, setOpenClearModal] = React.useState(false);
  const [openEditModal, setOpenEditModal] = React.useState(false);
  const [selectedRowData, setSelectedRowData] = React.useState(null);
  const [openCreateModal, setOpenCreateModal] = React.useState(false);

  const [filterType, setFilterType] = React.useState([]);
  const [filterPriority, setFilterPriority] = React.useState([]);
  const [filterUser, setFilterUser] = React.useState([]);

  const filterDateOptions = [
    { label: "All", value: "All" },
    { label: "Last 7 Days", value: "Last 7 Days" },
    { label: "Last 30 Days", value: "Last 30 Days" },
    { label: "Last 90 Days", value: "Last 90 Days" },
    { label: "Current Week", value: "Current Week" },
    { label: "Current Month", value: "Current Month" },
    { label: "Next Week", value: "Next Week" },
  ];

  const typeOptions = [
    "Meeting",
    "To-Do",
    "Call",
    "Appointment",
    "Boardroom",
    "Call Billing",
    "Email Billing",
    "Initial Consultation",
    "Mail",
    "Meeting Billing",
    "Personal Activity",
    "Room 1",
    "Room 2",
    "Room 3",
    "Todo Billing",
    "Vacation",
  ];

  const priorityOptions = ["Low", "Medium", "High"];

  const handleTypeChange = (event) => {
    const value = event.target.value;
    setFilterType(typeof value === "string" ? value.split(",") : value);
  };

  const handlePriorityChange = (event) => {
    const value = event.target.value;
    setFilterPriority(typeof value === "string" ? value.split(",") : value);
  };

  const handleUserChange = (event) => {
    const value = event.target.value;
    setFilterUser(typeof value === "string" ? value.split(",") : value);
  };

  const rows = Array.isArray(events)
    ? events.map((event) =>
        createData(event, event.Type_of_Activity || "Other")
      )
    : [];

  const filteredRows = rows.filter((row) => {
    const typeMatch = filterType.length === 0 || filterType.includes(row.type);
    const priorityMatch =
      filterPriority.length === 0 || filterPriority.includes(row.priority);
    const userMatch =
      filterUser.length === 0 ||
      filterUser.some((user) => row.scheduledFor.includes(user));

    return typeMatch && priorityMatch && userMatch;
  });

  const handleClose = () => {
    setOpenClearModal(false);
    setOpenEditModal(false);
    setOpenCreateModal(false);

    // Reset selectedRowIndex if the clear modal is closed to revert the text color
    if (selectedRowIndex !== null && !openClearModal) {
      setSelectedRowIndex(null);
    }
  };

  const handleRowClick = (index, row) => {
    if (highlightedRow === index) {
      setHighlightedRow(null); // Unhighlight if clicked again
      setSelectedRowIndex(null);
    } else {
      setHighlightedRow(index); // Highlight the new row and reset any previously highlighted rows
      setSelectedRowIndex(index);
    }
    setSelectedRowData(row);
  };
  

  const handleRowDoubleClick = async (index, row) => {
    setSelectedRowIndex(index);
    setHighlightedRow(index); // Keep the row highlighted on double click
    if (row?.id) {
      try {
        const response = await ZOHO.CRM.API.getRecord({
          Entity: "Events",
          approved: "both",
          RecordID: row.id,
        });

        if (response && response.data) {
          setSelectedRowData(response.data[0]);
        }
        setOpenEditModal(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  const handleCheckboxChange = (index, row) => {
    setSelectedRowIndex(index);
    setHighlightedRow(index); // Highlight the new row and reset any previously highlighted rows
    if (row?.id) {
      async function getData() {
        try {
          const response = await ZOHO.CRM.API.getRecord({
            Entity: "Events",
            approved: "both",
            RecordID: row.id,
          });
  
          if (response && response.data) {
            setSelectedRowData(response.data[0]);
          }
          setOpenClearModal(true);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
      getData();
      return;
    }
    setSelectedRowData(row);
    setOpenClearModal(true);
  };
  

  return (
    <>
      {/* Filters */}
      <Grid
        container
        spacing={2}
        style={{
          marginTop: 20,
          marginBottom: 20,
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "white",
          overflowY: "hidden",
        }}
      >
        <Grid item xs={3}>
          <FormControl fullWidth>
            <InputLabel>Date</InputLabel>
            <Select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              label="Date"
              size="small"
            >
              {filterDateOptions.map((option, index) => (
                <MenuItem key={index} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={2}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              multiple
              value={filterType}
              onChange={handleTypeChange}
              label="Type"
              size="small"
              renderValue={(selected) => selected.join(", ")}
            >
              {typeOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  <Checkbox checked={filterType.indexOf(type) > -1} />
                  <ListItemText primary={type} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={2}>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              multiple
              value={filterPriority}
              onChange={handlePriorityChange}
              label="Priority"
              size="small"
              renderValue={(selected) => selected.join(", ")}
            >
              {priorityOptions.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  <Checkbox checked={filterPriority.indexOf(priority) > -1} />
                  <ListItemText primary={priority} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={3}>
          <FormControl fullWidth>
            <InputLabel>User</InputLabel>
            <Select
              multiple
              value={filterUser}
              onChange={handleUserChange}
              label="User"
              size="small"
              renderValue={(selected) => selected.join(", ")}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.full_name}>
                  <Checkbox checked={filterUser.indexOf(user.full_name) > -1} />
                  <ListItemText primary={user.full_name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={2}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => setOpenCreateModal(true)}
          >
            Create New Event
          </Button>
        </Grid>
      </Grid>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{ maxHeight: "100vh", overflowY: "auto" }}
      >
        <Table stickyHeader sx={{ minWidth: 650 }} aria-label="schedule table">
          <TableHead>
            <TableRow>
              <TableCell
                padding="checkbox"
                sx={{ bgcolor: "#efefef", fontWeight: "bold" }}
              >
                Select
              </TableCell>
              <TableCell sx={{ bgcolor: "#efefef", fontWeight: "bold" }}>
                Title
              </TableCell>
              <TableCell sx={{ bgcolor: "#efefef", fontWeight: "bold" }}>
                Type
              </TableCell>
              <TableCell sx={{ bgcolor: "#efefef", fontWeight: "bold" }}>
                Date
              </TableCell>
              <TableCell sx={{ bgcolor: "#efefef", fontWeight: "bold" }}>
                Time
              </TableCell>
              <TableCell sx={{ bgcolor: "#efefef", fontWeight: "bold" }}>
                Priority
              </TableCell>
              <TableCell sx={{ bgcolor: "#efefef", fontWeight: "bold" }}>
                Scheduled For
              </TableCell>
              <TableCell sx={{ bgcolor: "#efefef", fontWeight: "bold" }}>
                Scheduled With
              </TableCell>
              <TableCell sx={{ bgcolor: "#efefef", fontWeight: "bold" }}>
                Regarding
              </TableCell>
              <TableCell sx={{ bgcolor: "#efefef", fontWeight: "bold" }}>
                Duration
              </TableCell>
              <TableCell sx={{ bgcolor: "#efefef", fontWeight: "bold" }}>
                Associate With
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  No events found
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    backgroundColor:
                      highlightedRow === index ||
                      (selectedRowIndex === index && openClearModal)
                        ? "#0072DC" // Highlighted color when selected or when clearing is active
                        : index % 2 === 0
                        ? "white" // Original color for even rows
                        : "#f9f9f9", // Original color for odd rows
                    color:
                      highlightedRow === index ||
                      (selectedRowIndex === index && openClearModal)
                        ? "#FFFFFF" // Text color when highlighted or clearing is active
                        : "inherit",
                    position: "relative",
                    textDecoration:
                      row.Event_Status === "Closed" ? "line-through" : "none",
                    cursor: "pointer", // Add pointer cursor for better UX
                  }}
                  onClick={() => handleRowClick(index, row)}
                  onDoubleClick={() => handleRowDoubleClick(index, row)}
                >
                  <TableCell
                    padding="checkbox"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={selectedRowIndex === index && openClearModal}
                      onChange={() => handleCheckboxChange(index, row)}
                      sx={{
                        color: selectedRowIndex === index ? "#fff" : "inherit",
                      }}
                    />
                  </TableCell>
                  <CustomTableCell
                    selectedRowIndex={selectedRowIndex}
                    index={index}
                    row={row}
                    highlightedRow={highlightedRow}
                  >
                    {row.title}
                  </CustomTableCell>
                  <CustomTableCell
                    selectedRowIndex={selectedRowIndex}
                    index={index}
                    row={row}
                    highlightedRow={highlightedRow}
                  >
                    {row.type}
                  </CustomTableCell>
                  <CustomTableCell
                    selectedRowIndex={selectedRowIndex}
                    index={index}
                    row={row}
                    highlightedRow={highlightedRow}
                  >
                    {formatDate(row.date)}
                  </CustomTableCell>
                  <CustomTableCell
                    selectedRowIndex={selectedRowIndex}
                    index={index}
                    row={row}
                    highlightedRow={highlightedRow}
                  >
                    {row.time}
                  </CustomTableCell>
                  <CustomTableCell
                    selectedRowIndex={selectedRowIndex}
                    index={index}
                    row={row}
                    highlightedRow={highlightedRow}
                  >
                    {row.priority}
                  </CustomTableCell>
                  <CustomTableCell
                    selectedRowIndex={selectedRowIndex}
                    index={index}
                    row={row}
                    highlightedRow={highlightedRow}
                  >
                    {row.scheduledFor}
                  </CustomTableCell>
                  <TableCell>
                    {row.participants.length > 0
                      ? row.participants.map((participant, i) => (
                          <React.Fragment key={i}>
                            <a
                              href={`https://crm.zoho.com.au/crm/org7004396182/tab/Contacts/${participant.participant}/canvas/76775000000287551`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color:
                                  selectedRowIndex === index
                                    ? "#fff"
                                    : "#0072DC",
                                textDecoration: "underline",
                              }}
                            >
                              {participant.name}
                            </a>
                            {i < row.participants.length - 1 && ", "}{" "}
                            {/* Add a comma if it's not the last item */}
                          </React.Fragment>
                        ))
                      : "No Participants"}
                  </TableCell>
                  <CustomTableCell
                    selectedRowIndex={selectedRowIndex}
                    index={index}
                    row={row}
                    highlightedRow={highlightedRow}
                  >
                    {row.regarding}
                  </CustomTableCell>
                  <CustomTableCell
                    selectedRowIndex={selectedRowIndex}
                    index={index}
                    row={row}
                    highlightedRow={highlightedRow}
                  >
                    {row.duration}
                  </CustomTableCell>
                  <CustomTableCell
                    selectedRowIndex={selectedRowIndex}
                    index={index}
                    row={row}
                    highlightedRow={highlightedRow}
                  >
                    {row.associateWith}
                  </CustomTableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modals */}
      {openClearModal && (
        <ClearActivityModal
          open={openClearModal}
          handleClose={handleClose}
          selectedRowData={selectedRowData}
          ZOHO={ZOHO}
          users={users}
        />
      )}

      {openEditModal && (
        <EditActivityModal
          open={openEditModal}
          handleClose={handleClose}
          selectedRowData={selectedRowData}
          ZOHO={ZOHO}
          users={users}
        />
      )}

      {openCreateModal && (
        <CreateActivityModal
          open={openCreateModal}
          handleClose={handleClose}
          ZOHO={ZOHO}
          users={users}
          loggedInUser={loggedInUser}
          setEvents={setEvents}
        />
      )}
    </>
  );
}
