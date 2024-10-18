import React, { useState } from "react";
import "@mobiscroll/react/dist/css/mobiscroll.min.css";
import { Box, Button, IconButton, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
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
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  const timezoneOffset = -date.getTimezoneOffset();
  const offsetSign = timezoneOffset >= 0 ? "+" : "-";
  const offsetHours = pad(Math.floor(Math.abs(timezoneOffset) / 60));
  const offsetMinutes = pad(Math.abs(timezoneOffset) % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
}

function transformFormSubmission(data) {
  const transformScheduleWithToParticipants = (scheduleWith) => {
    return scheduleWith.map((contact) => ({
      Email: contact.Email || null,
      name: contact.Full_Name || null,
      invited: false,
      type: "contact",
      participant: contact.id || null,
      status: "not_known",
    }));
  };

  const participantsFromScheduleWith = data.scheduleWith
    ? transformScheduleWithToParticipants(data.scheduleWith)
    : [];

  let transformedData = {
    ...data,
    Start_DateTime: formatDateWithOffset(data.start),
    End_DateTime: formatDateWithOffset(data.end),
    Description: data.description,
    Event_Priority: data.priority,
    What_Id: data.associateWith
      ? { id: data.associateWith.id || null }
      : null,
    se_module: "Accounts",
    Participants: [...participantsFromScheduleWith],
  };

  delete transformedData.scheduleWith;
  delete transformedData.scheduleFor;
  delete transformedData.description;

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
    Regarding: "",
    Duration_Min: "",
  });

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
    const transformedData = transformFormSubmission(formData);
    await ZOHO.CRM.API.insertRecord({
      Entity: "Events",
      APIData: transformedData,
      Trigger: ["workflow"],
    })
      .then((data) => {
        if (data.data && data.data.length > 0 && data.data[0].code === "SUCCESS") {
          window.location.reload();
        }
      })
      .catch((error) => {
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
      <Box height={15}>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange} textColor="inherit" aria-label="simple tabs example">
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
          <Button size="small" disabled>
            Back
          </Button>
          <Button size="small" variant="contained" color="primary" onClick={handleNext}>
            Next
          </Button>
        </Box>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Typography variant="h6">Description</Typography>
        <TextField
          multiline
          rows={10}
          fullWidth
          value={formData.description}
          onChange={(event) => handleInputChange("description", event.target.value)}
        />
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button size="small" variant="contained" color="primary" onClick={handleBack}>
            Back
          </Button>
          <Button size="small" variant="contained" color="primary" onClick={handleNext}>
            Next
          </Button>
        </Box>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <ThirdComponent formData={formData} handleInputChange={handleInputChange} />
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button size="small" variant="contained" color="primary" onClick={handleBack}>
            Back
          </Button>
          <Button size="small" variant="contained" color="secondary" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </TabPanel>
    </Box>
  );
};

export default CreateActivityModal;
