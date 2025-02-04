
  // components/ErrorAlert.jsx
  import React from "react";
  import { Alert } from "@material-tailwind/react";
  
  const ErrorAlert = ({ message, onClose }) => (
    <Alert
      color="red"
      variant="outlined"
      className="mb-4"
      onClose={onClose}
    >
      {message}
    </Alert>
  );
  
  export default ErrorAlert;