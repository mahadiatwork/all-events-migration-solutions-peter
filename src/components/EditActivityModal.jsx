import React from "react";
import "@mobiscroll/react/dist/css/mobiscroll.min.css";
import { Input, Select, Textarea } from "@mobiscroll/react";
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
import { useState } from "react";
import FirstComponent from "./FirstComponent";
import SecondComponent from "./SecondComponent";
import ThirdComponent from "./ThirdComponent";
import CloseIcon from "@mui/icons-material/Close";

function formatDateWithOffset(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  const pad = (num) => String(num).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  // Convert to 12-hour format and determine AM/PM
  let hours = date.getHours();
  const minutes = pad(date.getMinutes());
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert 0 hours to 12 for AM

  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
}

function transformFormSubmission(data) {
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
    Description: data.Description, // Map `description` to `Description`
    Event_Priority: data.priority, // Map `priority` to `Event_Priority`

    // Updated `What_Id` with both name and id from `associateWith`
    What_Id: data.associateWith
      ? {
          id: data.associateWith.id || null, // Assign id from associateWith
        }
      : null,
    se_module: "Accounts",

    // Combine the manually set participants and those from `scheduleWith`
    Participants: data.scheduledWith,
    Duration_Min: data.Duration_Min.toString(),
    Owner: {
      id: data.scheduleFor.id,
    },
  };

  // Explicitly remove the scheduleWith, scheduleFor, and description keys
  delete transformedData.scheduledWith;
  delete transformedData.scheduleFor;
  delete transformedData.description;
  delete transformedData.associateWith;

  // Remove keys that have null or undefined values
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

const EditActivityModal = ({
  openEditModal,
  handleClose,
  selectedRowData,
  ZOHO,
  users,
}) => {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const [textvalue, setTextValue] = useState("");
  const [formData, setFormData] = useState({
    id: selectedRowData?.id,
    Event_Title: selectedRowData?.Event_Title || "",
    Type_of_Activity: selectedRowData?.Type_of_Activity || "",
    start: selectedRowData?.Start_DateTime || "",
    end: selectedRowData?.End_DateTime || "",
    Duration_Min: selectedRowData?.Duration_Min || "",
    associateWith: selectedRowData?.What_Id || "",
    scheduledWith: selectedRowData?.Participants
      ? selectedRowData.Participants
      : [], // Map 'name' and 'participant' to create the appropriate structure for Autocomplete
    Venue: selectedRowData?.Venue || "",
    priority: selectedRowData?.Event_Priority || "",
    ringAlarm: selectedRowData?.ringAlarm || "",
    Colour: selectedRowData?.Colour || "#ff0000",
    Regarding: selectedRowData?.Regarding || "#ff0000",
    Description: selectedRowData?.Description || "",
    Banner: selectedRowData?.Banner || false,
    scheduleFor: selectedRowData?.Owner || null,
    Reminder_Text: selectedRowData?.Reminder_Text || null,
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Handlers for Next and Back buttons
  const handleNext = () => {
    if (value < 2) setValue(value + 1); // Increment to next tab
  };

  const handleBack = () => {
    if (value > 0) setValue(value - 1); // Decrement to previous tab
  };

  const handleInputChange = (field, value) => {
    if (field === "resource") {
      value = parseInt(value, 10); // Convert the input to an integer
    }

    if (field === "scheduleWith") {
      setFormData((prev) => ({
        ...prev,
        [field]: Array.isArray(value) ? [...value] : value, // Spread array values for multiple selections
      }));
    }
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    const transformedData = transformFormSubmission(formData);
    await ZOHO.CRM.API.updateRecord({
      Entity: "Events",
      APIData: transformedData,
      Trigger: ["workflow"],
    })
      .then(function (data) {
        if (
          data.data &&
          data.data.length > 0 &&
          data.data[0].code === "SUCCESS"
        ) {
          // If submission is successful, reload the page
          alert("Event Updated Successfully");
          window.location.reload();
        }
      })
      .catch(function (error) {
        console.error("Error submitting the form:", error);
      });
  };

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
        <Typography variant="h6">Edit Activity</Typography>

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
          <Tab label="Reccurence" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <FirstComponent
          formData={formData}
          handleInputChange={handleInputChange}
          users={users}
          selectedRowData={selectedRowData}
          ZOHO={ZOHO}
          isEditMode={true} // Pass true if it's the EditModal, false otherwise
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
            >
              Update
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
        {/* <SecondComponent /> */}
        <Typography variant="h6">Description</Typography>
        {/* <ReactQuill
          theme="snow"
          style={{ height: 250, marginBottom: 80 }}
          value={formData.quillContent}
          onChange={(content) => handleInputChange("quillContent", content)}
        /> */}
        <TextField
          multiline
          rows={10}
          fullWidth
          value={formData?.Description}
          onChange={(event) =>
            handleInputChange("Description", event.target.value)
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
            >
              Update
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
          >
            Update
          </Button>{" "}
          {/* Next is disabled on the last tab */}
        </Box>
      </TabPanel>
    </Box>
  );
};

export default EditActivityModal;
