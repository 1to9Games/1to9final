
  // components/LoadingOverlay.jsx
  import React from "react";
  import { Spinner, Typography } from "@material-tailwind/react";
  
  const LoadingOverlay = ({ message = "Loading..." }) => (
    <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-50">
      <Spinner className="h-8 w-8 mb-4" />
      <Typography color="blue-gray">{message}</Typography>
    </div>
  );
  
  export default LoadingOverlay;