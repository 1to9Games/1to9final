import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import logo from '../Pages/logo.png';

function ResetPassword() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { url } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
      
      const response = await fetch(`${url}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: formattedPhone }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message);
      }
      
      setMessage(data.message);
      setIsOtpSent(true);
      setError('');
    } catch (error) {
      setError(error.message);
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
      
      const response = await fetch(`${url}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formattedPhone,
          otp: otp.trim(),
          newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message);
      }
      
      setMessage('Password reset successful!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.message);
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/1to9games.png')] bg-cover bg-center flex items-center justify-center p-4 md:px-6 lg:px-8">
      <div className="w-full max-w-[320px] md:max-w-md space-y-4 md:space-y-6 bg-black/20 backdrop-blur-sm p-4 md:p-8 rounded-xl shadow-white/10 shadow-2xl">
        <img 
          src={logo}
          alt="Logo"
          className="w-24 h-24 object-contain mx-auto"
        />
        <div className="text-center space-y-1 md:space-y-2">
          <h2 className="text-xl md:text-3xl font-bold text-white">
            Reset Password
          </h2>
          <p className="text-gray-300 text-xs md:text-sm px-2 md:px-4">
            {!isOtpSent 
              ? 'Enter your phone number to receive OTP' 
              : 'Enter OTP and new password'}
          </p>
        </div>

        {(error || message) && (
          <div className={`p-2 md:p-4 rounded-lg text-center ${error ? 'bg-red-900/50' : 'bg-red-900/50'}`}>
            <p className="text-xs md:text-sm text-white">
              {error || message}
            </p>
          </div>
        )}

        <form onSubmit={isOtpSent ? handleResetPassword : handleSendOtp} className="space-y-3 md:space-y-6">
          <div className="space-y-3 md:space-y-4">
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={handlePhoneChange}
              className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg bg-black/50 border border-gray-600 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition duration-200"
              required
              disabled={isOtpSent}
            />
            
            {isOtpSent && (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg bg-black/50 border border-gray-600 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition duration-200"
                  required
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg bg-black/50 border border-gray-600 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition duration-200"
                  required
                />
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-900/85 text-white py-2 md:py-3 px-4 rounded-lg text-sm font-medium hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-900 focus:ring-offset-2 focus:ring-offset-black transition duration-200 active:transform active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading 
              ? 'Processing...' 
              : isOtpSent 
                ? 'Reset Password' 
                : 'Send OTP'}
          </button>
        </form>

        <div className="pt-2">
          <button
            onClick={() => navigate('/login')}
            className="w-full text-center text-xs md:text-sm text-gray-400 hover:text-red-200 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;