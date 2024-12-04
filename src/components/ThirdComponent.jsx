import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid2 as Grid,
  Radio,
  RadioGroup,
  Typography,
  Checkbox,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import CustomTextField from "./atom/CustomTextField";
import { Datepicker } from "@mobiscroll/react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const ThirdComponent = ({ formData, handleInputChange }) => {
  const [openStartDatepicker, setOpenStartDatepicker] = useState(false);
  const [openEndDatepicker, setOpenEndDatepicker] = useState(false);

  useEffect(() => {
    // Initialize startTime, endTime, and occurrence if not already set
    if (!formData.startTime) {
      const currentTime = dayjs().toISOString();
      handleInputChange("startTime", currentTime);
      handleInputChange("endTime", dayjs(currentTime).add(1, "year").toISOString());
    }

    // if (!formData.endTime && formData.startTime) {
    //   const oneHourFromStart = dayjs(formData.startTime).add(1, "hour").toISOString();
    //   handleInputChange("endTime", oneHourFromStart);
    // }

    if (!formData.occurrence) {
      handleInputChange("occurrence", "once"); // Set default occurrence to 'once'
    }
  }, [formData.startTime, formData.endTime, formData.occurrence, handleInputChange]);

  const CustomInputComponent = ({ field }) => {
    const dateValue = formData?.[field];
    const formattedDate =
      dateValue && dayjs(dateValue).isValid()
        ? dayjs(dateValue).format("DD/MM/YYYY hh:mm A")
        : "";

    return (
      <CustomTextField
        fullWidth
        size="small"
        label=""
        variant="outlined"
        value={formattedDate}
        onClick={() =>
          field === "startTime"
            ? setOpenStartDatepicker(true)
            : setOpenEndDatepicker(true)
        }
      />
    );
  };

  return (
    <Box>
      <FormControl>
        <FormLabel id="demo-radio-buttons-group-label">Gender</FormLabel>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          name="radio-buttons-group"
          value={formData.occurrence || "once"} // Default to 'once' if occurrence is undefined
          onChange={(e) => handleInputChange("occurrence", e.target.value)}
        >
          <FormControlLabel
            value="once"
            control={<Radio size="small" />}
            label="Once (This activity occurs only once)"
          />
          <FormControlLabel
            value="daily"
            control={<Radio size="small" />}
            label="Daily (This activity occurs daily)"
          />
          <FormControlLabel
            value="weekly"
            control={<Radio size="small" />}
            label="Weekly (This activity occurs weekly)"
          />
          <FormControlLabel
            value="monthly"
            control={<Radio size="small" />}
            label="Monthly (This activity occurs monthly)"
          />
          <FormControlLabel
            value="yearly"
            control={<Radio size="small" />}
            label="Yearly (This activity occurs yearly)"
          />
        </RadioGroup>
      </FormControl>

      <Grid container spacing={2} sx={{ mt: 1, py: 1 }}>
        <Grid size={6}>
          <Box display="flex" alignItems="center">
            <Typography variant="body1" sx={{ minWidth: "80px" }}>
              Starts:
            </Typography>
            <Datepicker
              controls={["calendar", "time"]}
              calendarType="month"
              display="center"
              calendarScroll={"vertical"}
              inputComponent={() => <CustomInputComponent field="startTime" />}
              onClose={() => setOpenStartDatepicker(false)}
              onChange={(e) => handleInputChange("startTime", e.value)}
              isOpen={openStartDatepicker}
            />
          </Box>
        </Grid>
        <Grid size={6}>
          <Box display="flex" alignItems="center">
            <Typography variant="body1" sx={{ minWidth: "80px" }}>
              Ends:
            </Typography>
            <Datepicker
              controls={["calendar", "time"]}
              calendarType="month"
              display="center"
              disabled={formData.noEndDate}
              calendarScroll={"vertical"}
              inputComponent={() => <CustomInputComponent field="endTime" />}
              onClose={() => setOpenEndDatepicker(false)}
              onChange={(e) => handleInputChange("endTime", e.value)}
              isOpen={openEndDatepicker}
            />
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={formData.noEndDate}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  if (isChecked) {
                    handleInputChange("endTime", ""); // Clear endTime if noEndDate is selected
                    handleInputChange("noEndDate", true);
                  } else if (formData.startTime) {
                    const oneHourFromStart = dayjs(formData.startTime).add(1, "hour").toISOString();
                    handleInputChange("endTime", oneHourFromStart); // Recalculate endTime
                    handleInputChange("noEndDate", false);
                  }
                }}
              />
            }
            label="No end date"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ThirdComponent;
