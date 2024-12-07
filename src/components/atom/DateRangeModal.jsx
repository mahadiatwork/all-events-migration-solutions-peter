import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

const DateRangeDialog = ({ open, onClose, onSave }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSave = () => {
    if (startDate && endDate) {
      onSave({ startDate, endDate });
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm" // Set dialog max width
      fullWidth // Make dialog width responsive
    >
      {/* <DialogTitle>Select Date Range</DialogTitle> */}
      <DialogContent>
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ mb: 3 }} // Add margin below
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ mb: 3 }} // Add margin below
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={!startDate || !endDate}
        >
          Search
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DateRangeDialog;
