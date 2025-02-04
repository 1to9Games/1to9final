
  // components/ApprovalDialog.jsx
  import React, { useState } from "react";
  import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Typography,
    Button,
    Badge,
    Input,
    Textarea,
  } from "@material-tailwind/react";
  import LoadingOverlay from "./LoadingOverlay";
  
  const ApprovalDialog = ({ open, handleDialog, selectedRequest, onApprove }) => {
    const [loading, setLoading] = useState(false);
    const [approvalData, setApprovalData] = useState({
      notes: "",
      adminCode: "",
    });
    const [errors, setErrors] = useState({});
  
    const validateForm = () => {
      const newErrors = {};
      if (!approvalData.notes.trim()) {
        newErrors.notes = "Approval notes are required";
      }
      if (!approvalData.adminCode.trim()) {
        newErrors.adminCode = "Admin code is required";
      } else if (approvalData.adminCode.length < 6) {
        newErrors.adminCode = "Admin code must be at least 6 characters";
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleSubmit = async () => {
      if (!validateForm()) return;
      
      setLoading(true);
      try {
        await onApprove(selectedRequest.id, approvalData);
        setApprovalData({ notes: "", adminCode: "" });
        handleDialog();
      } catch (error) {
        setErrors({ submit: error.message });
      } finally {
        setLoading(false);
      }
    };
  
    if (!selectedRequest) return null;
  
    return (
      <Dialog open={open} handler={handleDialog} size="md">
        {loading && <LoadingOverlay message="Processing approval..." />}
        
        <DialogHeader>
          <Typography variant="h5" color="blue-gray">
            Approve Withdrawal Request
          </Typography>
        </DialogHeader>
        
        <DialogBody divider className="space-y-4">
          {/* Previous content remains the same */}
          {/* ... */}
          
          {/* Approval Form */}
          <div className="bg-blue-gray-50 p-4 rounded-lg">
            <Typography variant="h6" color="blue-gray" className="mb-4">
              Approval Details
            </Typography>
            
            <div className="space-y-4">
              <div>
                <Textarea
                  label="Approval Notes"
                  value={approvalData.notes}
                  onChange={(e) => setApprovalData(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  error={errors.notes}
                />
                {errors.notes && (
                  <Typography variant="small" color="red" className="mt-1">
                    {errors.notes}
                  </Typography>
                )}
              </div>
              
              <div>
                <Input
                  type="password"
                  label="Admin Code"
                  value={approvalData.adminCode}
                  onChange={(e) => setApprovalData(prev => ({
                    ...prev,
                    adminCode: e.target.value
                  }))}
                  error={errors.adminCode}
                />
                {errors.adminCode && (
                  <Typography variant="small" color="red" className="mt-1">
                    {errors.adminCode}
                  </Typography>
                )}
              </div>
            </div>
          </div>
  
          {errors.submit && (
            <Alert color="red" variant="outlined">
              {errors.submit}
            </Alert>
          )}
        </DialogBody>
        
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={handleDialog}
            className="mr-1"
          >
            Cancel
          </Button>
          <Button 
            variant="filled" 
            color="green" 
            onClick={handleSubmit}
            disabled={loading}
          >
            Confirm Approval
          </Button>
        </DialogFooter>
      </Dialog>
    );
  };
  export default ApprovalDialog;