

import React, { useState,useContext } from 'react';
import { AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../Pages/logo.png';
import { AppContext } from '../context/AppContext';

const Register = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const { url } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${url}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          phone: phone.startsWith('+91') ? phone : `+91${phone}`, 
          password 
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setStep(2);
      } else {
        setMessage(data.message || 'Registration failed');
      }
    } catch (error) {
      setMessage('Error sending OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      setMessage('Verifying OTP...');
      const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
      
      // Log the data being sent
      console.log('Sending verification request:', {
        phone: formattedPhone,
        otp: otp.trim() // Trim the OTP
      });
      
      const response = await fetch(`${url}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: formattedPhone, 
          otp: otp.trim() // Trim the OTP
        }),
      });
      
      const data = await response.json();
      console.log('Verification response:', data); // Log the response
      
      if (response.ok) {
        setMessage('Registration successful!');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setMessage(data.message || 'Verification failed');
        if (data.message.includes('expired')) {
          setStep(1);
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      setMessage('Network error during verification');
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/1to9games.png')] bg-cover bg-center flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-[340px] sm:max-w-md space-y-6 bg-black/20 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-white/10 shadow-2xl">
      <img 
        src={logo}
        alt="QR Code"
        className="w-24 h-24 object-contain mx-auto"
      />
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {step === 1 ? 'Register' : 'Verify OTP'}
          </h2>
          <p className="text-gray-300 text-xs sm:text-sm px-4">
            {step === 1 
              ? 'Join the action! Create your account now' 
              : 'Enter the OTP sent to your phone'}
          </p>
        </div>

        {message && (
          <div className="p-3 sm:p-4 rounded-lg text-center bg-red-900/50">
            <p className="text-xs sm:text-sm text-white">{message}</p>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4 sm:space-y-6">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-black/50 border border-gray-600 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition duration-200"
                required
              />
              <input
                type="tel"
                placeholder="10 digits Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-black/50 border border-gray-600 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition duration-200"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-black/50 border border-gray-600 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition duration-200"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-900/85 text-white py-2.5 sm:py-3 px-4 rounded-lg text-sm font-medium hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-900 focus:ring-offset-2 focus:ring-offset-black transition duration-200 active:transform active:scale-[0.98]"
            >
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-black/50 border border-gray-600 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent transition duration-200"
                required
              />
              <p className="text-xs text-gray-300 px-1">
                Didn't receive the OTP?{' '}
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="text-white hover:text-red-200"
                >
                  Resend
                </button>
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-red-900/85 text-white py-2.5 sm:py-3 px-4 rounded-lg text-sm font-medium hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-900 focus:ring-offset-2 focus:ring-offset-black transition duration-200 active:transform active:scale-[0.98]"
            >
              Verify OTP
            </button>
          </form>
        )}

        <div className="pt-2">
          <p className="text-center text-xs sm:text-sm text-gray-400">
            Already have an account?{' '}
            <button onClick={()=>{navigate("/login")}} className="text-white hover:text-red-200 font-medium bg-transparent">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;