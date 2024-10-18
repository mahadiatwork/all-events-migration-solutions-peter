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
} from "@mui/material";
import ClearActivityModal from "./ClearActivityModal";
import EditActivityModal from "./EditActivityModal";
import {
  subDays,
  startOfWeek,
  startOfMonth,
  addDays,
  isAfter,
  isBefore,
} from "date-fns";

// Function to create row data for To-Do, Meeting, and Call
function createData(event, type) {
  let startDateTime, endDateTime, time, duration, scheduledWith;

  if (type === "Meeting") {
    startDateTime = new Date(event.Start_DateTime);
    endDateTime = new Date(event.End_DateTime);
    time = startDateTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    duration = `${Math.round((endDateTime - startDateTime) / 60000)} minutes`;
    scheduledWith = event.Owner ? event.Owner.name : "Unknown";
  } else if (type === "To-Do") {
    startDateTime = new Date(event.Due_Date);
    time = "None"; // To-Do doesn't have time field
    duration = "N/A";
    scheduledWith = event.Owner ? event.Owner.name : "Unknown";
  } else if (type === "Call") {
    startDateTime = new Date(event.Call_Start_Time);
    time = startDateTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    duration = event.Call_Duration || "N/A";
    scheduledWith = event.Who_Id ? event.Who_Id.name : "Unknown";
  }

  const date = startDateTime.toLocaleDateString();
  const priority = event.Priority || "Low";
  const regarding =
    type === "Meeting"
      ? event.Event_Title || "No Title"
      : type === "To-Do"
      ? event.Subject || "No Subject"
      : type === "Call"
      ? event.Subject || "No Subject"
      : "No Info";
  const associateWith = event.What_Id ? event.What_Id.name : "";
  const id = event.id;

  return {
    type,
    date,
    time,
    priority,
    scheduledWith,
    regarding,
    duration,
    associateWith,
    id,
  };
}

export default function ScheduleTable({ events, ZOHO, users }) {
  const [selectedRowIndex, setSelectedRowIndex] = React.useState(null);
  const [openClearModal, setOpenClearModal] = React.useState(false);
  const [openEditModal, setOpenEditModal] = React.useState(false);
  const [selectedRowData, setSelectedRowData] = React.useState(null);

  // Combine events, todo, and calls into one dataset
  const rows = [
    ...events.map((event) => createData(event, "Meeting")),
  ];

  // Get the min and max dates from the events, todo, and calls
  const allDates = [...events];
  const maxDate =
    allDates.length > 0 ? new Date(Math.max(...allDates)) : new Date();

  // Filter states
  const [filterDate, setFilterDate] = React.useState("All");
  const [filterType, setFilterType] = React.useState("All");
  const [filterPriority, setFilterPriority] = React.useState("All");
  const [filterUser, setFilterUser] = React.useState("All");

  // Handle checkbox change to open the ClearActivityModal
  const handleCheckboxChange = (index, row) => {
    setSelectedRowIndex(index);
    if (row?.id) {
      async function getData() {
        try {
          const response = await ZOHO.CRM.API.getRecord({
            Entity: "Events",
            approved: "both",
            RecordID: row.id,   // Corrected to use row.meetingId instead of selectedRowData.meetingId
          });
  
          if (response && response.data) {
            setSelectedRowData(response.data[0]);  // Setting the row data after successfully fetching event data
          }
          setOpenClearModal(true);    // Open modal after data is fetched
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
      getData();
      return; // Exit the function if data is being fetched
    }
  
    // If no meetingId, just open the modal
    setSelectedRowData(row);  // Directly set row data if no meetingId
    setOpenClearModal(true);  // Open modal immediately
  };
  
  

  // Handle row click to open the EditActivityModal
  const handleRowClick = (index, row) => {
    setSelectedRowIndex(index);
    if (row?.id) {
      async function getData() {
        try {
          const response = await ZOHO.CRM.API.getRecord({
            Entity: "Events",
            approved: "both",
            RecordID: row.id,   // Corrected to use row.meetingId instead of selectedRowData.meetingId
          });
  
          if (response && response.data) {
            setSelectedRowData(response.data[0]);  // Setting the row data after successfully fetching event data
          }
          setOpenEditModal(true);    // Open modal after data is fetched
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
      getData();
      return; // Exit the function if data is being fetched
    }
    setSelectedRowData(row);
    setOpenEditModal(true);
  };

  // Handle modal close
  const handleClose = () => {
    setOpenClearModal(false);
    setOpenEditModal(false);
  };

  // Date Filter logic
  const filterDateOptions = [
    { label: "All", value: "All" },
    { label: "Last 7 Days", value: "Last 7 Days" },
    { label: "Last 30 Days", value: "Last 30 Days" },
    { label: "Last 90 Days", value: "Last 90 Days" },
    { label: "Last Week", value: "Last Week" },
    { label: "Last Month", value: "Last Month" },
    { label: "Current Week", value: "Current Week" },
    { label: "Current Month", value: "Current Month" },
    { label: "Next Week", value: "Next Week" },
  ];

  // Filter the rows based on selected filters
  const filteredRows = rows.filter((row) => {
    const rowDate = new Date(row.date);
    const matchesDateFilter =
      filterDate === "All" ||
      (filterDate === "Last 7 Days" &&
        isAfter(rowDate, subDays(new Date(), 7))) ||
      (filterDate === "Last 30 Days" &&
        isAfter(rowDate, subDays(new Date(), 30))) ||
      (filterDate === "Last 90 Days" &&
        isAfter(rowDate, subDays(new Date(), 90))) ||
      (filterDate === "Current Week" &&
        isAfter(rowDate, startOfWeek(new Date()))) ||
      (filterDate === "Current Month" &&
        isAfter(rowDate, startOfMonth(new Date()))) ||
      (filterDate === "Next Week" &&
        isAfter(rowDate, addDays(startOfWeek(new Date()), 7))) ||
      (filterDate === "Last Week" &&
        isAfter(rowDate, subDays(startOfWeek(new Date()), 7))) ||
      (filterDate === "Last Month" &&
        isAfter(rowDate, subDays(startOfMonth(new Date()), 30)));

    const matchesTypeFilter =
      filterType === "All" ||
      row.type.toLowerCase() === filterType.toLowerCase();
    const matchesPriorityFilter =
      filterPriority === "All" ||
      row.priority.toLowerCase() === filterPriority.toLowerCase();
    const matchesUserFilter =
      filterUser === "All" ||
      row.scheduledWith.toLowerCase() === filterUser.toLowerCase();

    return (
      matchesDateFilter &&
      matchesTypeFilter &&
      matchesPriorityFilter &&
      matchesUserFilter
    );
  });


  return (
    <>
      {/* Filter Row */}
      <Grid container spacing={2} style={{ marginTop: 20, marginBottom: 20 }}>
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
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Type"
              size="small"
            >
              <MenuItem value="All">All</MenuItem>
              {["Meeting", "To-Do", "Call"].map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={2}>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              label="Priority"
              size="small"
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <InputLabel>User</InputLabel>
            <Select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              label="User"
              size="small"
            >
              <MenuItem value="All">All</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.full_name}>
                  {user.full_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => setOpenEditModal(true)}
          >
            Create New Event
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="schedule table">
          <TableHead sx={{ backgroundColor: "#F2F2F2" }}>
            <TableRow>
              <TableCell padding="checkbox">Select</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Scheduled With</TableCell>
              <TableCell>Regarding</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Associate With</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row, index) => (
              <TableRow
                key={index}
                sx={{
                  backgroundColor:
                    selectedRowIndex === index ? "#0072DC" : "transparent",
                  color: selectedRowIndex === index ? "#FFFFFF" : "inherit",
                }}
                onClick={() => handleRowClick(index, row)} // Handle row click here
              >
                <TableCell
                  padding="checkbox"
                  onClick={(e) => e.stopPropagation()} // Prevent checkbox from triggering row click
                >
                  <Checkbox
                    checked={selectedRowIndex === index && openClearModal}
                    onChange={() => handleCheckboxChange(index, row)} // Handle checkbox click here
                    sx={{
                      color: selectedRowIndex === index ? "#FFFFFF" : "inherit",
                    }}
                  />
                </TableCell>
                <TableCell
                  sx={{
                    color: selectedRowIndex === index ? "#FFFFFF" : "inherit",
                  }}
                >
                  {row.type}
                </TableCell>
                <TableCell
                  sx={{
                    color: selectedRowIndex === index ? "#FFFFFF" : "inherit",
                  }}
                >
                  {row.date}
                </TableCell>
                <TableCell
                  sx={{
                    color: selectedRowIndex === index ? "#FFFFFF" : "inherit",
                  }}
                >
                  {row.time}
                </TableCell>
                <TableCell
                  style={{ color: row.priority === "Low" ? "red" : "black" }}
                >
                  {row.priority}
                </TableCell>
                <TableCell
                  sx={{
                    color: selectedRowIndex === index ? "#FFFFFF" : "inherit",
                  }}
                >
                  {row.scheduledWith}
                </TableCell>
                <TableCell
                  sx={{
                    color: selectedRowIndex === index ? "#FFFFFF" : "inherit",
                  }}
                >
                  {row.regarding}
                </TableCell>
                <TableCell
                  sx={{
                    color: selectedRowIndex === index ? "#FFFFFF" : "inherit",
                  }}
                >
                  {row.duration}
                </TableCell>
                <TableCell
                  sx={{
                    color: selectedRowIndex === index ? "#FFFFFF" : "inherit",
                  }}
                >
                  {row.associateWith}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Clear Activity Modal */}
      {openClearModal && (
        <ClearActivityModal
          open={openClearModal}
          handleClose={handleClose}
          selectedRowData={selectedRowData}
          ZOHO={ZOHO}
          users={users}
        />
      )}

      {/* Edit Activity Modal */}
      {openEditModal && (
        <EditActivityModal
          open={openEditModal}
          handleClose={handleClose}
          selectedRowData={selectedRowData}
          ZOHO={ZOHO}
          users={users}
        />
      )}
    </>
  );
}
