import { useContext, useState, useEffect } from "react";
import { SocketContext } from "../context/SocketContext";
import { AppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Tab, Tabs, TabsHeader } from "@material-tailwind/react";
import { X } from "lucide-react";

const DepositSection = () => {
  const {
    imgUrl1,
    ifscCode1,
    accountNumber1,
    imgUrl2,
    ifscCode2,
    accountNumber2,
  } = useContext(SocketContext);
  const { account, url } = useContext(AppContext);
  const [selectedMethod, setSelectedMethod] = useState("QR/UPI");
  const [selectedAccount, setSelectedAccount] = useState("account1");
  const [depositAmount, setDepositAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [senderAccountNumber, setSenderAccountNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showZoomedQR, setShowZoomedQR] = useState(false);
  const [zoomedQRUrl, setZoomedQRUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!account) navigate("/login");
  }, [account, navigate]);

  const handleQRClick = (qrUrl) => {
    setZoomedQRUrl(qrUrl);
    setShowZoomedQR(true);
    // Prevent body scrolling when modal is open

  };

  const handleCloseZoom = () => {
    setShowZoomedQR(false);
    setZoomedQRUrl("");
    // Restore body scrolling
    document.body.style.overflow = 'unset';
  };

  const handleScreenshotChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size should be less than 2MB");
      return;
    }

    setScreenshot(file);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "DepositQR");

    try {
      setIsLoading(true);
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dizqoedta/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (response.ok) {
        setScreenshotUrl(data.secure_url || data.url);
        toast.success("Screenshot uploaded successfully");
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitDeposit = async (e) => {
    e.preventDefault();

    try {
      if (!depositAmount || !transactionId || !screenshotUrl) {
        toast.error("Please fill in all required fields including screenshot");
        return;
      }

      if (depositAmount < 100) {
        toast.error("Minimum deposit amount is ₹100");
        return;
      }

      const depositData = {
        userId: account.user._id,
        name: account.user.name,
        depositAmount: Number(depositAmount),
        transactionId,
        proofImgUrl: screenshotUrl,
      };
      setIsSubmitting(true);

      const response = await fetch(`${url}/api/auth/deposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(depositData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Deposit request submitted successfully");
        setDepositAmount("");
        setTransactionId("");
        setScreenshot(null);
        setScreenshotUrl("");
        setSenderAccountNumber("");
      } else {
        throw new Error(data.message || "Failed to submit deposit request");
      }
    } catch (error) {
      console.error("Deposit Error:", error);
      toast.error(error.message || "Failed to process deposit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAccountDetails = (accountNumber, ifscCode, qrUrl) => (
    <div className="space-y-4">
      <div className="w-full max-w-xs mx-auto mb-6">
        {qrUrl ? (
          <div 
            className="w-48 h-48 md:w-64 md:h-64 mx-auto bg-white/10 rounded-lg overflow-hidden backdrop-blur-sm border border-gray-600 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-900/20"
            onClick={() => handleQRClick(qrUrl)}
          >
            <img
              src={qrUrl}
              alt="Payment QR Code"
              className="w-full h-full object-contain p-2"
            />
          </div>
        ) : (
          <div className="w-48 h-48 md:w-64 md:h-64 mx-auto bg-black/50 rounded-lg border border-gray-600 flex items-center justify-center">
            <p className="text-gray-400 text-center px-4">QR Code not available</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="p-3 md:p-4 bg-black/50 rounded-lg border border-gray-600">
          <p className="text-xs md:text-sm text-gray-300">Account Number</p>
          <p className="text-sm md:text-base text-white font-medium">
            {accountNumber || 'Not available'}
          </p>
        </div>
        <div className="p-3 md:p-4 bg-black/50 rounded-lg border border-gray-600">
          <p className="text-xs md:text-sm text-gray-300">IFSC Code</p>
          <p className="text-sm md:text-base text-white font-medium">
            {ifscCode || 'Not available'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="w-full bg-black/20 backdrop-blur-sm p-4 md:p-6 rounded-lg">
        <div className="mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
            Deposit Funds
          </h2>
          <p className="text-sm md:text-base text-gray-300">
            Select your preferred account for deposit
          </p>
        </div>

        <div className="flex justify-center space-x-2 md:space-x-4 mb-6">
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

        <div className="mb-6">
          {selectedAccount === "account1"
            ? renderAccountDetails(accountNumber1, ifscCode1, imgUrl1)
            : renderAccountDetails(accountNumber2, ifscCode2, imgUrl2)}
        </div>

        <form onSubmit={handleSubmitDeposit} className="space-y-4 md:space-y-6">
        <input
          type="number"
          placeholder="Deposit Amount (₹)"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          min="100"
          required
          className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base rounded-lg bg-black/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
        />

        <input
          type="text"
          placeholder="Transaction ID/UPI Reference"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          required
          className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base rounded-lg bg-black/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
        />

        <div className="border-2 border-dashed border-gray-600 rounded-lg p-3 md:p-4 bg-black/30">
          <p className="text-sm md:text-base text-gray-300 mb-2">Upload Payment Screenshot</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleScreenshotChange}
            className="w-full text-sm md:text-base text-gray-300"
            required
            disabled={isLoading}
          />
          {isLoading && (
            <p className="text-xs md:text-sm text-gray-400 mt-2">
              Uploading screenshot...
            </p>
          )}
          {screenshot && (
            <p className="text-xs md:text-sm text-green-400 mt-2">
              Screenshot selected: {screenshot.name}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full bg-red-900/85 text-white py-2.5 md:py-3 px-4 rounded-lg text-sm md:text-base font-medium hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-900 focus:ring-offset-2 focus:ring-offset-black transition duration-200 active:transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Deposit Request'}
        </button>
      </form>

      <div className="mt-4 md:mt-6 p-3 md:p-4 bg-black/30 backdrop-blur-sm rounded-lg border border-gray-600">
          <h3 className="text-base md:text-lg font-semibold text-white mb-2">Important Notes:</h3>
          <ul className="space-y-1 md:space-y-2 text-sm md:text-base text-gray-300 list-disc pl-4 md:pl-5">
            <li>Minimum deposit amount is ₹100</li>
            <li>Please ensure to upload clear screenshots of your payment</li>
            <li>Double-check transaction details before submitting</li>
            <li>Deposits are typically processed within 24 hours</li>
            <li>Contact support if deposit is not reflected after 1 day</li>
          </ul>
        </div>
      </div>

      {/* QR Code Zoom Modal */}

      {showZoomedQR && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleCloseZoom}
        >
          {/* Semi-transparent backdrop */}
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm"></div>
          
          {/* Modal Content */}
          <div 
            className="relative z-50 max-w-2xl w-full bg-white/5 rounded-xl p-4 transform transition-all duration-300"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseZoom}
              className="absolute -top-12 right-0 text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* QR Container */}
            <div className="relative bg-white rounded-lg overflow-hidden">
              <img
                src={zoomedQRUrl}
                alt="Zoomed QR Code"
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Caption */}
            <p className="text-white/70 text-center mt-4 text-sm">
              Scan this QR code using any UPI app to make your payment
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default DepositSection;