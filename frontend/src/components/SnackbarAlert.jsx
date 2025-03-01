import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export default function SnackbarAlert({ message, severity, open, onClose }) {
    return (
        <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            open={open}
            autoHideDuration={4000}
            onClose={onClose}
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
                    color: 'white', // White icon to match
                },
            }}>
                {message}
            </Alert>
        </Snackbar>
    );
}