import React from 'react';
import { TextField } from '@mui/material';

const CustomTextField = ({ onChange, value, ...props }) => {
  return (
    <TextField
      variant="outlined"
      size="small"
      fullWidth
      autoComplete='off'
      value={value}
      onChange={onChange}
      {...props} 
      sx={{
        '& .MuiOutlinedInput-root': {
          padding: '2px', 
        
        },
      }}
    />
  );
};

export default CustomTextField;
