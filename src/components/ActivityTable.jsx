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
  Typography,
} from "@mui/material";
import ClearActivityModal from "./ClearActivityModal";
import EditActivityModal from "./EditActivityModal"; // Import your EditActivityModal

// Function to create row data
function createData(
  type,
  date,
  time,
  priority,
  scheduledWith,
  regarding,
  duration,
  associateWith
) {
  return {
    type,
    date,
    time,
    priority,
    scheduledWith,
    regarding,
    duration,
    associateWith,
  };
}

// Example data based on your image and instructions
const initialRows = [
    createData(
      "To-Do",
      "11/09/2024",
      "5:46 PM",
      "Low",
      "Muhammad Azhar Aslam",
      "18/0383 Deadline reminder...",
      "5 minutes",
      ""
    ),
    createData(
      "Meeting",
      "11/09/2024",
      "11:30 AM",
      "Low",
      "Vanessa De Pretis",
      "No consults until 10am - WFH",
      "1 hour",
      "Migration Solutions[CMP]"
    ),
    createData(
      "To-Do",
      "9/09/2024",
      "1:00 PM",
      "Low",
      "Coralie Rossi",
      "Managers Meeting",
      "1 hour",
      "Savanna Energy Services[CMP]"
    ),
    createData(
      "Appointment",
      "9/09/2024",
      "None",
      "Low",
      "+Bo Dai",
      "18/1245 Deadline TODAY...",
      "5 minutes",
      ""
    ),
    createData(
      "Call",
      "08/09/2024",
      "3:30 PM",
      "High",
      "Tran Thi Ngoc Lan",
      "Customer follow-up for Q3 targets",
      "30 minutes",
      "Customer Services"
    ),
    createData(
      "Meeting",
      "06/09/2024",
      "2:00 PM",
      "High",
      "Susan Mulder",
      "Budget approval meeting for Q4",
      "2 hours",
      "Finance Department"
    ),
    createData(
      "Appointment",
      "07/09/2024",
      "10:00 AM",
      "Low",
      "Gaby Perez",
      "HR policy discussion and approval",
      "45 minutes",
      "HR Department"
    ),
    createData(
      "Call",
      "05/09/2024",
      "4:00 PM",
      "Low",
      "Coralie Rossi",
      "Follow-up call with client",
      "15 minutes",
      "Client Relations"
    ),
    createData(
      "To-Do",
      "10/09/2024",
      "9:00 AM",
      "High",
      "Nasir Uddin",
      "Prepare project report for board meeting",
      "2 hours",
      "Project Management"
    ),
    createData(
      "Call",
      "12/09/2024",
      "8:30 AM",
      "High",
      "Bo Dai",
      "Call with international partners for Q3 review",
      "1 hour",
      "International Relations"
    ),
  ];
  
  
  export default function ScheduleTable() {
    const [selectedRowIndex, setSelectedRowIndex] = React.useState(null);
    const [openClearModal, setOpenClearModal] = React.useState(false);
    const [openEditModal, setOpenEditModal] = React.useState(false);
    const [selectedRowData, setSelectedRowData] = React.useState(null);
    const [rows, setRows] = React.useState(initialRows);
  
    // Filter states
    const [filterDate, setFilterDate] = React.useState("Last 7 Days");
    const [filterType, setFilterType] = React.useState("All");
    const [filterPriority, setFilterPriority] = React.useState("All");
    const [filterUser, setFilterUser] = React.useState("All");
  
    // Handle checkbox change to open the ClearActivityModal
    const handleCheckboxChange = (index, row) => {
      setSelectedRowIndex(index);
      setSelectedRowData(row);
      setOpenClearModal(true);
    };
  
    // Handle row click to open the EditActivityModal
    const handleRowClick = (index, row) => {
      setSelectedRowIndex(index);
      setSelectedRowData(row);
      setOpenEditModal(true);
    };
  
    // Handle modal close
    const handleClose = () => {
      setOpenClearModal(false);
      setOpenEditModal(false);
    };
  
    // Filter the rows based on selected filters
    const filteredRows = rows.filter((row) => {
      const matchesDateFilter =
        filterDate === "Last 7 Days" || // Implement date filter logic here
        filterDate === "All";
      const matchesTypeFilter =
        filterType === "All" || row.type.toLowerCase() === filterType.toLowerCase();
      const matchesPriorityFilter =
        filterPriority === "All" ||
        row.priority.toLowerCase() === filterPriority.toLowerCase();
      const matchesUserFilter =
        filterUser === "All" || row.scheduledWith.toLowerCase() === filterUser.toLowerCase();
  
      return matchesDateFilter && matchesTypeFilter && matchesPriorityFilter && matchesUserFilter;
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
                <MenuItem value="Last 7 Days">Last 7 Days</MenuItem>
                <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
                <MenuItem value="Last 90 Days">Last 90 Days</MenuItem>
                <MenuItem value="Last Week">Last Week</MenuItem>
                <MenuItem value="Last Month">Last Month</MenuItem>
                <MenuItem value="Current Week">Current Week</MenuItem>
                <MenuItem value="Current Month">Current Month</MenuItem>
                <MenuItem value="Next Week">Next Week</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Type"
                size="small"
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="To-Do">To-Do</MenuItem>
                <MenuItem value="Meeting">Meeting</MenuItem>
                <MenuItem value="Appointment">Appointment</MenuItem>
                <MenuItem value="Call">Call</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={3}>
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
                <MenuItem value="Muhammad Azhar Aslam">Muhammad Azhar Aslam</MenuItem>
                <MenuItem value="Vanessa De Pretis">Vanessa De Pretis</MenuItem>
                <MenuItem value="Coralie Rossi">Coralie Rossi</MenuItem>
                <MenuItem value="Bo Dai">Bo Dai</MenuItem>
                <MenuItem value="Tran Thi Ngoc Lan">Tran Thi Ngoc Lan</MenuItem>
                <MenuItem value="Susan Mulder">Susan Mulder</MenuItem>
                <MenuItem value="Gaby Perez">Gaby Perez</MenuItem>
                <MenuItem value="Nasir Uddin">Nasir Uddin</MenuItem>
              </Select>
            </FormControl>
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
                  <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
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
        <ClearActivityModal
          open={openClearModal}
          handleClose={handleClose}
          selectedRowData={selectedRowData}
        />
  
        {/* Edit Activity Modal */}
        <EditActivityModal
          open={openEditModal}
          handleClose={handleClose}
          selectedRowData={selectedRowData}
        />
      </>
    );
  }
