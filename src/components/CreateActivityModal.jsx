import React, { useState } from "react";
import "@mobiscroll/react/dist/css/mobiscroll.min.css";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import FirstComponent from "./FirstComponent";
import SecondComponent from "./SecondComponent";
import ThirdComponent from "./ThirdComponent";
import CloseIcon from "@mui/icons-material/Close";

// Helper function to format date with timezone offset
function formatDateForRemindAt(date) {
  if (!date) return null;

  // Helper function to pad numbers with leading zeros
  const pad = (num) => String(num).padStart(2, "0");

  // Extract date and time components
  const formattedYear = date.getFullYear();
  const formattedMonth = pad(date.getMonth() + 1);
  const formattedDay = pad(date.getDate());
  const formattedHours = pad(date.getHours());
  const formattedMinutes = pad(date.getMinutes());
  const formattedSeconds = pad(date.getSeconds());

  // Get timezone offset
  const timezoneOffset = -date.getTimezoneOffset();
  const offsetSign = timezoneOffset >= 0 ? "+" : "-";
  const offsetHours = pad(Math.floor(Math.abs(timezoneOffset) / 60));
  const offsetMinutes = pad(Math.abs(timezoneOffset) % 60);

  // Return formatted date string with timezone offset
  return `${formattedYear}-${formattedMonth}-${formattedDay}T${formattedHours}:${formattedMinutes}:${formattedSeconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
}

// Function to calculate Remind_At based on Reminder_Text
function calculateRemindAt(reminderText, startDateTime) {
  const startDate = new Date(startDateTime);
  // Calculate the amount of time to subtract based on Reminder_Text
  switch (reminderText) {
    case "At time of meeting":
      return startDate.toISOString(); // No change
    case "5 minutes before":
      startDate.setMinutes(startDate.getMinutes() - 5);
      break;
    case "15 minutes before":
      startDate.setMinutes(startDate.getMinutes() - 15);
      break;
    case "30 minutes before":
      startDate.setMinutes(startDate.getMinutes() - 30);
      break;
    case "1 hour before":
      startDate.setHours(startDate.getHours() - 1);
      break;
    case "2 hours before":
      startDate.setHours(startDate.getHours() - 2);
      break;
    case "1 day before":
      startDate.setDate(startDate.getDate() - 1);
      break;
    case "2 days before":
      startDate.setDate(startDate.getDate() - 2);
      break;
    case "None":
    default:
      return null; // No reminder
  }
  // Format the updated date back into the required ISO string format
  return formatDateForRemindAt(startDate);
}

function formatDateWithOffset(dateString) {
  console.log({ dateString });
  if (!dateString) return null;

  // Split the date string into date and time parts
  const [datePart, timePart, ampm] = dateString.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);
  let [hours, minutes] = timePart.split(":").map(Number);

  // Convert 12-hour format to 24-hour format
  if (ampm === "PM" && hours < 12) {
    hours += 12;
  } else if (ampm === "AM" && hours === 12) {
    hours = 0; // Handle midnight
  }

  // Create the date object using the parsed values
  const date = new Date(year, month - 1, day, hours, minutes);

  if (isNaN(date.getTime())) return null;

  // Helper function to pad numbers with leading zeros
  const pad = (num) => String(num).padStart(2, "0");

  // Extract date and time components
  const formattedYear = date.getFullYear();
  const formattedMonth = pad(date.getMonth() + 1);
  const formattedDay = pad(date.getDate());
  const formattedHours = pad(date.getHours());
  const formattedMinutes = pad(date.getMinutes());
  const formattedSeconds = pad(date.getSeconds());

  // Get timezone offset
  const timezoneOffset = -date.getTimezoneOffset();
  const offsetSign = timezoneOffset >= 0 ? "+" : "-";
  const offsetHours = pad(Math.floor(Math.abs(timezoneOffset) / 60));
  const offsetMinutes = pad(Math.abs(timezoneOffset) % 60);

  // Return formatted date string with timezone offset
  return `${formattedYear}-${formattedMonth}-${formattedDay}T${formattedHours}:${formattedMinutes}:${formattedSeconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
}

function transformFormSubmission(data, individualParticipant = null) {
  const transformScheduleWithToParticipants = (scheduleWith) => {
    return scheduleWith.map((contact) => ({
      name: contact.Full_Name || null,
      invited: false,
      type: "contact",
      participant: contact.participant || null,
      status: "not_known",
    }));
  };

  const participants = individualParticipant
    ? [
        {
          name: individualParticipant.Full_Name || null,
          invited: false,
          type: "contact",
          participant: individualParticipant.participant || null,
          status: "not_known",
        },
      ]
    : transformScheduleWithToParticipants(data.scheduledWith || []);


  let transformedData = {
    ...data,
    Start_DateTime: formatDateWithOffset(data.start),
    End_DateTime: formatDateWithOffset(data.end),
    Description: data.Description || "",
    Event_Priority: data.priority || "",

    // Update Event_Title to include participant's name if creating separate events
    Event_Title: individualParticipant
      ? `${data.Event_Title} - ${individualParticipant.Full_Name}`
      : data.Event_Title, // If no individual participant, use the default title

    What_Id: data.associateWith?.id ? { id: data.associateWith.id } : null,
    se_module: "Accounts",
    Participants: participants,
    Duration_Min: data.Duration_Min ? data.Duration_Min.toString() : "0",
    Owner: {
      id: data?.scheduleFor?.id,
    },
  };

  if (
    data?.Reminder_Text !== null &&
    data?.Reminder_Text !== "" &&
    data?.Reminder_Text !== "None"
  ) {
    const remindAt = calculateRemindAt(data?.Reminder_Text, formatDateWithOffset(data.start));
    transformedData['Remind_At'] = remindAt;
    transformedData['$send_notification'] = true;
  }


  const keysToRemove = [
    "scheduledWith",
    "description",
    "Create_Separate_Event_For_Each_Contact",
  ];
  keysToRemove.forEach((key) => delete transformedData[key]);

  Object.keys(transformedData).forEach((key) => {
    if (transformedData[key] === null || transformedData[key] === undefined) {
      delete transformedData[key];
    }
  });

  return transformedData;
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

const CreateActivityModal = ({ openCreateModal, handleClose, ZOHO, users }) => {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const [formData, setFormData] = useState({
    Type_of_Activity: "",
    startTime: "",
    endTime: "",
    duration: "",
    associateWith: "",
    Event_Title: "",
    resource: 0,
    scheduleFor: "",
    scheduledWith: [],
    Venue: "",
    priority: "",
    repeat: "once",
    start: "",
    end: "",
    noEndDate: false,
    description: "",
    color: "#fff",
    Regarding: "",
    Duration_Min: "",
    Create_Separate_Event_For_Each_Contact: false,
    Reminder_Text: "None",
  });

  const isFormValid = () => {
    const {
      Type_of_Activity,
      start, // Use raw formData fields
      end,
      Duration_Min,
      associateWith,
      Event_Title,
      scheduledWith, // scheduledWith instead of Participants
    } = formData;

    console.log(formData);
    // Ensure all required fields are not empty or null
    return (
      Type_of_Activity &&
      start &&
      end &&
      Duration_Min &&
      associateWith &&
      Event_Title &&
      scheduledWith.length > 0
    );
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleNext = () => {
    if (value < 2) setValue(value + 1);
  };

  const handleBack = () => {
    if (value > 0) setValue(value - 1);
  };

  const handleInputChange = (field, value) => {
    if (field === "resource") {
      value = parseInt(value, 10);
    }
    if (field === "scheduleWith") {
      setFormData((prev) => ({
        ...prev,
        [field]: Array.isArray(value) ? [...value] : value,
      }));
    }
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSubmit = async () => {
    if (formData.Create_Separate_Event_For_Each_Contact) {
      for (let participant of formData.scheduledWith) {
        const transformedData = transformFormSubmission(formData, participant);
        await ZOHO.CRM.API.insertRecord({
          Entity: "Events",
          APIData: transformedData,
          Trigger: ["workflow"],
        })
          .then((data) => {
            if (
              data.data &&
              data.data.length > 0 &&
              data.data[0].code === "SUCCESS"
            ) {
              console.log(
                `Event Created Successfully for ${participant.Full_Name}`
              );
            }
          })
          .catch((error) => {
            console.error("Error submitting the form:", error);
            setSnackbarSeverity("error");
            setSnackbarMessage("Error creating events.");
            setSnackbarOpen(true);
          });
      }
      setSnackbarSeverity("success");
      setSnackbarMessage("Events Created Successfully");
      setSnackbarOpen(true);
      window.location.reload();
    } else {
      const transformedData = transformFormSubmission(formData);
      await ZOHO.CRM.API.insertRecord({
        Entity: "Events",
        APIData: transformedData,
        Trigger: ["workflow"],
      })
        .then((data) => {
          if (
            data.data &&
            data.data.length > 0 &&
            data.data[0].code === "SUCCESS"
          ) {
            setSnackbarSeverity("success");
            setSnackbarMessage("Event Created Successfully");
            setSnackbarOpen(true);
            window.location.reload();
          }
        })
        .catch((error) => {
          console.error("Error submitting the form:", error);
          setSnackbarSeverity("error");
          setSnackbarMessage("Error creating event.");
          setSnackbarOpen(true);
        });
    }
  };

  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

  // Validate form data whenever it changes
  React.useEffect(() => {
    console.log({ formData });
    const data = isFormValid();
    console.log(data);
    // setIsSubmitEnabled(isFormValid());
  }, [formData]); // Effect runs whenever formData changes

  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600,
        bgcolor: "background.paper",
        border: "2px solid #000",
        boxShadow: 24,
        p: 2,
        borderRadius: 5,
        zIndex: 999,
      }}
    >
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Create Activity</Typography>

        {/* Replacing IconButton with Cancel Button */}
        <Button
          variant="outlined"
          color="error"
          onClick={handleClose}
          endIcon={<CloseIcon />}
        >
          Cancel
        </Button>
      </Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          textColor="inherit"
          aria-label="simple tabs example"
        >
          <Tab label="General" />
          <Tab label="Details" />
          <Tab label="Recurrence" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <FirstComponent
          formData={formData}
          handleInputChange={handleInputChange}
          users={users}
          ZOHO={ZOHO}
        />
        <Box display="flex" justifyContent="space-between" mt={2}>
          {/* First button aligned to the left */}
          <Button size="small" disabled>
            Back
          </Button>

          {/* Wrapper for the other two buttons aligned to the right */}
          <Box display="flex" gap={1}>
            <Button
              size="small"
              variant="contained"
              color="secondary"
              onClick={handleSubmit}
              disabled={!isFormValid()} // Disable button if form is not valid
            >
              Ok
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={handleNext}
            >
              Next
            </Button>
          </Box>
        </Box>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Typography variant="h6">Description</Typography>
        <TextField
          multiline
          rows={10}
          fullWidth
          value={formData.description}
          onChange={(event) =>
            handleInputChange("description", event.target.value)
          }
        />
        <Box display="flex" justifyContent="space-between" mt={2}>
          {/* First button aligned to the left */}
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={handleBack}
          >
            Back
          </Button>

          {/* Wrapper for the other two buttons aligned to the right */}
          <Box display="flex" gap={1}>
            <Button
              size="small"
              variant="contained"
              color="secondary"
              onClick={handleSubmit}
              disabled={!isFormValid()} // Disable button if form is not valid
            >
              Ok
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={handleNext}
            >
              Next
            </Button>
          </Box>
        </Box>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <ThirdComponent
          formData={formData}
          handleInputChange={handleInputChange}
        />
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            size="small"
            variant="contained"
            color="secondary"
            onClick={handleSubmit}
            // disabled={!isFormValid()} // Disable button if form is not valid
          >
            Ok
          </Button>
        </Box>
      </TabPanel>
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateActivityModal;
