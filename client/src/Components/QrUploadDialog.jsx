// import { useContext, useState } from "react";
// import {
//   Button,
//   Dialog,
//   DialogHeader,
//   DialogBody,
//   DialogFooter,
//   Input,
//   Typography,
//   Tabs,
//   TabsHeader,
//   Tab,
// } from "@material-tailwind/react";
// import toast from "react-hot-toast";
// import { SocketContext } from "../context/SocketContext";
// import { AppContext } from '../context/AppContext';

// const QRUploadDialog = ({ open, handleOpen }) => {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [ifscCode, setIfscCode] = useState("");
//   const [accountNumber, setAccountNumber] = useState("");
//   const [selectedAccount, setSelectedAccount] = useState("account1");
//   const [imageUrl, setImageUrl] = useState(null);
//   const { socket } = useContext(SocketContext);
//   const { url } = useContext(AppContext);

//   if (!socket) {
//     console.error("Socket instance is not available");
//   }

//   const handleFileSelect = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       if (!file.type.startsWith("image/")) {
//         toast.error("Please upload an image file");
//         return;
//       }

//       if (file.size > 5 * 1024 * 1024) {
//         toast.error("File size should be less than 5MB");
//         return;
//       }

//       setSelectedFile(file);
//       const fileReader = new FileReader();
//       fileReader.onload = () => {
//         setPreviewUrl(fileReader.result);
//       };
//       fileReader.readAsDataURL(file);
//     }
//   };

//   const handleIfscChange = (event) => {
//     setIfscCode(event.target.value.toUpperCase());
//   };

//   const handleAccountNumberChange = (event) => {
//     setAccountNumber(event.target.value);
//   };

//   const validateIfsc = (ifsc) => {
//     // Removed the strict IFSC validation
//     return ifsc.length > 0;
//   };

//   const validateAccountNumber = (accNum) => {
//     const accNumRegex = /^\d{9,18}$/;
//     return accNumRegex.test(accNum);
//   };
//   const updateDetails = async ( ifscCode, accountNumber) => {
//     try {
//       console.log("sent in backend")
//       const response = await fetch(
//         `${url}/api/auth/update-game-details`,
//         {
//           method: "PUT",
//           headers: {

//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             selectedAccount,
//             ifscCode,
//             accountNumber,
//           }),
//         }
//       );
  
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || "Failed to update QR details");
//       }

//       return data;
//     } catch (error) {
//       console.error("API Error:", error);
//       throw error;
//     }
//   };
//   const updateQROnly = async (imageUrl) => {
//     try {
//       console.log("sent in backend qr only")
//       const response = await fetch(
//         `${url}/api/auth/update-game-qr-only`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             imageUrl,
//             selectedAccount,
//           }),
//         }
//       );
  
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || "Failed to update QR details");
//       }

//       return data;
//     } catch (error) {
//       console.error("API Error:", error);
//       throw error;
//     }
//   };

//   const sendQr = (qrImageUrl) => {
//     socket.emit("QR-Img", {
//       qr: qrImageUrl,
//       ifscCode: ifscCode,
//       accountNumber: accountNumber,
//       selectedAccount: selectedAccount,
//     });
//   };
//   const sendQrONly = (qrImageUrl) => {
//     socket.emit("QR-only", {
//       qr: qrImageUrl,
//       selectedAccount: selectedAccount,
//     });
//   };

//   const handleUploadQROnly = async () => {
//     if (!selectedFile) {
//       toast.error("Please select a file first");
//       return;
//     }
//     const formData = new FormData();
//     formData.append("file", selectedFile);
//     formData.append("upload_preset", "DepositQR");

//     try {
//       const response = await fetch(
//         `https://api.cloudinary.com/v1_1/dizqoedta/image/upload`,
//         {
//           method: "POST",
//           body: formData,
//         }
//       );
//       const data = await response.json();

//       if (response.ok) {
//         const imageUrl = data.secure_url || data.url;

//         await updateQROnly(imageUrl);
//         sendQrONly(imageUrl);
//         setImageUrl(imageUrl);
//         console.log("sent in socket qr only")


//         toast.success("QR image and bank details updated successfully");
//         handleClose();
//       } else {
//         throw new Error("Failed to upload QR image");
//       }
//     } catch (error) {
//       console.error("Upload Error:", error);
//       toast.error("Failed to update QR details");
//     } finally {
//       setLoading(false);
//     }

//   }


//   const handleUpload = async () => {

//     if (!ifscCode) {
//       toast.error("Please enter IFSC Code");
//       return;
//     }

//     if (!accountNumber) {
//       toast.error("Please enter Account Number");
//       return;
//     }

//     if (!validateIfsc(ifscCode)) {
//       toast.error("Please enter a valid IFSC Code");
//       return;
//     }

//     if (!validateAccountNumber(accountNumber)) {
//       toast.error("Please enter a valid Account Number (9-18 digits)");
//       return;
//     }

//     setLoading(true);
//     const formData = new FormData();
//     formData.append("file", selectedFile);
//     formData.append("upload_preset", "DepositQR");

   

//     await updateDetails( ifscCode, accountNumber);
//         console.log("updeted succcessfully in backend")

//         sendQr(imageUrl);
//         console.log("sent in socket")

//         toast.success("Bank details updated successfully");
//         handleClose();
//        setLoading(false);
    

//   };

//   const handleClose = () => {
//     setSelectedFile(null);
//     setPreviewUrl(null);
//     setIfscCode("");
//     setAccountNumber("");
//     handleOpen(false);
//   };

 
//   return (
//     <Dialog open={open} handler={handleOpen}
//     animate={{
//       mount: { scale: 1, y: 0 },
//       unmount: { scale: 0.9, y: -100 },
//     }}
//     className="fixed inset-0 z-[999] grid h-[calc(100vh-2rem)] w-full max-w-[98%] sm:max-w-[80%] lg:max-w-[60%] mx-auto overflow-auto"
//   >
//     <div className="flex flex-col h-full overflow-hidden">
//       <DialogHeader className="flex-shrink-0 text-black text-lg sm:text-xl p-4">
//         Update Account Details
//       </DialogHeader>

//       <div className="px-4">
//         <Tabs value={selectedAccount} className="w-full">
//           <TabsHeader>
//             <Tab value="account1" onClick={() => setSelectedAccount("account1")}>
//               Account 1
//             </Tab>
//             <Tab value="account2" onClick={() => setSelectedAccount("account2")}>
//               Account 2
//             </Tab>
//           </TabsHeader>
//         </Tabs>
//       </div>

//       <DialogBody 
//         className="flex-grow overflow-y-auto p-4 space-y-6"
//         style={{ maxHeight: 'calc(100vh - 200px)' }}
//       >
//         <div className="flex flex-col gap-6">
//           {/* QR Upload Section */}
//           <div className="border-b pb-6">
//             <Typography variant="h6" className="text-black mb-4">
//               Update QR Image
//             </Typography>
//             <div className="w-full">
//               <Input
//                 type="file"
//                 label="Choose QR Image"
//                 accept="image/*"
//                 onChange={handleFileSelect}
//                 className="text-black"
//                 variant="standard"
//               />
//               <Typography variant="small" className="mt-2 text-gray-400">
//                 Supported formats: PNG, JPG, JPEG. Max size: 5MB
//               </Typography>
//             </div>

//             {previewUrl && (
//               <div className="mt-4 max-w-full sm:max-w-[300px] w-full">
//                 <Typography variant="h6" className="mb-2 text-black">
//                   Preview
//                 </Typography>
//                 <img
//                   src={previewUrl}
//                   alt="QR Preview"
//                   className="w-full h-auto rounded-lg border border-gray-500"
//                 />
//               </div>
//             )}
//             <Button
//               variant="gradient"
//               color="blue"
//               onClick={handleUploadQROnly}
//               disabled={loading}
//               className="w-full sm:w-auto"
//             >

//               {loading ? "Updating QR..." : "Update QR"}
//             </Button>
//           </div>
//           {/* Bank Details Section */}
//           <div>

//             <Typography variant="h6" className="text-black mb-4">
//               Update Bank Details
//             </Typography>
//             <div className="space-y-4">
//               <div className="w-full">
//                 <Input
//                   type="text"
//                   label="Enter IFSC Code"
//                   value={ifscCode}
//                   onChange={handleIfscChange}
//                   className="text-black"
//                   variant="standard"
//                 />
//                 <Typography variant="small" className="mt-2 text-gray-400">
                
//                 </Typography>
//               </div>

//               <div className="w-full">
//                 <Input
//                   type="text"
//                   label="Enter Account Number"
//                   value={accountNumber}
//                   onChange={handleAccountNumberChange}
//                   className="text-black"
//                   variant="standard"
//                 />
//                 <Typography variant="small" className="mt-2 text-gray-400">
//                   Format: 9-18 digits
//                 </Typography>
//               </div>

//               <Button
//                 variant="gradient"
//                 color="blue"
//                 onClick={handleUpload}
//                 disabled={(!ifscCode && !accountNumber) || loading}
//                 className="w-full sm:w-auto"
//               >
//                 {loading ? "Updating Details..." : "Update Details"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </DialogBody>

//       <DialogFooter className="flex-shrink-0 p-4">
//         <Button
//           variant="text"
//           color="red"
//           onClick={handleClose}
//           className="w-full sm:w-auto"
//         >
//           Close
//         </Button>
//       </DialogFooter>
//     </div>
//   </Dialog>
//   );
// };

// export default QRUploadDialog;


import { useContext, useState } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Typography,
  Tabs,
  TabsHeader,
  Tab,
} from "@material-tailwind/react";
import toast from "react-hot-toast";
import { SocketContext } from "../context/SocketContext";
import { AppContext } from '../context/AppContext';

const QRUploadDialog = ({ open, handleOpen }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ifscCode, setIfscCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("account1");
  const [imageUrl, setImageUrl] = useState(null);
  const { 
    socket, 
    imgUrl1, 
    imgUrl2, 
    ifscCode1, 
    ifscCode2, 
    accountNumber1, 
    accountNumber2 
  } = useContext(SocketContext);
  const { url } = useContext(AppContext);

  if (!socket) {
    console.error("Socket instance is not available");
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      setSelectedFile(file);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleIfscChange = (event) => {
    setIfscCode(event.target.value.toUpperCase());
  };

  const handleAccountNumberChange = (event) => {
    setAccountNumber(event.target.value);
  };

  const validateIfsc = (ifsc) => {
    return ifsc.length > 0;
  };

  const validateAccountNumber = (accNum) => {
    const accNumRegex = /^\d{9,18}$/;
    return accNumRegex.test(accNum);
  };

  const updateDetails = async (ifscCode, accountNumber) => {
    try {
      const response = await fetch(
        `${url}/api/auth/update-game-details`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            selectedAccount,
            ifscCode,
            accountNumber,
          }),
        }
      );
  
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update QR details");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  const updateQROnly = async (imageUrl) => {
    try {
      const response = await fetch(
        `${url}/api/auth/update-game-qr-only`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl,
            selectedAccount,
          }),
        }
      );
  
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update QR details");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  const sendQr = (qrImageUrl) => {
    socket.emit("QR-Img", {
      qr: qrImageUrl,
      ifscCode: ifscCode,
      accountNumber: accountNumber,
      selectedAccount: selectedAccount,
    });
  };

  const sendQrONly = (qrImageUrl) => {
    socket.emit("QR-only", {
      qr: qrImageUrl,
      selectedAccount: selectedAccount,
    });
  };

  const handleUploadQROnly = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("upload_preset", "DepositQR");

    try {
      setLoading(true);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dizqoedta/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();

      if (response.ok) {
        const imageUrl = data.secure_url || data.url;
        await updateQROnly(imageUrl);
        sendQrONly(imageUrl);
        setImageUrl(imageUrl);
        setSelectedFile(null);
        setPreviewUrl(null);
        toast.success("QR image updated successfully");
      } else {
        throw new Error("Failed to upload QR image");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Failed to update QR details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!ifscCode) {
      toast.error("Please enter IFSC Code");
      return;
    }

    if (!accountNumber) {
      toast.error("Please enter Account Number");
      return;
    }

    if (!validateIfsc(ifscCode)) {
      toast.error("Please enter a valid IFSC Code");
      return;
    }

    if (!validateAccountNumber(accountNumber)) {
      toast.error("Please enter a valid Account Number (9-18 digits)");
      return;
    }

    setLoading(true);
    try {
      await updateDetails(ifscCode, accountNumber);
      sendQr(imageUrl);
      setIfscCode("");
      setAccountNumber("");
      toast.success("Bank details updated successfully");
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Failed to update bank details");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIfscCode("");
    setAccountNumber("");
    handleOpen(false);
  };

  // Get current account details based on selection
  const currentQR = selectedAccount === "account1" ? imgUrl1 : imgUrl2;
  const currentIFSC = selectedAccount === "account1" ? ifscCode1 : ifscCode2;
  const currentAccountNumber = selectedAccount === "account1" ? accountNumber1 : accountNumber2;

  return (
    <Dialog 
      open={open} 
      handler={handleOpen}
      animate={{
        mount: { scale: 1, y: 0 },
        unmount: { scale: 0.9, y: -100 },
      }}
      className="fixed inset-0 z-[999] grid h-[calc(100vh-2rem)] w-full max-w-[98%] sm:max-w-[80%] lg:max-w-[60%] mx-auto overflow-auto bg-gray-900"
    >
      <div className="flex flex-col h-full overflow-hidden">
        <DialogHeader className="flex-shrink-0 text-white text-lg sm:text-xl p-4 bg-black/20 backdrop-blur-sm">
          Update Account Details
        </DialogHeader>

        <div className="px-4 bg-black/20 backdrop-blur-sm">
          <Tabs value={selectedAccount} className="w-full">
            <TabsHeader
              className="bg-black/50 rounded-lg"
              indicatorProps={{
                className: "bg-red-900/85 rounded-lg",
              }}
            >
              <Tab 
                value="account1" 
                onClick={() => setSelectedAccount("account1")}
                className="text-gray-300 hover:text-white"
              >
                Account 1
              </Tab>
              <Tab 
                value="account2" 
                onClick={() => setSelectedAccount("account2")}
                className="text-gray-300 hover:text-white"
              >
                Account 2
              </Tab>
            </TabsHeader>
          </Tabs>
        </div>

        <DialogBody 
          className="flex-grow overflow-y-auto p-4 space-y-6 bg-black/20 backdrop-blur-sm"
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        >
          <div className="flex flex-col gap-6">
            {/* Current QR Display */}
            {currentQR && (
              <div className="p-4 bg-black/50 rounded-lg border border-gray-600">
                <Typography variant="h6" className="text-white mb-4">
                  Current QR Code
                </Typography>
                <div className="max-w-[200px] mx-auto mb-4">
                  <img
                    src={currentQR}
                    alt="Current QR Code"
                    className="w-full h-auto rounded-lg border border-gray-600"
                  />
                </div>
                {currentIFSC && (
                  <Typography variant="small" className="text-gray-300 mb-2">
                    Current IFSC: {currentIFSC}
                  </Typography>
                )}
                {currentAccountNumber && (
                  <Typography variant="small" className="text-gray-300">
                    Current Account: {currentAccountNumber}
                  </Typography>
                )}
              </div>
            )}

            {/* QR Upload Section */}
            <div className="p-4 bg-black/50 rounded-lg border border-gray-600">
              <Typography variant="h6" className="text-white mb-4">
                Update QR Image
              </Typography>
              <div className="w-full">
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 bg-black/30">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full text-sm text-gray-300"
                  />
                  <Typography variant="small" className="mt-2 text-gray-400">
                    Supported formats: PNG, JPG, JPEG. Max size: 5MB
                  </Typography>
                </div>
              </div>

              {previewUrl && (
                <div className="mt-4 max-w-full sm:max-w-[300px] w-full">
                  <Typography variant="h6" className="mb-2 text-white">
                    Preview
                  </Typography>
                  <img
                    src={previewUrl}
                    alt="QR Preview"
                    className="w-full h-auto rounded-lg border border-gray-600"
                  />
                </div>
              )}
              <Button
                variant="gradient"
                color="red"
                onClick={handleUploadQROnly}
                disabled={loading}
                className="w-full sm:w-auto mt-4 bg-red-900/85 hover:bg-red-900"
              >
                {loading ? "Updating QR..." : "Update QR"}
              </Button>
            </div>

            {/* Bank Details Section */}
            <div className="p-4 bg-black/50 rounded-lg border border-gray-600">
              <Typography variant="h6" className="text-white mb-4">
                Update Bank Details
              </Typography>
              <div className="space-y-4">
                <div className="w-full">
                  <Input
                    type="text"
                    label="Enter IFSC Code"
                    value={ifscCode}
                    onChange={handleIfscChange}
                    className="!text-white !border-gray-600 focus:!border-red-900"
                    labelProps={{
                      className: "!text-gray-400"
                    }}
                    containerProps={{
                      className: "!bg-black/30"
                    }}
                  />
                </div>

                <div className="w-full">
                  <Input
                    type="text"
                    label="Enter Account Number"
                    value={accountNumber}
                    onChange={handleAccountNumberChange}
                    className="!text-white !border-gray-600 focus:!border-red-900"
                    labelProps={{
                      className: "!text-gray-400"
                    }}
                    containerProps={{
                      className: "!bg-black/30"
                    }}
                  />
                  <Typography variant="small" className="mt-2 text-gray-400">
                    Format: 9-18 digits
                  </Typography>
                </div>

                <Button
                  variant="gradient"
                  color="red"
                  onClick={handleUpload}
                  disabled={(!ifscCode && !accountNumber) || loading}
                  className="w-full sm:w-auto bg-red-900/85 hover:bg-red-900"
                >
                  {loading ? "Updating Details..." : "Update Details"}
                </Button>
              </div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="flex-shrink-0 p-4 bg-black/20 backdrop-blur-sm">
          <Button
            variant="text"
            color="red"
            onClick={handleClose}
            className="w-full sm:w-auto text-red-500 hover:bg-red-900/20"
          >
            Close
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
};

export default QRUploadDialog;