import {
    Box,
    FormControl,
    FormControlLabel,
    FormLabel,
    Grid,
    Radio,
    RadioGroup,
    TextField,
    Typography,
  } from "@mui/material";
  import React from "react";
  
  const ThirdComponent = ({ formData, handleInputChange }) => {
    return (
      <Box>
        <FormControl>
          <FormLabel id="demo-radio-buttons-group-label">Gender</FormLabel>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="once"
            name="radio-buttons-group"
            value={formData.gender}
            onChange={(e) => handleInputChange("gender", e.target.value)}
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
          <Grid item xs={6}>
            <Box display="flex" alignItems="center">
              <Typography variant="body1" sx={{ minWidth: "80px" }}>
                Starts :
              </Typography>
              <TextField
                fullWidth
                size="small"
                label=""
                variant="outlined"
                value={formData.starts}
                onChange={(e) => handleInputChange("start", e.target.value)}
              />
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center">
              <Typography variant="body1" sx={{ minWidth: "80px" }}>
                Ends :
              </Typography>
              <TextField
                fullWidth
                size="small"
                label=""
                variant="outlined"
                value={formData.ends}
                onChange={(e) => handleInputChange("end", e.target.value)}
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Radio size="small" />}
              label="No end date"
              value="no end date"
              onChange={(e) => handleInputChange("noEndDate", e.target.checked)}
            />
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  export default ThirdComponent;
  