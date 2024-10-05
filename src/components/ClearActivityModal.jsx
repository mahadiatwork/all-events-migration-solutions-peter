import * as React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  InputLabel,
  Typography,
  CircularProgress,
} from "@mui/material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function ClearActivityModal({
  open,
  handleClose,
  selectedRowData,
  ZOHO
}) {
  // Convert the duration from minutes
  const calculateDuration = (durationInMinutes) => {
    if (!durationInMinutes) return "5 minutes"; // Default value
    const minutes = parseInt(durationInMinutes, 10);
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    }
  };

  const [duration, setDuration] = React.useState(
    calculateDuration(selectedRowData?.duration)
  );
  const [result, setResult] = React.useState("To-do Done");
  const [addActivityToHistory, setAddActivityToHistory] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [eventData, setEventData] = React.useState(null);
  const [loading, setLoading] = React.useState(false); // Loading state

  React.useEffect(() => {
    // If meetingId is present, fetch data, else use selectedRowData
    if (selectedRowData?.meetingId) {
      async function getData() {
        setLoading(true);
        try {
          const response = await ZOHO.CRM.API.getRecord({
            Entity: "Events",
            approved: "both",
            RecordID: selectedRowData.meetingId,
          });
          if (response && response.data) {
            setEventData(response.data[0]); // Assume data comes in an array and use the first item
            setDuration(calculateDuration(response.data[0].duration));
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      }
      getData();
    } else {
      // If no meetingId, use selectedRowData directly
      setEventData(selectedRowData);
      setDuration(calculateDuration(selectedRowData?.duration));
    }
  }, [selectedRowData.meetingId, ZOHO, selectedRowData]);

  // Show loading spinner if data is still being fetched
  if (loading) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <DialogTitle id="modal-title">Clear Activity</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1">
          <strong>Type:</strong> {eventData?.Event_Title || selectedRowData?.type || "No Title"}
        </Typography>
        <TextField
          fullWidth
          label="Organiser"
          value={eventData?.Owner?.name || selectedRowData?.scheduledWith || ""}
          margin="dense"
          size="small"
          disabled
        />
        <TextField
          fullWidth
          label="Participants"
          value={eventData?.Participants?.join(", ") || selectedRowData?.participants || "Admin"} // Fallback value if participants not available
          margin="dense"
          size="small"
          disabled
        />
        <TextField
          fullWidth
          label="Associate With"
          value={eventData?.What_Id || selectedRowData?.associateWith || ""}
          margin="dense"
          size="small"
        />

        {/* Duration Select */}
        <FormGroup column style={{ marginTop: "10px" }}>
          <InputLabel id="duration-label">Duration</InputLabel>
          <Select
            labelId="duration-label"
            value={duration}
            size="small"
            onChange={(e) => setDuration(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="5 minutes">5 minutes</MenuItem>
            <MenuItem value="30 minutes">30 minutes</MenuItem>
            <MenuItem value="1 hour">1 hour</MenuItem>
            <MenuItem value="2 hours">2 hours</MenuItem>
          </Select>
        </FormGroup>
        <br />
        <TextField
          fullWidth
          label="Regarding"
          value={eventData?.Full_Description || selectedRowData?.regarding || ""}
          margin="dense"
          multiline
          disabled
          size="small"
        />

        {/* Results Section */}
        <Typography variant="subtitle1" style={{ marginTop: "10px" }}>
          Results:
        </Typography>
        <FormGroup row>
          <FormControlLabel control={<Checkbox />} label="Clear" />
          <FormControlLabel control={<Checkbox />} label="Erase" />
          <Select
            value={result}
            onChange={(e) => setResult(e.target.value)}
            sx={{ marginLeft: 2, minWidth: 150 }}
            size="small"
          >
            <MenuItem value="To-do Done">To-do Done</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
          </Select>
        </FormGroup>

        {/* Add to History Checkbox */}
        <FormControlLabel
          control={
            <Checkbox
              checked={addActivityToHistory}
              onChange={() => setAddActivityToHistory(!addActivityToHistory)}
            />
          }
          label="Add Activity Details to History"
          style={{ marginTop: "10px" }}
        />

        {/* Details Text Area */}
        <ReactQuill
          theme="snow"
          value={value}
          onChange={setValue}
          style={{ height: 230, marginBottom: 40 }}
        />
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleClose} color="primary" variant="contained">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
