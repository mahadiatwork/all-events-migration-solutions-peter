import React, { useState, useEffect } from "react";
import { Box, Button, IconButton, Tab, Tabs } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FirstComponent from "./FirstComponent";
import SecondComponent from "./SecondComponent";
import ThirdComponent from "./ThirdComponent";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function TabPanel({ children, value, index, ...other }) {
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

const EditActivityModal = ({ open, handleClose, selectedRowData }) => {
  const [value, setValue] = useState(0);
  const [formData, setFormData] = useState({
    id: `job1`,
    title: "",
    startTime: "",
    endTime: "",
    duration: "",
    associateWith: "",
    regarding: "",
    priority: "",
    ringAlarm: "",
    gender: "once",
    start: "",
    end: "",
    noEndDate: false,
    quillContent: "",
    color: "#d1891f",
  });

  // Map data from JSON to form fields
  useEffect(() => {

    if (selectedRowData && selectedRowData.length > 0) {
      const event = selectedRowData;; // Use the first event as an example
      setFormData({
        id: event.id || `job1`,
        title: event.Event_Title || "",
        startTime: event.Start_DateTime || "",
        endTime: event.End_DateTime || "",
        duration: calculateDuration(event.Start_DateTime, event.End_DateTime),
        associateWith: event.What_Id ? event.What_Id.name : "",
        regarding: event.Description || "",
        priority: event.Priority || "",
        ringAlarm: event.Remind_At || "",
        gender: "once", // Assuming default value
        start: event.Start_DateTime || "",
        end: event.End_DateTime || "",
        noEndDate: false,
        quillContent: event.Full_Description || "",
        color: "#d1891f", // Assuming default color
      });
    } else {
      setFormData({
        id: `job1`,
        title: "",
        startTime: "",
        endTime: "",
        duration: "",
        associateWith: "",
        regarding: "",
        priority: "",
        ringAlarm: "",
        gender: "once",
        start: "",
        end: "",
        noEndDate: false,
        quillContent: "",
        color: "#d1891f",
      });
    }
  }, [selectedRowData]);

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
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("Form Data Submitted:", formData);
    handleClose(); // Close the modal after submission
  };

  if (!open) return null; // Return nothing if modal is closed

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
          onClick={handleClose} // Use the passed handleClose function
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
          <Tab label="Recurrence" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <FirstComponent
          formData={formData}
          handleInputChange={handleInputChange}
        />
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button size="small" disabled>
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
      <TabPanel value={value} index={1}>
        <ReactQuill
          theme="snow"
          style={{ height: 250, marginBottom: 80 }}
          value={formData.quillContent}
          onChange={(content) => handleInputChange("quillContent", content)}
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
            {selectedRowData ? "Save Changes" : "Create Event"}
          </Button>
        </Box>
      </TabPanel>
    </Box>
  );
};

// Utility function to calculate duration between two times
const calculateDuration = (start, end) => {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const durationMs = endTime - startTime;
  const durationMinutes = Math.floor(durationMs / (1000 * 60));
  return `${durationMinutes} minutes`;
};

export default EditActivityModal;
