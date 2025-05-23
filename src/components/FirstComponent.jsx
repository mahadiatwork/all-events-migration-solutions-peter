import {
  Autocomplete,
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid2 as Grid,
  InputLabel,
  Link,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState, useEffect, useContext } from "react";
import CustomTextField from "./atom/CustomTextField";
import ContactField from "./atom/ContactField";
import AccountField from "./atom/AccountField";
import { ChromePicker, SketchPicker } from "react-color";
import { Datepicker } from "@mobiscroll/react";
import RegardingField from "./atom/RegardingField";
import { ZohoContext } from "../App";
import CustomColorPicker from "./atom/CustomColorPicker";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const ringAlarm = [
  { name: "At time of meeting", value: 0 },
  { name: "5 minutes before", value: 5 },
  { name: "10 minutes before", value: 10 },
  { name: "15 minutes before", value: 15 },
  { name: "30 minutes before", value: 30 },
  { name: "1 hour before", value: 60 },
  { name: "2 hours before", value: 120 },
  { name: "1 day before", value: 1440 },
  { name: "2 day before", value: 2880 },
];

const commonTextStyles = {
  fontSize: "9pt", // Set the font size to 9pt
  "& .MuiOutlinedInput-input": { fontSize: "9pt" }, // For TextField and Select inputs
  "& .MuiAutocomplete-input": { fontSize: "9pt" }, // For Autocomplete inputs
  "& .MuiFormLabel-root": { fontSize: "9pt" }, // For labels
  "& .MuiTypography-root": { fontSize: "9pt" }, // For Typography
};

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

  console.log({ formatTime: newDate });

  const year = newDate.getFullYear();
  const month = String(newDate.getMonth() + 1).padStart(2, "0");
  const day = String(newDate.getDate()).padStart(2, "0");

  // Convert to 12-hour format and determine AM/PM
  let hours = newDate.getHours();
  const minutes = String(newDate.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert 0 hours to 12 for AM

  console.log({
    formattedTime: `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`,
  });

  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};

const formatTimeForBanner = (date, hour) => {
  const newDate = new Date(date);
  newDate.setHours(hour, 0, 0, 0);
  // Manually format the date in YYYY-MM-DDTHH:mm without converting to UTC
  const year = newDate.getFullYear();
  const month = String(newDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(newDate.getDate()).padStart(2, "0");
  const hours = String(newDate.getHours()).padStart(2, "0");
  const minutes = String(newDate.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
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
  currentContact,
}) => {
  const { events, filterDate, setFilterDate, recentColors, setRecentColor } =
    useContext(ZohoContext);

  const [sendReminders, setSendReminders] = useState(
    selectedRowData?.Send_Reminders || false
  ); // Initially, reminders are enabled
  const [sendNotification, setSendNotification] = useState(
    selectedRowData?.Send_Invites || false
  );
  const [reminderMinutes, setReminderMinutes] = useState(15);

  // useEffect(() => {
  //   // Initialize Remind_Participants and Reminder_Text
  // if (
  //   !formData.Remind_Participants ||
  //   formData.Remind_Participants.length === 0
  // ) {
  //   handleInputChange("Remind_Participants", [
  //     { period: "minutes", unit: 15 },
  //   ]);
  //   handleInputChange("Reminder_Text", "15 minutes before");
  // }
  // }, [formData.Remind_Participants, handleInputChange]);

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
    { type: "Other", resource: 17 },
  ]);

  function addMinutesToDateTime(formatType, durationInMinutes) {
    // // Create a new Date object using the start time from formData
    // console.log(formatType,durationInMinutes)
    if (formatType === "Duration_Min") {
      let date = new Date(formData.start);

      date.setMinutes(date.getMinutes() + parseInt(durationInMinutes, 10));
      const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      );

      const modifiedDate = localDate.toISOString().slice(0, 16);

      handleInputChange("end", modifiedDate);
      setEndValue(dayjs(modifiedDate));
    } else {
      let date = new Date(formData.start);

      date.setMinutes(
        date.getMinutes() - parseInt(durationInMinutes.value, 10)
      );

      const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      );

      const modifiedDate = localDate.toISOString().slice(0, 16);

      handleInputChange("Remind_At", modifiedDate);
      handleInputChange("Reminder_Text", durationInMinutes.name);
    }
  }

  useEffect(() => {
    const initializeDefaultValues = () => {
      const now = new Date();
      const oneHourLater = new Date(now);
      oneHourLater.setHours(now.getHours() + 1);

      // handleInputChange("start", now.toISOString());
      // handleInputChange("end", oneHourLater.toISOString());
      handleInputChange("duration", 60); // Default duration of 60 minutes
      // setStartValue(dayjs(now));
      // setEndValue(dayjs(oneHourLater));
    };

    const initializeSelectedRowData = () => {
      handleInputChange("Reminder_Text", selectedRowData.Reminder_Text || "");
      handleInputChange("Event_Title", selectedRowData.Event_Title || "");
      handleInputChange(
        "Type_of_Activity",
        selectedRowData.Type_of_Activity || ""
      );

      const formattedStart = selectedRowData.Start_DateTime
        ? new Date(selectedRowData.Start_DateTime)
        : null;
      const formattedEnd = selectedRowData.End_DateTime
        ? new Date(selectedRowData.End_DateTime)
        : null;

      // // Set start, end, and duration if valid times are provided
      // if (formattedStart && formattedEnd) {
      //   handleInputChange("start", formattedStart.toISOString());
      //   handleInputChange("end", formattedEnd.toISOString());
      //   const calculatedDuration = calculateDuration(
      //     formattedStart,
      //     formattedEnd
      //   );
      //   handleInputChange(
      //     "duration",
      //     selectedRowData.duration || calculatedDuration
      //   );
      //   setStartValue(dayjs(formattedStart));
      //   setEndValue(dayjs(formattedEnd));
      // } else {
      //   initializeDefaultValues();
      // }

      handleInputChange("Venue", selectedRowData.Venue || "");
      handleInputChange("priority", selectedRowData.Event_Priority || "");
      handleInputChange("ringAlarm", selectedRowData.ringAlarm || "");
      handleInputChange("Colour", selectedRowData.Colour || "#ff0000");
      handleInputChange("Banner", selectedRowData.Banner || false);

      // const owner = users.find(
      //   (user) => user.full_name === selectedRowData.Owner?.name
      // );
      // handleInputChange("scheduleFor", owner || null);

      // handleInputChange(
      //   "scheduledWith",
      //   selectedRowData.Participants
      //     ? selectedRowData.Participants.map((participant) => ({
      //         name: participant.name,
      //         participant: participant.participant,
      //         type: participant.type,
      //       }))
      //     : []
      // );
    };

    if (!selectedRowData) {
      initializeDefaultValues();
    } else {
      initializeSelectedRowData();
    }
  }, [selectedRowData, users]);

  const [openStartDatepicker, setOpenStartDatepicker] = useState(false);
  const [openEndDatepicker, setOpenEndDatepicker] = useState(false);
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [color, setColor] = useState(formData.Colour || "#ff0000");

  const handleBannerChecked = (e) => {
    handleInputChange("Banner", e.target.checked);
    const selectedDate = formData.start;
    console.log({ selectedDate });
    if (selectedDate) {
      const timeAt6AM = formatTimeForBanner(selectedDate, 6);
      const timeAt7AM = formatTimeForBanner(selectedDate, 7);
      // console.log("fahim", timeAt6AM, timeAt7AM);
      handleInputChange("start", timeAt6AM);
      handleInputChange("end", timeAt7AM);
      setStartValue(dayjs(timeAt6AM));
      setEndValue(dayjs(timeAt7AM));
    } else {
      const now = new Date();
      // console.log(now);
      const timeAt6AM = formatTimeForBanner(now, 6);
      const timeAt7AM = formatTimeForBanner(now, 7);
      // console.log("fahim", timeAt6AM, timeAt7AM);
      handleInputChange("start", timeAt6AM);
      handleInputChange("end", timeAt7AM);
      setStartValue(dayjs(timeAt6AM));
      setEndValue(dayjs(timeAt7AM));
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
    setColor(newColor);
    handleInputChange("Colour", newColor);
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

  const durations = Array.from({ length: 24 }, (_, i) => (i + 1) * 10);

  const now = new Date();

  const start = dayjs(formData.start);
  const initialStart = start.isValid() ? start : dayjs(now);

  const [startValue, setStartValue] = useState(initialStart);

  // Add 60 minutes to the start value
  const [endValue, setEndValue] = useState(() => {
    const end = dayjs(formData.end);
    return end.isValid() ? end : initialStart.add(60, "minute");
  });

  function getTimeDifference(end) {
    const startDate = new Date(formData.start);
    const endDate = new Date(end);
    const diffInMs = endDate - startDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return diffInMinutes;
  }

  const handleEndDateChange = (e) => {
    console.log("fahim", e.$d);
    handleInputChange("end", e.$d);
    console.log("end", e.value);
    const getDiffInMinutes = getTimeDifference(e.$d);
    handleInputChange("Duration_Min", getDiffInMinutes);
    console.log({ getDiffInMinutes });
    // if (formData.end ) {
    //   console.log('hello')
    // }
  };

  //  const [selectedParticipants, setSelectedParticipants] = useState(
  //   selectedRowData?.Participants || []
  // ); // Selected values in autocomplete

  const handleCheckboxChange = (field) => {
    if (field === "$send_notification") {
      console.log({ sendNotification });
      setSendNotification((prev) => {
        const newSendNotification = !prev;
        handleInputChange("$send_notification", newSendNotification);
        handleInputChange("Send_Invites", newSendNotification);
        handleInputChange("Reminder_Text", `${reminderMinutes} minutes before`);
        return newSendNotification;
      });
    } else if (field === "Remind_Participants") {
      setSendReminders((prev) => {
        const newSendReminders = !prev;

        if (newSendReminders) {
          handleInputChange("Remind_Participants", [
            { period: "minutes", unit: reminderMinutes },
          ]);
          handleInputChange(
            "Reminder_Text",
            `${reminderMinutes} minutes before`
          );
          handleInputChange("Remind_At", [reminderMinutes]);
          handleInputChange("Send_Reminders", true);
        } else {
          handleInputChange("Remind_Participants", []);
          handleInputChange("Reminder_Text", "None");
          handleInputChange("Remind_At", []);
          handleInputChange("Send_Reminders", false);
        }

        return newSendReminders;
      });
    }
  };

  const handleReminderChange = (value) => {
    setReminderMinutes(value);
    handleInputChange("Remind_Participants", [
      { period: "minutes", unit: value },
    ]);
    if (value === "None") {
      handleInputChange("Reminder_Text", "None");
    } else {
      handleInputChange("Reminder_Text", `${value} minutes before`);
    }
  };

  return (
    <Box sx={{ mt: 2, ...commonTextStyles }}>
      <Grid container spacing={1.7}>
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
          <FormControl fullWidth size="small" className="custom-select">
            <InputLabel>Activity type</InputLabel>
            <Select
              label="Activity type"
              fullWidth
              value={formData.Type_of_Activity} // Use formData
              onChange={handleActivityChange}
              sx={{
                fontSize: "9pt", // Ensures the selected text is 9pt
                "& .MuiSelect-select": {
                  fontSize: "9pt", // Ensures the selected value text is 9pt
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    fontSize: "9pt", // Ensures the dropdown options text is 9pt
                  },
                },
              }}
            >
              {activityType.map((item, index) => (
                <MenuItem
                  value={item.type}
                  key={index}
                  sx={{ fontSize: "9pt" }} // Ensures the menu item text is 9pt
                >
                  {item.type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={4}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Start Time"
              value={startValue}
              disabled={formData.Banner ? true : false}
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [80, -180], // You can adjust the offset if necessary
                      },
                    },
                  ],
                },
                textField: {
                  size: "small",
                },
              }}
              onChange={(e) => {
                const addedHour = new Date(dayjs(e.$d).add(1, "hour").toDate());
                handleInputChange("start", e.$d);
                handleInputChange("end", addedHour);
                setEndValue(dayjs(addedHour));
                handleInputChange("Duration_Min", 60);
                console.log(e.$d);
                console.log(addedHour);
              }}
              sx={{ "& input": { py: 0 } }}
              renderInput={(params) => <TextField {...params} size="small" />}
              format="DD/MM/YYYY hh:mm A" // Ensures 24-hour format for clarity
            />
          </LocalizationProvider>
        </Grid>
        <Grid size={4}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="End Time"
              value={endValue}
              disabled={formData.Banner ? true : false}
              onChange={(e) => handleEndDateChange(e)}
              sx={{
                "& input": { py: 0 },
              }}
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [80, -180], // You can adjust the offset if necessary
                      },
                    },
                  ],
                },
                textField: {
                  size: "small",
                },
              }}
              renderInput={(params) => <TextField {...params} size="small" />}
              format="DD/MM/YYYY hh:mm A" // Ensures 24-hour format for clarity
            />
          </LocalizationProvider>
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
              value={formData.Duration_Min}
              disabled={formData.Banner ? true : false}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => {
                handleInputChange("Duration_Min", e.target.value);
                addMinutesToDateTime("Duration_Min", e.target.value);
              }}
              sx={{
                "& .MuiSelect-select": {
                  padding: "4px 5px", // Adjust the padding to shrink the Select content
                },
                "& .MuiOutlinedInput-root": {
                  // height: '40px', // Set a consistent height
                  padding: "3px 0px", // Ensure no extra padding
                },
                "& .MuiInputBase-input": {
                  display: "flex",
                  alignItems: "center", // Align the content vertically
                },
              }}
            >
              {durations.map((minute, index) => (
                <MenuItem key={index} value={minute}>
                  {minute} minutes
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={4} md={2} sx={{ margin: "-13.6px 0px" }}>
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
        <Grid
          item
          xs={6}
          sm={4}
          md={2}
          display="flex"
          alignItems="center"
          sx={{ margin: "-13.6px 0px" }}
        >
          <Typography variant="body1" sx={{ mr: 1 }}>
            Colour:
          </Typography>
          <div style={colorBoxStyle} onClick={handleClick} />
          {displayColorPicker && (
            <div style={popover}>
              <div style={cover} />
              <CustomColorPicker
                recentColors={recentColors}
                handleClose={handleClose}
                handleColorChange={handleColorChange}
              />
            </div>
          )}
        </Grid>
        <Grid size={12}>
          <ContactField
            formData={formData} // Use formData
            handleInputChange={handleInputChange}
            ZOHO={ZOHO}
            selectedRowData={selectedRowData}
            currentContact={currentContact}
          />
        </Grid>
        <Grid item xs={6} sx={{ margin: "-13.6px 0px" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={sendNotification} // Checked when invites are disabled
                onChange={() => handleCheckboxChange("$send_notification")}
                disabled={sendReminders} // Disable if "Send reminders" is checked
              />
            }
            label="Send Invites"
          />
        </Grid>

        {/* Don't send reminders */}
        <Grid item xs={6} sx={{ margin: "-13.6px 0px" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={sendReminders} // Checked when reminders are disabled
                onChange={() => handleCheckboxChange("Remind_Participants")}
                disabled={sendNotification} // Disable if "Send invites" is checked
              />
            }
            label="Send Reminders"
          />
        </Grid>
        <Grid item xs={6} sx={{ margin: "-13.6px 0px" }}>
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
          {formData?.id && (
            <Link
              href={`https://crm.zoho.com.au/crm/org7004396182/tab/Events/${formData.id}`}
              target="_blank"
              sx={{ fontSize: "9pt" }}
            >
              Meeting Link
            </Link>
          )}
        </Grid>
        <Grid size={12}>
          <AccountField
            formData={formData} // Use formData
            handleInputChange={handleInputChange}
            ZOHO={ZOHO}
            selectedRowData={selectedRowData}
          />
        </Grid>
        <Grid size={12}>
          <RegardingField
            formData={formData}
            handleInputChange={handleInputChange}
            selectedRowData={selectedRowData}
          />
        </Grid>
        <Grid size={12}>
          <FormControl fullWidth size="small" sx={commonStyles}>
            <Autocomplete
              id="schedule-for-autocomplete"
              size="small"
              options={users} // Ensure users array is correctly passed
              getOptionLabel={(option) => option?.full_name || option?.name || ""} // Use full_name to display
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
          <FormControl fullWidth size="small" className="custom-select">
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
        {/* Reminder Dropdown */}
        <Grid size={3}>
          <FormControl fullWidth size="small">
            <InputLabel
              id="demo-simple-select-standard-label"
              sx={{ fontSize: "9pt" }} // ✅ Label text size
            >
              Ring Alarm
            </InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              label="Ring Alarm"
              fullWidth
              // disabled={!formData.Remind_Participants}
              value={formData.Reminder_Text || ""} // Use `Reminder_Text` to display selected text
              onChange={(e) => {
                // Find the selected ring object
                const selectedRing = ringAlarm.find(
                  (ring) => ring.name === e.target.value
                );

                if (selectedRing) {
                  // Update the `Remind_At` with the calculated date/time
                  addMinutesToDateTime("remindAt", selectedRing);
                  // Update the `Reminder_Text` with the selected reminder text
                  handleInputChange("Reminder_Text", selectedRing.name);
                  handleInputChange("Remind_Participants", [
                    { period: "minutes", unit: e.target.value },
                  ]);
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    fontSize: "9pt", // ✅ Dropdown menu text size
                  },
                },
              }}
              sx={{
                "& .MuiSelect-select": {
                  padding: "3px 10px", // Adjust padding for dropdown content
                  fontSize: "9pt", // ✅ Selected value text size
                },
                "& .MuiOutlinedInput-root": {
                  padding: 0, // Ensure no extra padding
                },
                "& .MuiInputBase-input": {
                  display: "flex",
                  alignItems: "center", // Align content vertically
                  fontSize: "9pt", // ✅ Input text size
                },
              }}
            >
              {ringAlarm.map((ring, index) => (
                <MenuItem
                  key={index}
                  value={ring.name}
                  sx={{ fontSize: "9pt" }}
                >
                  {" "}
                  {/* ✅ Menu item text size */}
                  {ring.name}
                </MenuItem>
              ))}
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
      </Grid>
    </Box>
  );
};

export default FirstComponent;
