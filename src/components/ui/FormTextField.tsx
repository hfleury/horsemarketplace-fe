import { forwardRef } from 'react';
import TextField from '@mui/material/TextField';
import type { TextFieldProps } from '@mui/material';

const FormTextField = forwardRef<HTMLDivElement, TextFieldProps>((props, ref) => (
  <TextField
    margin="normal"
    fullWidth
    variant="outlined"
    {...props}
    inputRef={ref}
  />
));

export default FormTextField;