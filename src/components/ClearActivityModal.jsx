import * as React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
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
} from "@mui/material";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function ClearActivityModal({
  open,
  handleClose,
  selectedRowData,
}) {
  const [duration, setDuration] = React.useState("5 minutes");
  const [result, setResult] = React.useState("To-do Done");
  const [addActivityToHistory, setAddActivityToHistory] = React.useState(false);
  const [value, setValue] = React.useState('');

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
          <strong>Type:</strong> {selectedRowData?.type}
        </Typography>
        <TextField
          fullWidth
          label="Organiser"
          value={selectedRowData?.scheduledWith || ""}
          margin="dense"
          size="small"
          disabled
        />
        <TextField
          fullWidth
          label="Participants"
          value={
            selectedRowData?.participants ||
            "Muhammad Azhar Aslam, Vanessa De Pretis"
          }
          margin="dense"
          size="small"
          disabled
        />
        <TextField
          fullWidth
          label="Associate With"
          value={selectedRowData?.associateWith || ""}
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
            <MenuItem value="1 hour">1 hour</MenuItem>
            <MenuItem value="30 minutes">30 minutes</MenuItem>
          </Select>
        </FormGroup>
        <br />
        <TextField
          fullWidth
          label="Regarding"
          value={selectedRowData?.regarding || ""}
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
        <ReactQuill theme="snow" value={value} onChange={setValue} />
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
