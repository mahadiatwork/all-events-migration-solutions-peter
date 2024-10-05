import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
  } from "@mui/material";
  import React from "react";
  import { useState } from "react";
  
  const FirstComponent = ({ formData, handleInputChange }) => {
    const [activityType, setActivityType] = useState([
      "Meeting",
      "To-Do",
      "Appointment",
      "Boardroom",
      "Call Billing",
      "Email Billing",
      "Initial Consultation",
      "Call",
      "Mail",
      "Meeting Billing",
      "Personal Activity",
      "Room 1",
      "Room 2",
      "Room 3",
      "Todo Billing",
      "Vacation",
    ]);
    return (
      <Box>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel
                id="demo-simple-select-standard-label"
                sx={{ top: "-5px" }}
              >
                Activity type
              </InputLabel>
              <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                label="Activity type"
                fullWidth
                value={formData.title}
                onChange={(e) =>
                  handleInputChange("title", e.target.value)
                }
                MenuProps={{
                  PaperProps: {
                    style: {
                      zIndex: 1300, // Ensure dropdown is above the modal
                    },
                  },
                }}
                sx={{
                  "& .MuiSelect-select": {
                    padding: "3px 10px", // Adjust the padding to shrink the Select content
                  },
                  "& .MuiOutlinedInput-root": {
                    padding: 0, // Ensure no extra padding
                  },
                  "& .MuiInputBase-input": {
                    display: "flex",
                    alignItems: "center", // Align the content vertically
                  },
                }}
              >
                {activityType.map((item, index) => (
                  <MenuItem value={item} key={index}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Start Time"
              variant="outlined"
              value={formData.startTime}
              onChange={(e) => handleInputChange("startTime", e.target.value)}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="End Time"
              variant="outlined"
              value={formData.endTime}
              onChange={(e) => handleInputChange("endTime", e.target.value)}
            />
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth size="small">
              <InputLabel
                id="demo-simple-select-standard-label"
                sx={{ top: "-5px" }}
              >
                Duration
              </InputLabel>
              <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                label="Duration"
                fullWidth
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                sx={{
                  "& .MuiSelect-select": {
                    padding: "3px 10px", // Adjust the padding to shrink the Select content
                  },
                  "& .MuiOutlinedInput-root": {
                    padding: 0, // Ensure no extra padding
                  },
                  "& .MuiInputBase-input": {
                    display: "flex",
                    alignItems: "center", // Align the content vertically
                  },
                }}
              >
                <MenuItem value={10}>5 minutes</MenuItem>
                <MenuItem value={20}>10 minutes</MenuItem>
                <MenuItem value={30}>15 minutes</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              placeholder="Associate with"
              variant="outlined"
              value={formData.associateWith}
              onChange={(e) => handleInputChange("associateWith", e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              placeholder="Regarding"
              variant="outlined"
              value={formData.regarding}
              onChange={(e) => handleInputChange("regarding", e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              type="number"
              placeholder="Resources"
              variant="outlined"
              value={formData.resources}
              onChange={(e) => handleInputChange("resource", e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Location"
              variant="outlined"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
            />
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth size="small" sx={{ minHeight: "20px" }}>
              <InputLabel
                id="demo-simple-select-standard-label"
                sx={{ top: "-5px" }}
              >
                Priority
              </InputLabel>
              <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                label="Priority"
                fullWidth
                value={formData.priority}
                onChange={(e) => handleInputChange("priority", e.target.value)}
                sx={{
                  "& .MuiSelect-select": {
                    padding: "3px 10px", // Adjust the padding to shrink the Select content
                  },
                  "& .MuiOutlinedInput-root": {
                    padding: 0, // Ensure no extra padding
                  },
                  "& .MuiInputBase-input": {
                    display: "flex",
                    alignItems: "center", // Align the content vertically
                  },
                }}
              >
                <MenuItem value={10}>Low</MenuItem>
                <MenuItem value={20}>Medium</MenuItem>
                <MenuItem value={30}>High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth size="small">
              <InputLabel
                id="demo-simple-select-standard-label"
                sx={{ top: "-5px" }}
              >
                Ring Alarm
              </InputLabel>
              <Select
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                label="Ring Alarm"
                fullWidth
                value={formData.ringAlarm}
                onChange={(e) => handleInputChange("ringAlarm", e.target.value)}
                sx={{
                  "& .MuiSelect-select": {
                    padding: "3px 10px", // Adjust the padding to shrink the Select content
                  },
                  "& .MuiOutlinedInput-root": {
                    padding: 0, // Ensure no extra padding
                  },
                  "& .MuiInputBase-input": {
                    display: "flex",
                    alignItems: "center", // Align the content vertically
                  },
                }}
              >
                <MenuItem value={10}>5 minutes</MenuItem>
                <MenuItem value={20}>10 minutes</MenuItem>
                <MenuItem value={30}>15 minutes</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="contained"
              size="small"
              sx={{ bgcolor: "gray" }}
              fullWidth
            >
              Schedule for ...
            </Button>
          </Grid>
        </Grid>
  
        <FormControlLabel
          control={<Checkbox />}
          label="Create separate activity for each contact"
        />
      </Box>
    );
  };
  
  export default FirstComponent;
  