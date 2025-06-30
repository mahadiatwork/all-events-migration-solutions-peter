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

const ThirdComponent = ({ formData, handleInputChange, selectedRowData }) => {
  const [openStartDatepicker, setOpenStartDatepicker] = useState(false);
  const [openEndDatepicker, setOpenEndDatepicker] = useState(false);

  useEffect(() => {
    const rrule = selectedRowData?.Recurring_Activity?.RRULE;

    if (rrule) {
      const rruleParts = rrule.split(";");
      const rruleMap = {};
      rruleParts.forEach((part) => {
        const [key, value] = part.split("=");
        rruleMap[key] = value;
      });

      const freq = rruleMap["FREQ"]?.toLowerCase();
      const dtStartDate = rruleMap["DTSTART"];
      const untilDate = rruleMap["UNTIL"];

      const startTime = selectedRowData?.Start_DateTime
        ? dayjs(selectedRowData.Start_DateTime)
        : dayjs().hour(9).minute(0).second(0);

      const endTime = selectedRowData?.End_DateTime
        ? dayjs(selectedRowData.End_DateTime)
        : dayjs().hour(17).minute(0).second(0);

      if (freq) handleInputChange("occurrence", freq);

      if (dtStartDate) {
        const datePart = dayjs(dtStartDate);
        const mergedStart = datePart
          .hour(startTime.hour())
          .minute(startTime.minute())
          .second(0);
        handleInputChange("startTime", mergedStart.toISOString());
      }

      if (untilDate) {
        const datePart = dayjs(untilDate);
        const mergedEnd = datePart
          .hour(endTime.hour())
          .minute(endTime.minute())
          .second(0);
        handleInputChange("endTime", mergedEnd.toISOString());
      }

      handleInputChange("noEndDate", false); // Ensure checkbox logic is skipped
    } else {
      const timeStart = dayjs(formData.start);
      const timeEnd = dayjs(formData.end);
      handleInputChange("startTime");
      handleInputChange("endTime");

      console.log({ startTime:timeStart.toISOString(), endTIME:  timeEnd.toISOString()});

      if (!formData.startTime) {
        const currentTime = dayjs().toISOString();
        handleInputChange("startTime", currentTime);
        handleInputChange(
          "endTime",
          dayjs(currentTime).add(1, "hour").toISOString()
        );
      }

      if (!formData.occurrence) {
        handleInputChange("occurrence", "once");
      }
    }
  }, [formData.start, formData.end]);

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

  const isRecurring = !!selectedRowData?.Recurring_Activity?.RRULE;

  return (
    <Box>
      <FormControl>
        <FormLabel id="demo-radio-buttons-group-label" sx={{ fontSize: "9pt" }}>
          Frequency
        </FormLabel>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          name="radio-buttons-group"
          value={formData.occurrence || "once"}
          onChange={(e) => handleInputChange("occurrence", e.target.value)}
        >
          {["once", "daily", "weekly", "monthly", "yearly"].map((option) => (
            <FormControlLabel
              key={option}
              value={option}
              control={<Radio size="small" />}
              label={`${
                option.charAt(0).toUpperCase() + option.slice(1)
              } (This activity occurs ${option})`}
              sx={{ "& .MuiTypography-root": { fontSize: "9pt" } }}
            />
          ))}
        </RadioGroup>
      </FormControl>

      <Grid container spacing={2} sx={{ mt: 1, py: 1 }}>
        <Grid size={6}>
          <Box display="flex" alignItems="center">
            <Typography
              variant="body1"
              sx={{ fontSize: "9pt", minWidth: "80px" }}
            >
              Starts:
            </Typography>
            <Datepicker
              controls={["calendar", "time"]}
              calendarType="month"
              display="center"
              calendarScroll={"vertical"}
              disabled={isRecurring}
              inputComponent={() => {
                const dateValue = formData?.startTime;
                const formattedDate =
                  dateValue && dayjs(dateValue).isValid()
                    ? dayjs(dateValue).format("DD/MM/YYYY hh:mm A")
                    : "";
                return (
                  <CustomInputComponent
                    field="startTime"
                    formattedDate={formattedDate}
                  />
                );
              }}
              onClose={() => setOpenStartDatepicker(false)}
              onChange={(e) => handleInputChange("startTime", e.value)}
              isOpen={openStartDatepicker}
            />
          </Box>
        </Grid>
        <Grid size={6}>
          <Box display="flex" alignItems="center">
            <Typography
              variant="body1"
              sx={{ fontSize: "9pt", minWidth: "80px" }}
            >
              Ends:
            </Typography>
            <Datepicker
              controls={["calendar", "time"]}
              calendarType="month"
              display="center"
              disabled={isRecurring}
              calendarScroll={"vertical"}
              min={dayjs(formData.startTime).format("YYYY-MM-DD")}
              max={dayjs(formData.startTime)
                .add(1, "year")
                .format("YYYY-MM-DD")}
              inputComponent={() => {
                const dateValue = formData?.endTime;
                const formattedDate =
                  dateValue && dayjs(dateValue).isValid()
                    ? dayjs(dateValue).format("DD/MM/YYYY hh:mm A")
                    : "";
                return (
                  <CustomInputComponent
                    field="endTime"
                    formattedDate={formattedDate}
                  />
                );
              }}
              onClose={() => setOpenEndDatepicker(false)}
              onChange={(e) => {
                const selectedDate = dayjs(e.value); // Only take the date part
                const currentTime = dayjs(formData?.endTime); // Only take the time part

                // Merge: use the date from selectedDate, and time from currentTime
                const mergedDateTime = selectedDate
                  .hour(currentTime.hour())
                  .minute(currentTime.minute())
                  .second(currentTime.second());

                handleInputChange("endTime", mergedDateTime);
              }}
              isOpen={openEndDatepicker}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ThirdComponent;
