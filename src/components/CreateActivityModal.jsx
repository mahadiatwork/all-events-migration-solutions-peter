import React, { useState } from "react";
import "@mobiscroll/react/dist/css/mobiscroll.min.css";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

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
      startDate.setMinutes(startDate.getMinutes()); // No change
      break;
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

  // Parse the date string using JavaScript's Date constructor
  const date = new Date(dateString);
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

  const dayOfMonth = dayjs(data?.startTime).date();
  const dayName = dayjs(data?.startTime).format("dd");
  const monthNumber = dayjs(data?.startTime).format("MM");
  const customEndTime =
    data.noEndDate && data.occurrence === "daily"
      ? dayjs(data?.startTime).add(70, "day").format("YYYY-MM-DD")
      : data?.noEndDate && data?.occurrence === "weekly"
      ? dayjs(data?.startTime).add(10, "month").format("YYYY-MM-DD")
      : data?.noEndDate && data?.occurrence === "monthly"
      ? dayjs(data?.startTime).add(12, "month").format("YYYY-MM-DD")
      : data?.noEndDate && data?.occurrence === "yearly"
      ? dayjs(data?.startTime).add(2, "year").format("YYYY-MM-DD")
      : dayjs(data?.endTime).format("YYYY-MM-DD");

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

    What_Id: data.What_Id,
    se_module: "Accounts",
    Participants: participants,
    Duration_Min: data.Duration_Min ? data.Duration_Min.toString() : "0",
    Owner: {
      id: data?.scheduleFor?.id,
    },
    Recurring_Activity: {
      RRULE: `FREQ=${data?.occurrence?.toUpperCase()};INTERVAL=1;UNTIL=${customEndTime}${
        data.occurrence === "weekly"
          ? `;BYDAY=${dayName.toUpperCase()}`
          : data.occurrence === "monthly"
          ? `;BYMONTHDAY=${dayOfMonth}`
          : data.occurrence === "yearly"
          ? `;BYMONTH=${monthNumber};BYMONTHDAY=${dayOfMonth}`
          : ""
      };DTSTART=${dayjs(data.startTime).format("YYYY-MM-DD")}`,
    },
  };

  if (
    data?.Reminder_Text !== null &&
    data?.Reminder_Text !== "" &&
    data?.Reminder_Text !== "None"
  ) {
    const remindAt = calculateRemindAt(
      data?.Reminder_Text,
      formatDateWithOffset(data.start)
    );
    transformedData["Remind_At"] = remindAt;
    transformedData["$send_notification"] = true;
  } else {
    console.log({ Reminder_Text: data?.Reminder_Text });
    delete transformedData["Remind_Participants"];
  }

  console.log({ recurring: transformedData.Recurring_Activity });

  if (
    transformedData.Remind_At == null ||
    transformedData.Remind_At == "Invalid Date" ||
    transformedData.Remind_At == ""
  ) {
    delete transformedData.Remind_At;
  }

  if (
    transformedData.Recurring_Activity &&
    transformedData.Recurring_Activity.RRULE &&
    (transformedData.Recurring_Activity.RRULE.includes("undefined") ||
      transformedData.Recurring_Activity.RRULE.includes("Invalid Date"))
  ) {
    delete transformedData.Recurring_Activity;
  }

  const keysToRemove = [
    "scheduledWith",
    "description",
    "Create_Separate_Event_For_Each_Contact",
    "start",
    "end",
    "duration",
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

const CreateActivityModal = ({
  openCreateModal,
  handleClose,
  ZOHO,
  users,
  loggedInUser,
  setEvents,
  setSelectedRowIndex,
  setHighlightedRow,
  currentContact
}) => {
  const theme = useTheme();
  const [value, setValue] = useState(0);

  const [formData, setFormData] = useState({
    Type_of_Activity: "Meeting",
    startTime: "",
    endTime: 60,
    duration: "",
    What_Id: "",
    Event_Title: "New Meeting",
    resource: 1,
    scheduleFor: loggedInUser || "",
    scheduledWith: [],
    Venue: "",
    priority: "Medium",
    repeat: "once",
    start: "",
    end: "",
    noEndDate: false,
    Description: "",
    color: "#fff",
    Regarding: "",
    Duration_Min: 60,
    Create_Separate_Event_For_Each_Contact: false,
    Reminder_Text: "15 minutes before",
    Remind_Participants: [{ period: "minutes", unit: 15 }],
  });

  const isFormValid = () => {
    const {
      Type_of_Activity,
      start, // Use raw formData fields
      end,
      duration,
      Event_Title,
      scheduledWith, // scheduledWith instead of Participants
    } = formData;

    console.log({ formData });

    // Ensure all required fields are not empty or null
    return (
      Type_of_Activity &&
      start &&
      end &&
      duration &&
      Event_Title &&
      (currentContact !== null || scheduledWith.length > 0)
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

  const [isSubmitting, setIsSubmitting] = useState(false); // State for form submission

  const handleSubmit = async () => {
    // setIsSubmitting(true); // Start the submission process
    // let success = true;
    if (formData.Create_Separate_Event_For_Each_Contact) {
      // Handle creating separate events for each participant
      for (let participant of formData.scheduledWith) {
        const transformedData = transformFormSubmission(formData, participant);
        try {
          const data = await ZOHO.CRM.API.insertRecord({
            Entity: "Events",
            APIData: transformedData,
            Trigger: ["workflow"],
          });

          if (
            data.data &&
            data.data.length > 0 &&
            data.data[0].code === "SUCCESS"
          ) {
            const createdEvent = data.data[0].details;
            setEvents((prev) => [
              { ...transformedData, id: data?.data[0].details?.id },
              ...prev,
            ]);
            setSelectedRowIndex(data?.data[0].details?.id);
            setHighlightedRow(data?.data[0].details?.id);
            setSnackbarSeverity("success");
            setSnackbarMessage("Event Created Successfully");
            setSnackbarOpen(true);
          } else {
            success = false;
            throw new Error("Failed to create event");
          }
        } catch (error) {
          success = false;
          setSnackbarSeverity("error");
          setSnackbarMessage("Error creating events.");
          setSnackbarOpen(true);
        }
        setTimeout(() => {
          // window.location.reload();
          handleClose();
        }, 1000);
      }
    } else {
      // Handle single event creation
      // if(formData.scheduledWith.length === 0) {
      //   formData.scheduledWith = [currentContact];
      // }

      const transformedData = transformFormSubmission(formData);

      console.log({transformedData})

      return
      try {
        const data = await ZOHO.CRM.API.insertRecord({
          Entity: "Events",
          APIData: transformedData,
          Trigger: ["workflow"],
        });

        if (
          data.data &&
          data.data.length > 0 &&
          data.data[0].code === "SUCCESS"
        ) {
          const createdEvent = data.data[0].details;
          setEvents((prev) => [
            { ...transformedData, id: data?.data[0].details?.id },
            ...prev,
          ]);
          setSelectedRowIndex(data?.data[0].details?.id);
          setHighlightedRow(data?.data[0].details?.id);
          setSnackbarSeverity("success");
          setSnackbarMessage("Event Created Successfully");
          setSnackbarOpen(true);
          setTimeout(() => {
            // window.location.reload();
            handleClose();
          }, 1000);
        } else {
          throw new Error("Failed to create event");
        }
      } catch (error) {
        console.error("Error submitting the form:", error);
        setSnackbarSeverity("error");
        setSnackbarMessage("Error creating event.");
        setSnackbarOpen(true);
      }
    }

    setIsSubmitting(false);
  };

  // Validate form data whenever it changes
  React.useEffect(() => {
    const data = isFormValid();
    console.log({ isFormValid: data });
    // setIsSubmitEnabled(isFormValid());
  }, [formData]); // Effect runs whenever formData changes

  console.log("mahadi", formData);

  return (
    <Box
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "90%",
        maxWidth: "750px",
        bgcolor: "background.paper",
        borderRadius: 4,
        boxShadow: 24,
        overflowY: "auto",
        maxHeight: "90vh", // Ensure the modal is scrollable if content exceeds the viewport
        zIndex: 100,
        p: "15px 30px  20px 30px",
      }}
    >
      <Box display="flex" justifyContent="space-between" sx={{ padding: 0 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "bold" }}
          align="center"
        >
          Create Activity
        </Typography>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={handleClose}
          endIcon={<CloseIcon />}
        >
          Cancel
        </Button>
      </Box>
      <Box>
        <Tabs
          value={value}
          onChange={handleChange}
          textColor="inherit"
          aria-label="simple tabs example"
          size="small"
        >
          <Tab label="General" sx={{ fontSize: "9pt" }} />
          <Tab label="Details" sx={{ fontSize: "9pt" }} />
          <Tab label="Recurrence" sx={{ fontSize: "9pt" }} />
        </Tabs>
      </Box>
      {value === 0 && (
        <Box sx={{ p: 0, borderRadius: 1 }}>
          <FirstComponent
            formData={formData}
            handleInputChange={handleInputChange}
            users={users}
            ZOHO={ZOHO}
            currentContact={currentContact}
          />
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button size="small" disabled>
              Back
            </Button>
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
        </Box>
      )}

      {value === 1 && (
        <Box sx={{ p: 1, borderRadius: 1 }}>
          {/* <Typography variant="h6" sx={{ fontSize: "9pt" }}>
            Description
          </Typography> */}
          <TextField
            multiline
            rows={10}
            fullWidth
            value={formData.Description}
            onChange={(event) =>
              handleInputChange("Description", event.target.value)
            }
            sx={{
              "& .MuiInputBase-input": {
                fontSize: "9pt",
              },
            }}
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
            <Box display="flex" gap={1} alignItems="center">
              <Button
                size="small"
                variant="contained"
                color="secondary"
                onClick={handleSubmit}
                disabled={!isFormValid() || isSubmitting} // Disable button when submitting
              >
                Ok
              </Button>
              {isSubmitting && <CircularProgress size={24} />} {/* Loader */}
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
        </Box>
      )}

      {value === 2 && (
        <Box sx={{ p: 2, borderRadius: 1 }}>
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
        </Box>
      )}

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
