import React, { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
} from "@mui/material";

const RegardingField = ({ formData, handleInputChange }) => {
  const predefinedOptions = [
    "Hourly Consult $220",
    "Initial Consultation Fee $165",
    "No appointments today",
    "No appointments tonight",
  ]; // The predefined options

  const [selectedValue, setSelectedValue] = useState(formData.Regarding || "");
  const [manualInput, setManualInput] = useState("");

  useEffect(() => {
    // Check if the selected value is part of the predefined options
    if (selectedValue && !predefinedOptions.includes(selectedValue)) {
      setSelectedValue("Other"); // Set to "Other" if it doesn't match any predefined option
      setManualInput(formData.Regarding); // Populate manual input with the custom value
    }
  }, [selectedValue, formData.Regarding]);

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

  const commonTextStyles = {
    fontSize: "9pt", // Set the font size to 9pt
    "& .MuiOutlinedInput-input": { fontSize: "9pt" }, // For inputs
    "& .MuiInputBase-input": { fontSize: "9pt" }, // For select inputs
    "& .MuiTypography-root": { fontSize: "9pt" }, // For typography
    "& .MuiFormLabel-root": { fontSize: "9pt" }, // For labels
  };

  return (
    <Box sx={{ width: "100%" }}>
      <FormControl fullWidth size="small" sx={commonTextStyles}>
        <InputLabel id="regarding-label" sx={{ fontSize: "9pt" }}>
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
            ...commonTextStyles,
            "& .MuiOutlinedInput-root": { padding: 0 }, // Remove extra padding
            "& .MuiInputBase-input": {
              display: "flex",
              alignItems: "center", // Vertically align the content
            },
          }}
        >
          {predefinedOptions.map((option) => (
            <MenuItem key={option} value={option} sx={{ fontSize: "9pt" }}>
              {option}
            </MenuItem>
          ))}
          <MenuItem value="Other" sx={{ fontSize: "9pt" }}>
            Other (Manually enter)
          </MenuItem>
        </Select>
      </FormControl>

      {selectedValue === "Other" && (
        <TextField
          label="Enter your custom regarding"
          fullWidth
          size="small"
          value={manualInput}
          onChange={handleManualInputChange}
          sx={{
            mt: 2,
            ...commonTextStyles,
            "& .MuiOutlinedInput-root": { padding: 0 },
          }}
        />
      )}
    </Box>
  );
};

export default RegardingField;
