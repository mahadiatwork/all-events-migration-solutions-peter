import React, { useState } from "react";
import "@mobiscroll/react/dist/css/mobiscroll.min.css";
import {
  Box,
  Button,
  IconButton,
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

function formatDateWithOffset(dateString) {
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


function transformFormSubmission(data) {

  console.log({dae: data.start})
  // Function to transform scheduleWith data into the Participants format
  const transformScheduleWithToParticipants = (scheduleWith) => {
    return scheduleWith.map((contact) => ({
      Email: contact.Email || null, // Use Email if available, or set to null
      name: contact.Full_Name || null, // Use Full_Name for the name
      invited: false, // Default to false
      type: "contact", // Default type to "contact"
      participant: contact.id || null, // Use id as participant ID
      status: "not_known", // Default status to "not_known"
    }));
  };

  const participantsFromScheduleWith = data.scheduleWith
    ? transformScheduleWithToParticipants(data.scheduleWith)
    : [];

  let transformedData = {
    ...data,
    Start_DateTime: formatDateWithOffset(data.start), // Format `start` to ISO with timezone
    End_DateTime: formatDateWithOffset(data.end), // Format `end` to ISO with timezone

    // Map `What_Id` correctly
    What_Id: data.associateWith
      ? {
          id: data.associateWith.id || null, // Assign id from associateWith
        }
      : null,
    se_module: "Accounts",

    // Use only the manually set participants or those from `scheduleWith`
    Participants: participantsFromScheduleWith.length
      ? participantsFromScheduleWith
      : data.scheduledWith,

    Duration_Min: data.Duration_Min.toString() || "0", // Ensure this field is included
  };

  // Remove unnecessary fields (to avoid duplicates)
  delete transformedData.scheduledWith;
  delete transformedData.scheduleFor;
  delete transformedData.description; // Avoid adding `Description` twice
  delete transformedData.associateWith;
  delete transformedData.start;
  delete transformedData.end;

  // Remove keys that have null or undefined values
  Object.keys(transformedData).forEach((key) => {
    if (transformedData[key] === null || transformedData[key] === undefined) {
      delete transformedData[key];
    }
  });

  return transformedData;
}

// function transformFormSubmission(data, individualParticipant = null) {
//   const transformScheduleWithToParticipants = (scheduleWith) => {
//     return scheduleWith.map((contact) => ({
//       name: contact.Full_Name || null,
//       invited: false,
//       type: "contact",
//       participant: contact.participant || null,
//       status: "not_known",
//     }));
//   };

//   console.log({individualParticipant})

//   // If individualParticipant is provided, create a separate record for that participant
//   const participants = individualParticipant
//     ? [
//         {
//           Email: individualParticipant.Email || null,
//           name: individualParticipant.Full_Name || null,
//           invited: false,
//           type: "contact",
//           participant: individualParticipant.participant || null,
//           status: "not_known",
//         },
//       ]
//     : transformScheduleWithToParticipants(data.scheduledWith);

//   let transformedData = {
//     ...data,
//     Start_DateTime: formatDateWithOffset(data.start), // Format `start` to ISO with timezone
//     End_DateTime: formatDateWithOffset(data.end), // Format `end` to ISO with timezone
//     Description: data.Description, // Map `description` to `Description`
//     Event_Priority: data.priority, // Map `priority` to `Event_Priority`

//     // Updated `What_Id` with both name and id from `associateWith`
//     What_Id: data.associateWith
//       ? {
//           id: data.associateWith.id || null, // Assign id from associateWith
//         }
//       : null,
//     se_module: "Accounts",

//     // Use only the individual participant if available, otherwise all
//     Participants: participants,
//     Duration_Min: data.Duration_Min.toString(),
//   };

//   // Remove unnecessary fields
//   delete transformedData.scheduledWith;
//   delete transformedData.scheduleFor;
//   delete transformedData.description;
//   delete transformedData.Create_Separate_Event_For_Each_Contact;

//   // Remove any null or undefined values
//   Object.keys(transformedData).forEach((key) => {
//     if (transformedData[key] === null || transformedData[key] === undefined) {
//       delete transformedData[key];
//     }
//   });

//   return transformedData;
// }

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
    ringAlarm: "",
    repeat: "once",
    start: "",
    end: "",
    noEndDate: false,
    description: "",
    color: "#fff",
    Regarding: "",
    Duration_Min: "",
    Create_Separate_Event_For_Each_Contact: false,
  });

  const isFormValid = () => {
    const {
      priority, // Use the correct field name
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
      priority &&
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

  const handleSubmit = async () => {
    // Check if we need to create separate events for each contact
    if (formData.Create_Separate_Event_For_Each_Contact) {
      // Create a separate event for each participant
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
          });
      }
      alert("Events Created Successfully");
      window.location.reload();
    } else {
      // If not, create a single event with all participants
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
            alert("Event Created Successfully");
            window.location.reload();
          }
        })
        .catch((error) => {
          console.error("Error submitting the form:", error);
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
    </Box>
  );
};

export default CreateActivityModal;
