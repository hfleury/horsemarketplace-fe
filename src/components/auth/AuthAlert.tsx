import type { FC } from 'react';
import Alert from '@mui/material/Alert';
import type { AlertColor } from '@mui/material';

interface AuthAlertProps {
  severity: AlertColor;
  message: string;
}

const AuthAlert: FC<AuthAlertProps> = ({ severity, message }) => (
  <Alert severity={severity} sx={{ mt: 2 }}>
    {message}
  </Alert>
);

export default AuthAlert;