import {
  Autocomplete,
  Box,
  Button,
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
import React from "react";
import { useState } from "react";
import CustomTextField from "./atom/CustomTextField";
import ContactField from "./atom/ContactField";
import AccountField from "./atom/AccountField";
import { ChromePicker } from "react-color";
import { Datepicker } from "@mobiscroll/react";
import RegardingField from "./atom/RegardingField";

const FirstComponent = ({
  formData,
  handleInputChange,
  users,
  selectedRowData,
  ZOHO,
}) => {
  const [activityType, setActivityType] = useState([
    { type: "meeting", resource: 1 },
    { type: "todo", resource: 2 },
    { type: "appointment", resource: 3 },
    { type: "boardroom", resource: 4 },
    { type: "call billing", resource: 5 },
    { type: "email billing", resource: 6 },
    { type: "initial consultation", resource: 7 },
    { type: "call", resource: 8 },
    { type: "mail", resource: 9 },
    { type: "meeting billing", resource: 10 },
    { type: "personal activity", resource: 11 },
    { type: "room 1", resource: 12 },
    { type: "room 2", resource: 13 },
    { type: "room 3", resource: 14 },
    { type: "todo billing", resource: 15 },
    { type: "vacation", resource: 16 },
  ]);
  const [openDatepicker, setOpenDatepicker] = useState(false);
  const [openStartDatepicker, setOpenStartDatepicker] = useState(false);
  const [openEndDatepicker, setOpenEndDatepicker] = useState(false);

  const handleActivityChange = (event) => {
    const selectedType = event.target.value;
    const selectedActivity = activityType.find(
      (item) => item.type === selectedType
    );

    if (selectedActivity) {
      // Update both the activity type and the resource
      handleInputChange("Type_of_Activity", selectedActivity.type);
      handleInputChange("resource", selectedActivity.resource);
    }
  };

  const handleAssociateWith = () => {
    handleInputChange("title", selectedActivity.type);
  };

  console.log({ users });
  const customInputComponent = (field, placeholder, openDatepickerState) => {
    return (
      <CustomTextField
        fullWidth
        size="small"
        placeholder={placeholder}
        variant="outlined"
        value={formData[field]}
        onClick={() => openDatepickerState(true)}
      />
    );
  };

  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [color, setColor] = useState("#ff0000"); // Default color set to red

  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  const handleColorChange = (newColor) => {
    setColor(newColor.hex);
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
  return (
    <Box>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid size={12}>
          <CustomTextField
            fullWidth
            size="small"
            label="Event_title"
            variant="outlined"
            value={formData.Event_title}
            onChange={(e) => handleInputChange("Event_title", e.target.value)}
          />
        </Grid>

        <Grid size={12}>
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
              value={formData.Type_of_Activity}
              onChange={handleActivityChange}
              MenuProps={{
                //   disablePortal: true,  // This ensures the dropdown is not restricted to the modal's container
                PaperProps: {
                  style: {
                    zIndex: 1300, // Increase this if necessary, depending on the z-index of your popup
                  },
                },
              }}
              sx={{
                "& .MuiSelect-select": {
                  padding: "3px 10px", // Adjust the padding to shrink the Select content
                },
                "& .MuiOutlinedInput-root": {
                  // height: '40px', // Set a consistent height
                  padding: 0, // Ensure no extra padding
                },
                "& .MuiInputBase-input": {
                  display: "flex",
                  alignItems: "center", // Align the content vertically
                },
              }}
            >
              {activityType.map((item, index) => (
                <MenuItem value={item.type} key={index}>
                  {item.type}
                </MenuItem>
              ))}
              {/* <MenuItem value="">
                <em>None</em>
              </MenuItem>
              
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem> */}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={4}>
          <Datepicker
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
          <FormControl fullWidth size="small">
            <InputLabel
              id="demo-simple-select-standard-label"
              // sx={{ top: "-5px" }}
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
                // "& .MuiSelect-select": {
                //   padding: "3px 10px", // Adjust the padding to shrink the Select content
                // },
                "& .MuiOutlinedInput-root": {
                  // height: '40px', // Set a consistent height
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

        <Grid size={6}>
          <AccountField
            value={formData.associateWith}
            handleInputChange={handleInputChange}
            ZOHO={ZOHO}
          />
        </Grid>

        <Grid size={6}>
          <ContactField
            value={formData.scheduledWith}
            handleInputChange={handleInputChange}
            ZOHO={ZOHO}
          />
        </Grid>
        <Grid size={6}>
          <FormControl fullWidth size="small" sx={{ minHeight: "20px" }}>
            <Autocomplete
              id="schedule-for-autocomplete"
              size="small"
              options={
                users && users.length > 0
                  ? users.map((user) => user.full_name)
                  : []
              } // Extract user names
              getOptionLabel={(option) => option || ""}
              value={formData.scheduleFor}
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
                      padding: 0, // Adjust padding for consistent height
                    },
                    "& .MuiInputBase-input": {
                      padding: "3px 10px", // Shrink input content padding
                      display: "flex",
                      alignItems: "center", // Align content vertically
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
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
          />
        </Grid>

        <Grid size={3}>
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
                  // height: '40px', // Set a consistent height
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
        <Grid size={3}>
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
                  // height: '40px', // Set a consistent height
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
        <Grid size={4}>
          <RegardingField />
        </Grid>
        <Grid container spacing={2} alignItems="center">
          {/* Create separate activity for each contact */}
          <Grid item xs={12} sm={6} md={8}>
            <FormControlLabel
              control={<Checkbox />}
              label="Create separate activity for each contact"
            />
          </Grid>

          {/* Color Picker and Text */}
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

          {/* Banner/Timeless Checkbox */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControlLabel control={<Checkbox />} label="Banner/Timeless" />
          </Grid>
        </Grid>
        {/* <Grid size={3}>
          <Button
            variant="contained"
            size="small"
            sx={{ bgcolor: "gray" }}
            fullWidth
          >
            {" "}
            Schedule for
          </Button>
        </Grid> */}
      </Grid>
    </Box>
  );
};

export default FirstComponent;
