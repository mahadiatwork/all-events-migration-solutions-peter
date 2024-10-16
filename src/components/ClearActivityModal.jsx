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
  ZOHO,
}) {
  const calculateDuration = (durationInMinutes) => {
    if (!durationInMinutes) return "5 minutes";
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
  const [clearChecked, setClearChecked] = React.useState(false);
  const [eraseChecked, setEraseChecked] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [eventData, setEventData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
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
            setEventData(response.data[0]);
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
      setEventData(selectedRowData);
      setDuration(calculateDuration(selectedRowData?.duration));
    }
  }, [selectedRowData.meetingId, ZOHO, selectedRowData]);

  const handleSubmit = async(e) => {
    e.preventDefault();
    if(clearChecked){
      await ZOHO.CRM.API.getRecord({
        Entity: "Events", approved: "both", RecordID: selectedRowData?.id
       })
       .then(function(data){
           console.log(data)
       })
    }
    // console.log("Form Data:", formData);
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }
console.log({eventData})
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <DialogTitle id="modal-title">Clear Activity</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Typography variant="subtitle1">
            <strong>Type:</strong> {eventData?.Event_Title || selectedRowData?.type || "No Title"}
          </Typography>
          <TextField
            fullWidth
            label="Title"
            value={eventData?.Full_Description || selectedRowData?.regarding || ""}
            margin="dense"
            multiline
            disabled
            size="small"
            
          />
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
            value={
              eventData?.Participants?.join(", ") ||
              selectedRowData?.participants ||
              "Admin"
            }
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
            disabled
          />

          <FormGroup column style={{ marginTop: "10px" }}>
            <InputLabel id="duration-label">Duration</InputLabel>
            <Select
              labelId="duration-label"
              value={duration}
              size="small"
              onChange={(e) => setDuration(e.target.value)}
              sx={{ minWidth: 150 }}
              disabled
            >
              <MenuItem value="5 minutes">5 minutes</MenuItem>
              <MenuItem value="30 minutes">30 minutes</MenuItem>
              <MenuItem value="1 hour">1 hour</MenuItem>
              <MenuItem value="2 hours">2 hours</MenuItem>
            </Select>
          </FormGroup>
          <br />
          <Typography variant="subtitle1" style={{ marginTop: "10px" }}>
            Results:
          </Typography>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={clearChecked}
                  onChange={(e) => setClearChecked(e.target.checked)}
                />
              }
              label="Clear"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={eraseChecked}
                  onChange={(e) => setEraseChecked(e.target.checked)}
                />
              }
              label="Erase"
            />
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

          <FormControlLabel
            control={
              <Checkbox
                checked={addActivityToHistory}
                onChange={() =>
                  setAddActivityToHistory(!addActivityToHistory)
                }
              />
            }
            label="Add Activity Details to History"
            style={{ marginTop: "10px" }}
          />

          <TextField
            fullWidth
            label="Activity Details"
            value={eventData?.Description}
            margin="dense"
            multiline
            minRows={4}
            size="small"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button type="submit" color="primary" variant="contained">
            Update
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
