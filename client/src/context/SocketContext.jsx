import React, { createContext, useEffect, useState,useContext } from 'react';
import { io } from 'socket.io-client';
import { AppContext } from '../context/AppContext';
export const SocketContext = createContext();

// const socket = io("https://oneto9-backend.onrender.com");
const socket = io("http://localhost:5000");

const getRandomViewers = () => {
  
  return Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000;

};

export const SocketProvider = ({ children }) => {
  const [WinNum, setWinNum] = useState(0);
  const [slotNum, setSlotNum] = useState(0);
  const [imgUrl, setImgUrl] = useState(null);
  const [ifscCode, setIfscCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [activeViewers, setActiveViewers] = useState(getRandomViewers());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { url } = useContext(AppContext);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch(`${url}/api/auth/get-game-qr`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch initial QR details');
        }
        
        const data = await response.json();
        
        setImgUrl(data.imageUrl);
        setIfscCode(data.ifscCode);
        setAccountNumber(data.accountNumber);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Socket event listeners
  useEffect(() => {
    socket.on('qrData', (data) => {
      setImgUrl(data.qr);
      setIfscCode(data.ifscCode);
      setAccountNumber(data.accountNumber);
    });

    socket.on('NumWon', (winN, slotN) => {
      setWinNum(winN);
      setSlotNum(slotN);
    });

    socket.on('active-users-updated', (activeViewers) => {
      setActiveViewers(activeViewers);
    });

    return () => {
      socket.off('qrData');
      socket.off('NumWon');
      socket.off('active-users-updated');
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <SocketContext.Provider value={{ 
      socket, 
      imgUrl, 
      setImgUrl, 
      WinNum, 
      slotNum,
      ifscCode,
      setIfscCode,
      accountNumber,
      setAccountNumber,
      activeViewers,
      setActiveViewers,
      isLoading,
      error
    }}>
      {children}
    </SocketContext.Provider>
  );
};