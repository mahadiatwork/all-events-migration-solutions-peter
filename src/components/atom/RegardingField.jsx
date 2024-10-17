import React, { useState } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
} from "@mui/material";

const RegardingField = ({ handleInputChange }) => {
  const [selectedValue, setSelectedValue] = useState("");
  const [manualInput, setManualInput] = useState("");

  const handleSelectChange = (event) => {
    const value = event.target.value;
    setSelectedValue(value);
    if (value !== "Other") {
      setManualInput(""); // Clear manual input if predefined option is selected
      handleInputChange("Regarding", value); // Pass the selected value to handleInputChange
    }
  };

  const handleManualInputChange = (event) => {
    const value = event.target.value;
    setManualInput(value);
    handleInputChange("Regarding", value); // Pass the manual input value to handleInputChange
  };

  return (
    <Box sx={{ width: "100%" }}>
      <FormControl fullWidth size="small">
        <InputLabel id="regarding-label" sx={{ top: "-5px" }}>
          Regarding
        </InputLabel>
        <Select
          labelId="regarding-label"
          id="regarding-select"
          label="Regarding"
          fullWidth
          size="small"
          value={selectedValue}
          onChange={handleSelectChange}
          sx={{
            "& .MuiOutlinedInput-root": {
              padding: 0, // Remove extra padding from the select input
            },
            "& .MuiInputBase-input": {
              display: "flex",
              alignItems: "center", // Vertically align the content
            },
          }}
        >
          <MenuItem value={"Hourly Consult $220"}>Hourly Consult $220</MenuItem>
          <MenuItem value={"Initial Consultation Fee $165"}>
            Initial Consultation Fee $165
          </MenuItem>
          <MenuItem value={"No appointments today"}>
            No appointments today
          </MenuItem>
          <MenuItem value={"No appointments tonight"}>
            No appointments tonight
          </MenuItem>
          <MenuItem value={"Other"}>Other (Manually enter)</MenuItem>
        </Select>
      </FormControl>

      {selectedValue === "Other" && (
        <TextField
          label="Enter your custom regarding"
          fullWidth
          size="small"
          value={manualInput}
          onChange={handleManualInputChange}
          sx={{ mt: 2, "& .MuiOutlinedInput-root": { padding: 0 } }}
        />
      )}
    </Box>
  );
};

export default RegardingField;
