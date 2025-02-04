import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const WithdrawSection = () => {
  const { account,url } = useContext(AppContext);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [upiId, setUpiId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!account) {
      navigate('/login');
    }
  }, [account, navigate]);

  const handleSubmitWithdrawal = async (e) => {
    e.preventDefault();
    
    if (!withdrawalAmount) {
      toast.error('Please enter withdrawal amount');
      return;
    }
  
    if (withdrawalAmount < 100) {
      toast.error('Minimum withdrawal amount is ₹100');
      return;
    }
  
    if (withdrawalAmount > account?.user?.balance) {
      toast.error('Insufficient balance');
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const baseData = {
        userId: account.user._id,
        username: account.user.username,
        withdrawalAmount: parseFloat(withdrawalAmount),
        paymentMode: paymentMethod === 'bank' ? 'bankTransfer' : 'upiTransaction',
      };
  
      let endpoint;
      let requestData;
  
      if (paymentMethod === 'bank') {
        endpoint = `${url}/api/auth/withdrawal/banktransfer`;
        requestData = {
          ...baseData,
          bankDetails: {
            accountHolderName,
            bankName,
            accountNumber,
            ifscCode
          }
        };
      } else {
        endpoint = `${url}/api/auth/withdrawal/upitransaction`;
        requestData = {
          ...baseData,
          upiId
        };
      }
  
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        toast.success('Withdrawal request submitted successfully');
        
        // Clear input fields after successful submission
        setWithdrawalAmount('');
        setAccountNumber('');
        setIfscCode('');
        setAccountHolderName('');
        setBankName('');
        setUpiId('');
        setPaymentMethod('bank');
      } else {
        throw new Error(data.message || 'Failed to submit withdrawal request');
      }
    } catch (error) {
      console.error('Withdrawal Error:', error);
      toast.error(error.message || 'Failed to process withdrawal request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
        Withdraw Funds
      </h2>
      <p className="text-gray-300 mb-6">
        Available Balance: ₹{account?.user?.balance || 0}
      </p>

      <form onSubmit={handleSubmitWithdrawal} className="space-y-4 md:space-y-6">
        <div className="space-y-3 md:space-y-4">
          <input
            type="number"
            placeholder="Withdrawal Amount (₹)"
            value={withdrawalAmount}
            onChange={(e) => setWithdrawalAmount(e.target.value)}
            min="10"
            required
            className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg bg-black/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent text-sm md:text-base"
          />

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
            className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg bg-black/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent text-sm md:text-base"
          >
            <option value="bank">Bank Transfer</option>
            <option value="upi">UPI</option>
          </select>

          {paymentMethod === 'bank' ? (
            <div className="space-y-3 md:space-y-4">
              <input
                type="text"
                placeholder="Account Holder Name"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                required
                className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg bg-black/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent text-sm md:text-base"
              />
              
              <input
                type="text"
                placeholder="Bank Name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                required
                className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg bg-black/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent text-sm md:text-base"
              />

              <input
                type="text"
                placeholder="Account Number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
                className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg bg-black/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent text-sm md:text-base"
              />

              <input
                type="text"
                placeholder="IFSC Code"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                required
                className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg bg-black/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent text-sm md:text-base"
              />
            </div>
          ) : (
            <input
              type="text"
              placeholder="UPI ID"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              required
              className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg bg-black/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent text-sm md:text-base"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-red-900/85 text-white py-2.5 md:py-3 px-4 rounded-lg font-medium hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-900 focus:ring-offset-2 focus:ring-offset-black transition duration-200 active:transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Withdrawal Request'}
        </button>
      </form>

      <div className="mt-6 p-3 md:p-4 bg-black/30 backdrop-blur-sm rounded-lg border border-gray-600">
        <h3 className="text-base md:text-lg font-semibold text-white mb-2">Important Notes:</h3>
        <ul className="space-y-1.5 md:space-y-2 text-gray-300 list-disc pl-4 md:pl-5 text-sm md:text-base">
          <li>Minimum withdrawal amount is ₹100</li>
          <li>Withdrawals are processed within 24 hours</li>
          <li>Make sure all bank details are entered correctly</li>
          <li>Double-check your UPI ID if using UPI method</li>
          <li>Contact support if withdrawal is not received after 24 hours</li>
        </ul>
      </div>
    </>
  );
}

export default WithdrawSection;