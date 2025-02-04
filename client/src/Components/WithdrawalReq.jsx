import React, { useState, useEffect,useContext } from "react";
import {
  Drawer,
  Typography,
  Button,
  Card,
  CardBody,
  IconButton,
  Alert,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { AppContext } from '../context/AppContext';

const WithdrawalDrawer = ({ open, setOpen }) => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const { url } = useContext(AppContext);

  useEffect(() => {
    if (open) {
      loadWithdrawals();
      const interval = setInterval(loadWithdrawals, 5000);
      return () => clearInterval(interval);
    }
  }, [open]);

  const loadWithdrawals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${url}/api/auth/withdrawal/get-data`);
      if (!response.ok) {
        throw new Error('Failed to fetch withdrawals');
      }
      const data = await response.json();
      setWithdrawals(data);
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

  const handleApprove = async (withdrawalId) => {
    try {
      setLoading(true);
      const response = await fetch(`${url}/api/auth/withdrawal/${withdrawalId}/approved`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to approve withdrawal');
      }

      setSuccessMessage(data.message);
      await loadWithdrawals();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async (withdrawalId) => {
    try {
      setLoading(true);
      const response = await fetch(`${url}/api/auth/withdrawal/${withdrawalId}/rejected`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to decline withdrawal');
      }

      setSuccessMessage(data.message);
      await loadWithdrawals();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const WithdrawalCard = ({ withdrawal }) => {
    const isProcessed = withdrawal.status !== 'pending';
    
    const commonDetails = (
      <>
        <Typography variant="h6" color="blue-gray">
          {withdrawal.username}
        </Typography>
        <div className="mt-2 space-y-1">
          <Typography variant="small" color="gray">
            Amount: ₹{withdrawal.withdrawalAmount}
          </Typography>
          <Typography variant="small" color="gray">
            Payment Mode: {withdrawal.paymentMode === 'upiTransaction' ? 'UPI' : 'Bank Transfer'}
          </Typography>
          <Typography variant="small" color="gray">
            Date: {new Date(withdrawal.createdAt).toLocaleDateString()}
          </Typography>
          <Typography variant="small" color="gray" className="font-medium">
            Status: {' '}
            <span className={
              withdrawal.status === 'approved' ? 'text-green-500' :
              withdrawal.status === 'rejected' ? 'text-red-500' :
              'text-blue-500'
            }>
              {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
            </span>
          </Typography>
          {withdrawal.status === 'approved' && withdrawal.approvedAt && (
            <Typography variant="small" color="gray">
              Approved At: {new Date(withdrawal.approvedAt).toLocaleString()}
            </Typography>
          )}
          {withdrawal.status === 'rejected' && withdrawal.rejectedAt && (
            <Typography variant="small" color="gray">
              Rejected At: {new Date(withdrawal.rejectedAt).toLocaleString()}
            </Typography>
          )}
        </div>
      </>
    );

    const upiDetails = withdrawal.paymentMode === 'upiTransaction' && (
      <Typography variant="small" color="gray">
        UPI ID: {withdrawal.upiId}
      </Typography>
    );

    const bankDetails = withdrawal.paymentMode === 'bankTransfer' && (
      <>
        <Typography variant="small" color="gray">
          Account Holder: {withdrawal.bankDetails?.accountHolderName}
        </Typography>
        <Typography variant="small" color="gray">
          Bank Name: {withdrawal.bankDetails?.bankName}
        </Typography>
        <Typography variant="small" color="gray">
          Account No: {withdrawal.bankDetails?.accountNumber}
        </Typography>
        <Typography variant="small" color="gray">
          IFSC Code: {withdrawal.bankDetails?.ifscCode}
        </Typography>
      </>
    );

    return (
      <Card className="w-full">
        <CardBody>
          {commonDetails}
          <div className="mt-2 space-y-1">
            {upiDetails}
            {bankDetails}
          </div>
          {!isProcessed && (
            <div className="flex gap-2 mt-3">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDecline(withdrawal._id);
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
                  handleApprove(withdrawal._id);
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

  return (
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
            Withdrawal Requests
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

        <div className="flex flex-col gap-3 overflow-y-scroll max-h-[1000px]">
          {withdrawals.map((withdrawal) => (
            <WithdrawalCard key={withdrawal._id} withdrawal={withdrawal} />
          ))}
        </div>
      </div>
    </Drawer>
  );
};

export default WithdrawalDrawer;