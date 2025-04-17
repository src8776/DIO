import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

/**
 * SnackbarAlert.jsx
 * 
 * This React component renders a customizable Snackbar with an Alert for displaying feedback messages to the user.
 * It supports different severity levels (e.g., "error", "success") and auto-hides after a specified duration unless
 * the severity is "error".
 * 
 * Key Features:
 * - Displays a Snackbar with a styled Alert message.
 * - Supports different severity levels for messages (e.g., "error", "success").
 * - Automatically hides after 4 seconds unless the severity is "error".
 * - Allows manual closure of the Snackbar via the `onClose` callback.
 * 
 * Props:
 * - message: String representing the message to display in the Snackbar.
 * - severity: String representing the severity level of the message (e.g., "error", "success").
 * - open: Boolean indicating whether the Snackbar is open.
 * - onClose: Function to handle the closure of the Snackbar.
 * 
 * Dependencies:
 * - Material-UI components: Snackbar, Alert.
 * 
 * @component
 */
export default function SnackbarAlert({ message, severity, open, onClose }) {
    // Only auto-hide if not an error message.
    const autoHideDuration = severity === 'error' ? null : 4000;

    return (
        <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={onClose}
            sx={{ bottom: 20 }}
        >
            <Alert onClose={onClose} severity={severity} variant="outlined"
                sx={{
                    background: severity === 'error'
                        ? 'linear-gradient(45deg, #f44336, #ef5350)'
                        : 'linear-gradient(45deg, #4caf50, #66bb6a)',
                    color: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    '& .MuiAlert-icon': {
                        color: 'white',
                    },
                }}>
                {message}
            </Alert>
        </Snackbar>
    );
}