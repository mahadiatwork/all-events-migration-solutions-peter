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
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import CloseIcon from "@mui/icons-material/Close";
import { Description } from "@mui/icons-material";

function formatDateWithOffset(dateString) {
  if (!dateString) return null;

  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return null;
  }

  const pad = (num) => String(num).padStart(2, "0");

  // Format the date part
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  // Get the timezone offset in minutes and convert to hours and minutes
  const timezoneOffset = -date.getTimezoneOffset(); // In minutes
  const offsetSign = timezoneOffset >= 0 ? "+" : "-";
  const offsetHours = pad(Math.floor(Math.abs(timezoneOffset) / 60));
  const offsetMinutes = pad(Math.abs(timezoneOffset) % 60);

  // Combine everything to return the correctly formatted string
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
}

function transformFormSubmission(data) {
  // Function to transform scheduleWith data into the Participants format
  const transformScheduleWithToParticipants = (scheduleWith) => {
    return scheduleWith.map(contact => ({
      Email: contact.Email || null, // Use Email if available, or set to null
      name: contact.Full_Name || null, // Use Full_Name for the name
      invited: false, // Default to false
      type: "contact", // Default type to "contact"
      participant: contact.id || null, // Use id as participant ID
      status: "not_known" // Default status to "not_known"
    }));
  };

  const participantsFromScheduleWith = data.scheduleWith
    ? transformScheduleWithToParticipants(data.scheduleWith)
    : [];

  return {
    ...data,
    Start_DateTime: formatDateWithOffset(data.start), // Format `start` to ISO with timezone
    End_DateTime: formatDateWithOffset(data.end), // Format `end` to ISO with timezone
    Description: data.description, // Map `description` to `Description`
    Event_Priority: data.priority, // Map `priority` to `Event_Priority`
    
    // Updated `What_Id` with both name and id from `associateWith`
    What_Id: data.associateWith
      ? {
          name: data.associateWith.Account_Name || null, // Assign name from associateWith
          id: data.associateWith.id || null, // Assign id from associateWith
        }
      : null,

    // Remove old fields
    start: undefined,
    end: undefined,
    description: undefined,
    priority: undefined,
    associateWith: undefined, // Remove associateWith completely
    
    // Combine the manually set participants and those from `scheduleWith`
    Participants: [
      {
        type: "email",
        participant: "mahadi.hanshan@gmail.com",
      },
      ...participantsFromScheduleWith, // Add participants from scheduleWith
    ],
  };
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
    id: `${selectedRowData ? selectedRowData.id : "test"}`,
    Type_of_Activity: "",
    startTime: "",
    endTime: "",
    duration: "",
    associateWith: "",
    Event_Title: "",
    resource: 0,
    scheduleFor: "",
    scheduleWith: [],
    Venue: "",
    priority: "",
    ringAlarm: "",
    repeat: "once",
    start: "",
    end: "",
    noEndDate: false,
    description: "",
    color: "#fff",
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
    if(formData.Type_of_Activity !==   "call" && formData.Type_of_Activity !== "todo"){
      const transformedData = transformFormSubmission(formData);
      await ZOHO.CRM.API.insertRecord({
        Entity: "Events",
        APIData: transformedData,
        Trigger: ["workflow"],
      }).then(function (data) {
        console.log(data);
      });
    }else{
      console.log({formData})
    }
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
      <Box height={15}>
        <IconButton
          aria-label="close"
          onClick={() => {
            handleClose();
          }}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
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
        />
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button size="small" disabled>
            Back
          </Button>{" "}
          {/* Back is disabled on first tab */}
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={handleNext}
          >
            Next
          </Button>
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
          onChange={(event) =>
            handleInputChange("description", event.target.value)
          }
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
            color="primary"
            onClick={handleNext}
          >
            Next
          </Button>
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
            Submit
          </Button>{" "}
          {/* Next is disabled on the last tab */}
        </Box>
      </TabPanel>
    </Box>
  );
};

export default EditActivityModal;
