import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ThemeProvider } from "@material-tailwind/react";
import { BrowserRouter } from "react-router-dom";
import AppContextProvider from "./context/AppContext.jsx";
import  { Toaster } from 'react-hot-toast';
import { SocketProvider } from "./context/SocketContext.jsx";



createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppContextProvider>
      <SocketProvider>
        <ThemeProvider>
          <App />
          <Toaster  position="top-center"
        toastOptions={{
          style: {
            zIndex: 9999, // Ensure this is higher than the dialog
          },
        }} />
        </ThemeProvider>
      </SocketProvider>
    </AppContextProvider>
  </BrowserRouter>
);
