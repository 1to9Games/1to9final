import React, { useState, useEffect,useContext } from "react";
import {
  Drawer,
  Typography,
  Button,
  Card,
  CardBody,
  IconButton,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { AppContext } from '../context/AppContext';
const DepositDialog = ({ open, setOpen }) => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const { url } = useContext(AppContext);

  useEffect(() => {
    if (open) {
      loadDeposits();
      const interval = setInterval(loadDeposits, 15000);
      return () => clearInterval(interval);
    }
  }, [open]);

  const loadDeposits = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${url}/api/auth/get-deposits`);
      if (!response.ok) {
        throw new Error('Failed to fetch deposits');
      }
      const data = await response.json();
      setDeposits(data.deposits);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(!open);
    setError(null);
    setSuccessMessage(null);
  };

  const handleApprove = async (depositId) => {
    try {
      setLoading(true);
      const response = await fetch(`${url}/api/auth/deposit/${depositId}/approved`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to approve deposit');
      }

      setSuccessMessage(data.message);
      await loadDeposits();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async (depositId) => {
    try {
      setLoading(true);
      const response = await fetch(`${url}/api/auth/deposit/${depositId}/rejected`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to decline deposit');
      }

      setSuccessMessage(data.message);
      await loadDeposits();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const DepositCard = ({ deposit }) => {
    const isProcessed = deposit.status !== 'pending';
    
    const commonDetails = (
      <>
        <Typography variant="h6" color="blue-gray">
          {deposit.name}
        </Typography>
        <div className="mt-2 space-y-1">
          <Typography variant="small" color="gray">
            Amount: ₹{deposit.depositAmount}
          </Typography>
          <Typography variant="small" color="gray">
            Transaction ID: {deposit.transactionId}
          </Typography>
          <Typography variant="small" color="gray">
            Date: {new Date(deposit.createdAt).toLocaleDateString()}
          </Typography>
          <Typography variant="small" color="gray" className="font-medium">
            Status: {' '}
            <span className={
              deposit.status === 'approved' ? 'text-green-500' :
              deposit.status === 'rejected' ? 'text-red-500' :
              'text-blue-500'
            }>
              {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
            </span>
          </Typography>
          {deposit.status === 'approved' && deposit.approvedAt && (
            <Typography variant="small" color="gray">
              Approved At: {new Date(deposit.approvedAt).toLocaleString()}
            </Typography>
          )}
          {deposit.status === 'rejected' && deposit.rejectedAt && (
            <Typography variant="small" color="gray">
              Rejected At: {new Date(deposit.rejectedAt).toLocaleString()}
            </Typography>
          )}
        </div>
      </>
    );

    const handleImageClick = (deposit) => {
      setSelectedImage(deposit.proofImgUrl);
    };

    return (
      <Card className="w-full">
        <CardBody>
          {commonDetails}
          {deposit.proofImgUrl && (
            <div className="mt-3">
              <Typography variant="small" color="gray" className="mb-2">
                Proof of Payment:
              </Typography>
              <div className="max-w-[200px] h-[150px] overflow-hidden rounded-lg cursor-pointer hover:opacity-80 transition-opacity">
                <img
                  src={deposit.proofImgUrl}
                  alt="Proof of Payment"
                  className="w-full h-full object-cover"
                  onClick={() => handleImageClick(deposit)}
                />
              </div>
            </div>
          )}
          {!isProcessed && (
            <div className="flex gap-2 mt-3">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDecline(deposit._id);
                }}
                size="sm"
                color="red"
                variant="outlined"
                className="flex items-center gap-2"
                disabled={loading}
              >
                Decline
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleApprove(deposit._id);
                }}
                size="sm"
                color="green"
                className="flex items-center gap-2"
                disabled={loading}
              >
                Approve
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    );
  };

  const ImagePreviewDialog = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="relative max-w-3xl w-full mx-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          <img
            src={imageUrl}
            alt="Proof of Payment"
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <Drawer
        open={open}
        onClose={handleOpen}
        className={open ? "p-4" : "hidden"}
        size={480}
        placement="right"
      >
        <div className="relative h-full">
          {loading && (
            <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          )}
          
          <div className="mb-6 flex items-center justify-between">
            <Typography variant="h5" color="blue-gray">
              Deposit Requests
            </Typography>
            <IconButton
              variant="text"
              color="blue-gray"
              onClick={handleOpen}
            >
              <XMarkIcon className="h-5 w-5" />
            </IconButton>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg flex justify-between items-center">
              <span>{successMessage}</span>
              <button onClick={() => setSuccessMessage(null)} className="text-green-700 hover:text-green-900">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-8rem)]">
            {deposits.map((deposit) => (
              <DepositCard key={deposit._id} deposit={deposit} />
            ))}
          </div>
        </div>
      </Drawer>

      <ImagePreviewDialog
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
};

export default DepositDialog;