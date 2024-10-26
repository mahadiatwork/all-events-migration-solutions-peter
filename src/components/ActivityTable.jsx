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
  TablePagination,
} from "@mui/material";
import ClearActivityModal from "./ClearActivityModal";
import EditActivityModal from "./EditActivityModal";
import CreateActivityModal from "./CreateActivityModal";
import { subDays, startOfWeek, startOfMonth, addDays, isAfter } from "date-fns";

const CustomTableCell = ({ children, selectedRowIndex, index, ...props }) => {
  return (
    <TableCell
      sx={{
        color: selectedRowIndex === index ? "#FFFFFF" : "inherit",
      }}
      {...props}
    >
      {children}
    </TableCell>
  );
};

function createData(event, type) {
  let startDateTime, endDateTime, time, duration, scheduledFor;

  startDateTime = new Date(event.Start_DateTime);
  endDateTime = new Date(event.End_DateTime);
  time = startDateTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  duration = `${Math.round((endDateTime - startDateTime) / 60000)} minutes`;
  scheduledFor = event.Owner ? event.Owner.name : "Unknown";

  const date = startDateTime.toLocaleDateString();
  const priority = event.Event_Priority || "Low";
  const regarding = event.Regarding || "No Data";
  const associateWith = event.What_Id ? event.What_Id.name : "";
  const id = event.id;
  const title = event.Event_Title;
  const participants = event.Participants || []; // New Participants field

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
  };
}

export default function ScheduleTable({ events, ZOHO, users }) {
  const [selectedRowIndex, setSelectedRowIndex] = React.useState(null);
  const [openClearModal, setOpenClearModal] = React.useState(false);
  const [openEditModal, setOpenEditModal] = React.useState(false);
  const [selectedRowData, setSelectedRowData] = React.useState(null);
  const [openCreateModal, setOpenCreateModal] = React.useState(false);

  // Pagination state
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(12);

  // Combine events into one dataset
  const rows = [
    ...events.map((event) => createData(event, event.Type_of_Activity)),
  ];

   // Date Filter logic
   const filterDateOptions = [
    { label: "All", value: "All" },
    { label: "Last 7 Days", value: "Last 7 Days" },
    { label: "Last 30 Days", value: "Last 30 Days" },
    { label: "Last 90 Days", value: "Last 90 Days" },
    { label: "Current Week", value: "Current Week" },
    { label: "Current Month", value: "Current Month" },
    { label: "Next Week", value: "Next Week" },
  ];

  // Filter states
  const [filterDate, setFilterDate] = React.useState("All");
  const [filterType, setFilterType] = React.useState("All");
  const [filterPriority, setFilterPriority] = React.useState("All");
  const [filterUser, setFilterUser] = React.useState("All");

  // Filtered rows logic
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
        isAfter(rowDate, addDays(startOfWeek(new Date()), 7)));

    const matchesTypeFilter =
      filterType === "All" ||
      row.type.toLowerCase() === filterType.toLowerCase();
    const matchesPriorityFilter =
      filterPriority === "All" ||
      row.priority.toLowerCase() === filterPriority.toLowerCase();
    const matchesUserFilter =
      filterUser === "All" ||
      row.scheduledFor.toLowerCase() === filterUser.toLowerCase();

    return (
      matchesDateFilter &&
      matchesTypeFilter &&
      matchesPriorityFilter &&
      matchesUserFilter
    );
  });

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

    // Handle modal close
    const handleClose = () => {
      setOpenClearModal(false);
      setOpenEditModal(false);
      setOpenCreateModal(false); // Close the CreateActivityModal
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
            RecordID: row.id,
          });

          if (response && response.data) {
            setSelectedRowData(response.data[0]); // Setting the row data after successfully fetching event data
          }
          setOpenEditModal(true); // Open modal after data is fetched
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

   // Handle checkbox change to open the ClearActivityModal
   const handleCheckboxChange = (index, row) => {
    setSelectedRowIndex(index);
    if (row?.id) {
      async function getData() {
        try {
          const response = await ZOHO.CRM.API.getRecord({
            Entity: "Events",
            approved: "both",
            RecordID: row.id,
          });

          if (response && response.data) {
            setSelectedRowData(response.data[0]); // Setting the row data after successfully fetching event data
          }
          setOpenClearModal(true); // Open modal after data is fetched
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
      getData();
      return; // Exit the function if data is being fetched
    }

    // If no meetingId, just open the modal
    setSelectedRowData(row); // Directly set row data if no meetingId
    setOpenClearModal(true); // Open modal immediately
  };

  return (
    <>
      {/* Filters */}
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
              {[
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
              ].map((type) => (
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
              <MenuItem value="Medium">Medium</MenuItem>
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
            onClick={() => setOpenCreateModal(true)}
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
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Scheduled For</TableCell>
              <TableCell>Scheduled With</TableCell>
              <TableCell>Regarding</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Associate With</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    backgroundColor:
                      selectedRowIndex === index ? "#0072DC" : "transparent",
                    color: selectedRowIndex === index ? "#FFFFFF" : "inherit",
                  }}
                  onClick={() => handleRowClick(index, row)}
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
                  >
                    {row.title}
                  </CustomTableCell>
                  <CustomTableCell
                    selectedRowIndex={selectedRowIndex}
                    index={index}
                  >
                    {row.type}
                  </CustomTableCell>
                  <CustomTableCell
                    selectedRowIndex={selectedRowIndex}
                    index={index}
                  >
                    {row.date}
                  </CustomTableCell>
                  <CustomTableCell
                    selectedRowIndex={selectedRowIndex}
                    index={index}
                  >
                    {row.time}
                  </CustomTableCell>
                  <CustomTableCell
                    selectedRowIndex={selectedRowIndex}
                    index={index}
                  >
                    {row.priority}
                  </CustomTableCell>
                  <CustomTableCell
                    selectedRowIndex={selectedRowIndex}
                    index={index}
                  >
                    {row.scheduledFor}
                  </CustomTableCell>
                  <TableCell>
                    {/* Display participants */}
                    {row.participants.length > 0
                      ? row.participants.map((participant, i) => (
                          <a
                            key={i}
                            href={`https://crm.zoho.com.au/crm/org7004396182/tab/Contacts/${participant.participant}/canvas/76775000000287551`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color:
                                selectedRowIndex === index ? "#fff" : "#0072DC",
                              textDecoration: "underline",
                            }}
                          >
                            {participant.name}
                          </a>
                        ))
                      : "No Participants"}
                  </TableCell>
                  <CustomTableCell
                    selectedRowIndex={selectedRowIndex}
                    index={index}
                  >
                    {row.regarding}
                  </CustomTableCell>
                  <CustomTableCell
                    selectedRowIndex={selectedRowIndex}
                    index={index}
                  >
                    {row.duration}
                  </CustomTableCell>
                  <CustomTableCell
                    selectedRowIndex={selectedRowIndex}
                    index={index}
                  >
                    {row.associateWith}
                  </CustomTableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Component */}
      {filteredRows.length > 12 && (
        <TablePagination
          component="div"
          count={filteredRows.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

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
        />
      )}
    </>
  );
}
