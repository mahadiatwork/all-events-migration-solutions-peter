import {
  Autocomplete,
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid2 as Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import CustomTextField from "./atom/CustomTextField";
import ContactField from "./atom/ContactField";
import AccountField from "./atom/AccountField";
import { ChromePicker } from "react-color";
import { Datepicker } from "@mobiscroll/react";
import RegardingField from "./atom/RegardingField";

const parseDateString = (dateString) => {
  const [datePart, timePart, ampm] = dateString.split(" "); // Split date and time
  const [day, month, year] = datePart.split("/").map(Number); // Split date part
  let [hours, minutes] = timePart.split(":").map(Number); // Split time part

  // Convert 12-hour format to 24-hour format
  if (ampm === "PM" && hours < 12) {
    hours += 12;
  } else if (ampm === "AM" && hours === 12) {
    hours = 0; // Convert 12 AM to 00 hours
  }

  // Create a new Date object with the parsed values
  return new Date(year, month - 1, day, hours, minutes);
};

// Utility to format date
const formatTime = (date) => {
  const newDate = new Date(date);

  const year = newDate.getFullYear();
  const month = String(newDate.getMonth() + 1).padStart(2, "0");
  const day = String(newDate.getDate()).padStart(2, "0");

  // Convert to 12-hour format and determine AM/PM
  let hours = newDate.getHours();
  const minutes = String(newDate.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert 0 hours to 12 for AM

  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};

// Helper to calculate duration between two dates in minutes, rounded to the nearest 10
const calculateDuration = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const durationMinutes = (endDate - startDate) / (1000 * 60); // Convert milliseconds to minutes

  // Round to the nearest multiple of 10
  const roundedDuration = Math.round(durationMinutes / 10) * 10;

  return Math.max(10, Math.min(roundedDuration, 240)); // Clamp duration between 10 and 240
};

// Helper to calculate end date based on start date and duration in minutes
const calculateEndDate = (start, duration) => {
  const startDate = new Date(start);
  startDate.setMinutes(startDate.getMinutes() + duration);
  return startDate;
};

const FirstComponent = ({
  formData,
  handleInputChange,
  users,
  selectedRowData,
  ZOHO,
  isEditMode, // New prop to check if it's edit mode
}) => {
  const [activityType] = useState([
    { type: "Meeting", resource: 1 },
    { type: "To-Do", resource: 2 },
    { type: "Appointment", resource: 3 },
    { type: "Boardroom", resource: 4 },
    { type: "Call Billing", resource: 5 },
    { type: "Email Billing", resource: 6 },
    { type: "Initial Consultation", resource: 7 },
    { type: "Call", resource: 8 },
    { type: "Mail", resource: 9 },
    { type: "Meeting Billing", resource: 10 },
    { type: "Personal Activity", resource: 11 },
    { type: "Room 1", resource: 12 },
    { type: "Room 2", resource: 13 },
    { type: "Room 3", resource: 14 },
    { type: "To Do Billing", resource: 15 },
    { type: "Vacation", resource: 16 },
  ]);

  useEffect(() => {
    if (selectedRowData) {
      handleInputChange("Event_Title", selectedRowData.Event_Title || "");
      handleInputChange(
        "Type_of_Activity",
        selectedRowData.Type_of_Activity || ""
      );

      const formattedStart = selectedRowData.Start_DateTime
        ? formatTime(selectedRowData.Start_DateTime)
        : "";
      const formattedEnd = selectedRowData.End_DateTime
        ? formatTime(selectedRowData.End_DateTime)
        : "";

      handleInputChange("start", formattedStart || "");
      handleInputChange("end", formattedEnd || "");
      handleInputChange(
        "Duration_Min",
        calculateDuration(
          selectedRowData.Start_DateTime,
          selectedRowData.End_DateTime
        ) || ""
      );
      handleInputChange("Venue", selectedRowData.Venue || "");
      handleInputChange("priority", selectedRowData.Event_Priority || "");
      handleInputChange("ringAlarm", selectedRowData.ringAlarm || "");
      handleInputChange("Colour", selectedRowData.Colour || "#ff0000");
      handleInputChange("Banner", selectedRowData.Banner || false);

      // Find the corresponding user in the users array based on Owner's full_name
      const owner = users.find(
        (user) => user.full_name === selectedRowData.Owner?.name
      );
      if (owner) {
        handleInputChange("scheduleFor", owner); // Set the user object, not just the name
      } else {
        handleInputChange("scheduleFor", null); // Handle case where no matching user is found
      }

      // Populate scheduledWith
      handleInputChange(
        "scheduledWith",
        selectedRowData.Participants
          ? selectedRowData.Participants.map((participant) => ({
              name: participant.name,
              participant: participant.participant,
              type: participant.type,
            }))
          : []
      );
    }
  }, [selectedRowData, users]); // Ensure this runs when selectedRowData or users change

  const [openStartDatepicker, setOpenStartDatepicker] = useState(false);
  const [openEndDatepicker, setOpenEndDatepicker] = useState(false);
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [color, setColor] = useState(formData.Colour || "#ff0000");

  // Handle Banner checked logic
  const handleBannerChecked = (e) => {
    handleInputChange("Banner", e.target.checked);
    if (e.target.checked) {
      const now = new Date();
      const timeAt6AM = formatTime(now.setHours(6, 0));
      const timeAt7AM = formatTime(now.setHours(7, 0));

      handleInputChange("start", timeAt6AM);
      handleInputChange("end", timeAt7AM);
      handleInputChange("Duration_Min", 60);
    }
  };

  const handleActivityChange = (event) => {
    const selectedType = event.target.value;
    const selectedActivity = activityType.find(
      (item) => item.type === selectedType
    );
    if (selectedActivity) {
      handleInputChange("Type_of_Activity", selectedActivity.type);
      handleInputChange("resource", selectedActivity.resource);
    }
  };

  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  const handleColorChange = (newColor) => {
    setColor(newColor.hex);
    handleInputChange("Colour", newColor.hex);
  };

  // Custom input for datepicker
  const customInputComponent = (field, placeholder, openDatepickerState) => {
    return (
      <CustomTextField
        fullWidth
        size="small"
        placeholder={placeholder}
        variant="outlined"
        value={formData[field]} // Use formData
        onClick={() => openDatepickerState(true)}
        disabled={formData.Banner} // Disable if Banner is checked
      />
    );
  };

  // Handle input change for start date and calculate end date & duration
  const handleInputChangeWithEnd = (field, value) => {
    if (field === "start") {
      const startDate = new Date(value);
      let endDate = new Date(formData.end);
      // If there's no valid end date or it's before the start, set 1 hour later as default
      if (isNaN(endDate.getTime()) || endDate <= startDate) {
        endDate = calculateEndDate(startDate, 60);
      }
      const duration = calculateDuration(startDate, endDate);

      handleInputChange("start", formatTime(startDate));
      handleInputChange("end", formatTime(endDate));
      handleInputChange("Duration_Min", duration); // Auto-update duration
    } else if (field === "end") {
      const startDate = parseDateString(formData.start);
      const duration = calculateDuration(startDate, value);
      handleInputChange("end", formatTime(value));
      handleInputChange("Duration_Min", duration);
    } else if (field === "Duration_Min") {
      const startDate = parseDateString(formData.start);
      console.log({ start: formData.start });
      const newEndDate = calculateEndDate(startDate, value);
      handleInputChange("Duration_Min", value);
      handleInputChange("end", formatTime(newEndDate));
    } else {
      handleInputChange(field, value);
    }
  };

  const popover = {
    position: "absolute",
    zIndex: "2",
  };

  const cover = {
    position: "fixed",
    top: "0px",
    right: "0px",
    bottom: "0px",
    left: "0px",
  };

  const colorBoxStyle = {
    width: "20px",
    height: "20px",
    backgroundColor: color,
    border: "1px solid #ccc",
    display: "inline-block",
    cursor: "pointer",
    marginLeft: 1,
  };

  const commonStyles = {
    height: "40px",
    "& .MuiOutlinedInput-root": {
      height: "100%",
    },
    "& .MuiSelect-select, & .MuiAutocomplete-input": {
      padding: "8px 12px",
    },
  };

  console.log({ scheduleFor: formData?.Banner });

  return (
    <Box>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid size={12}>
          <CustomTextField
            fullWidth
            size="small"
            label="Event_Title"
            variant="outlined"
            value={formData.Event_Title} // Use formData
            onChange={(e) => handleInputChange("Event_Title", e.target.value)}
          />
        </Grid>

        <Grid size={12}>
          <FormControl fullWidth size="small" sx={commonStyles}>
            <InputLabel>Activity type</InputLabel>
            <Select
              label="Activity type"
              fullWidth
              value={formData.Type_of_Activity} // Use formData
              onChange={handleActivityChange}
            >
              {activityType.map((item, index) => (
                <MenuItem value={item.type} key={index}>
                  {item.type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={4}>
          <Datepicker
            controls={["calendar", "time"]}
            display="center"
            inputComponent={() =>
              customInputComponent(
                "start",
                "Start Time",
                setOpenStartDatepicker
              )
            }
            onClose={() => setOpenStartDatepicker(false)}
            onChange={(e) => handleInputChangeWithEnd("start", e.value)} // Auto-populate end date and duration
            isOpen={openStartDatepicker}
            touchUi={true}
          />
        </Grid>
        <Grid size={4}>
          <Datepicker
            controls={["calendar", "time"]}
            display="center"
            inputComponent={() =>
              customInputComponent("end", "End Time", setOpenEndDatepicker)
            }
            onClose={() => setOpenEndDatepicker(false)}
            onChange={(e) => handleInputChangeWithEnd("end", e.value)} // Calculate duration when end is updated
            isOpen={openEndDatepicker}
            disabled={formData.Banner} // Disable if Banner is checked
          />
        </Grid>
        <Grid size={4}>
          <FormControl fullWidth size="small" sx={commonStyles}>
            <InputLabel>Duration</InputLabel>
            <Select
              label="Duration"
              fullWidth
              value={formData.Duration_Min} // Use formData
              onChange={
                (e) => handleInputChangeWithEnd("Duration_Min", e.target.value) // Update end date when duration is changed
              }
              disabled={formData.Banner} // Disable if Banner is checked
            >
              {Array.from({ length: 24 }, (_, index) => {
                const minutes = (index + 1) * 10;
                return (
                  <MenuItem key={minutes} value={minutes}>
                    {minutes} minutes
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.Banner}
                onChange={handleBannerChecked}
              />
            }
            label="Banner/Timeless"
          />
        </Grid>
        <Grid size={12}>
          <ContactField
            value={formData.scheduledWith} // Use formData
            handleInputChange={handleInputChange}
            ZOHO={ZOHO}
            selectedRowData={selectedRowData}
          />
        </Grid>
        <Grid size={12}>
          <AccountField
            value={formData.associateWith} // Use formData
            handleInputChange={handleInputChange}
            ZOHO={ZOHO}
          />
        </Grid>
        <Grid size={12}>
          <RegardingField
            formData={formData}
            handleInputChange={handleInputChange}
          />
        </Grid>
        <Grid size={12}>
          <FormControl fullWidth size="small" sx={commonStyles}>
            <Autocomplete
              id="schedule-for-autocomplete"
              size="small"
              options={users} // Ensure users array is correctly passed
              getOptionLabel={(option) => option.full_name || ""} // Use full_name to display
              value={formData.scheduleFor || null} // Ensure it's an object, or null if not set
              onChange={(event, newValue) => {
                handleInputChange("scheduleFor", newValue || null); // Set the selected value
              }}
              renderInput={(params) => (
                <TextField
                  size="small"
                  {...params}
                  label="Schedule for ..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      padding: 0,
                    },
                    "& .MuiInputBase-input": {
                      padding: "3px 10px",
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                />
              )}
            />
          </FormControl>
        </Grid>
        <Grid size={3}>
          <FormControl fullWidth size="small" sx={commonStyles}>
            <InputLabel>Priority</InputLabel>
            <Select
              label="Priority"
              fullWidth
              value={formData.priority} // Use formData
              onChange={(e) => handleInputChange("priority", e.target.value)}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={3}>
          <FormControl fullWidth size="small" sx={commonStyles}>
            <InputLabel>Reminder</InputLabel>
            <Select
              label="Ring Alarm"
              fullWidth
              value={formData.ringAlarm} // Use formData
              onChange={(e) => handleInputChange("ringAlarm", e.target.value)}
            >
              <MenuItem value={0}>None</MenuItem>
              <MenuItem value={1}>At time of meeting</MenuItem>
              <MenuItem value={5}>5 minutes before</MenuItem>
              <MenuItem value={10}>10 minutes before</MenuItem>
              <MenuItem value={15}>15 minutes before</MenuItem>
              <MenuItem value={30}>30 minutes before</MenuItem>
              <MenuItem value={60}>1 hour before</MenuItem>
              <MenuItem value={120}>2 hours before</MenuItem>
              <MenuItem value={1440}>1 day before</MenuItem>
              <MenuItem value={2880}>2 days before</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={6}>
          <CustomTextField
            fullWidth
            size="small"
            placeholder="Location"
            variant="outlined"
            value={formData.Venue} // Use formData
            onChange={(e) => handleInputChange("Venue", e.target.value)}
          />
        </Grid>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={8}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.Create_Separate_Event_For_Each_Contact}
                  onChange={(e) =>
                    handleInputChange(
                      "Create_Separate_Event_For_Each_Contact",
                      e.target.checked
                    )
                  }
                  disabled={isEditMode} // Disable the checkbox in edit mode
                />
              }
              label="Create separate activity for each contact"
            />
          </Grid>

          <Grid item xs={6} sm={4} md={2} display="flex" alignItems="center">
            <Typography variant="body1" sx={{ mr: 1 }}>
              Colour:
            </Typography>
            <div style={colorBoxStyle} onClick={handleClick} />
            {displayColorPicker && (
              <div style={popover}>
                <div style={cover} onClick={handleClose} />
                <ChromePicker color={color} onChange={handleColorChange} />
              </div>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FirstComponent;
