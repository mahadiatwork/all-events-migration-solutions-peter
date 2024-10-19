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

const formatTime = (date, hour) => {
  const newDate = new Date(date);
  newDate.setHours(hour, 0, 0, 0);
  const year = newDate.getFullYear();
  const month = String(newDate.getMonth() + 1).padStart(2, "0");
  const day = String(newDate.getDate()).padStart(2, "0");
  const hours = String(newDate.getHours()).padStart(2, "0");
  const minutes = String(newDate.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const FirstComponent = ({
  formData,
  handleInputChange,
  users,
  selectedRowData,
  ZOHO,
}) => {
  // Add the missing activityType array back
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
      handleInputChange("start", selectedRowData.Start_DateTime || "");
      handleInputChange("end", selectedRowData.End_DateTime || "");
      handleInputChange("Duration_Min", selectedRowData.Duration_Min || "");
      handleInputChange("Venue", selectedRowData.Venue || "");
      handleInputChange("priority", selectedRowData.Event_Priority || "");
      handleInputChange("ringAlarm", selectedRowData.ringAlarm || "");
      handleInputChange("Colour", selectedRowData.Colour || "#ff0000");
      handleInputChange("Banner", selectedRowData.Banner || false);
      handleInputChange(
        "scheduleFor",
        selectedRowData.Owner?.name || "" // Set the default value for scheduleFor
      );
      handleInputChange(
        "scheduledWith",
        selectedRowData.Participants
          ? selectedRowData.Participants.map((participant) => ({
              name: participant.name,
              participant: participant.participant,
              type: participant.type,
            }))
          : []
      ); // Map scheduledWith from selectedRowData Participants
    }
  }, [selectedRowData]);

  const [openStartDatepicker, setOpenStartDatepicker] = useState(false);
  const [openEndDatepicker, setOpenEndDatepicker] = useState(false);
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [color, setColor] = useState(formData.Colour || "#ff0000");

  const handleBannerChecked = (e) => {
    handleInputChange("Banner", e.target.checked);
    const now = new Date();
    const timeAt6AM = formatTime(now, 6);
    const timeAt7AM = formatTime(now, 7);
    handleInputChange("start", timeAt6AM);
    handleInputChange("end", timeAt7AM);
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

  const customInputComponent = (field, placeholder, openDatepickerState) => {
    return (
      <CustomTextField
        fullWidth
        size="small"
        placeholder={placeholder}
        variant="outlined"
        value={formData[field]} // Use formData
        onClick={() => openDatepickerState(true)}
      />
    );
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
            onChange={(e) => handleInputChange("start", e.value)}
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
            onChange={(e) => handleInputChange("end", e.value)}
            isOpen={openEndDatepicker}
          />
        </Grid>
        <Grid size={4}>
          <FormControl fullWidth size="small" sx={commonStyles}>
            <InputLabel>Duration</InputLabel>
            <Select
              label="Duration"
              fullWidth
              value={formData.Duration_Min} // Use formData
              onChange={(e) =>
                handleInputChange("Duration_Min", e.target.value)
              }
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

        <Grid size={6}>
          <AccountField
            value={formData.associateWith} // Use formData
            handleInputChange={handleInputChange}
            ZOHO={ZOHO}
          />
        </Grid>

        <Grid size={6}>
          <ContactField
            value={formData.scheduledWith} // Use formData
            handleInputChange={handleInputChange}
            ZOHO={ZOHO}
          />
        </Grid>
        <Grid size={6}>
          <FormControl fullWidth size="small" sx={commonStyles}>
            <Autocomplete
              id="schedule-for-autocomplete"
              size="small"
              options={
                users && users.length > 0
                  ? users.map((user) => user.full_name)
                  : []
              }
              getOptionLabel={(option) => option || ""}
              value={formData.scheduleFor || ""} // Use formData
              onChange={(event, newValue) => {
                handleInputChange("scheduleFor", newValue || "");
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
            <InputLabel>Ring Alarm</InputLabel>
            <Select
              label="Ring Alarm"
              fullWidth
              value={formData.ringAlarm} // Use formData
              onChange={(e) => handleInputChange("ringAlarm", e.target.value)}
            >
              <MenuItem value={5}>5 minutes</MenuItem>
              <MenuItem value={10}>10 minutes</MenuItem>
              <MenuItem value={15}>15 minutes</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={6}>
          <RegardingField
            formData={formData}
            handleInputChange={handleInputChange}
          />
        </Grid>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={8}>
            <FormControlLabel
              control={<Checkbox />}
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default FirstComponent;
