import React, { createContext, useEffect, useState,useContext } from 'react';
import { io } from 'socket.io-client';
import { AppContext } from '../context/AppContext';
export const SocketContext = createContext();

// const url = 'https://oneto9-backend.onrender.com';
// const url = 'http://localhost:5000';
// const url = 'http://16.171.41.110:5000' || 'https://16.171.41.110:5000';
// const url = 'https://1to9final-production.up.railway.app';
const url = 'https://api.1to9game.com';
const socket = io(url);


const getRandomViewers = () => {
  
  return Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000;

};

export const SocketProvider = ({ children }) => {
  const [WinNum, setWinNum] = useState(0);
  const [slotNum, setSlotNum] = useState(0);
  const [imgUrl1, setImgUrl1] = useState(null);
  const [imgUrl2, setImgUrl2] = useState(null);
  const [ifscCode1, setIfscCode1] = useState('');
  const [ifscCode2, setIfscCode2] = useState('');
  const [accountNumber1, setAccountNumber1] = useState('');
  const [accountNumber2, setAccountNumber2] = useState('');
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
        
        setImgUrl1(data.imageUrl1);
        setIfscCode1(data.ifscCode1);
        setAccountNumber1(data.accountNumber1);
        setImgUrl2(data.imageUrl2);
        setIfscCode2(data.ifscCode2);
        setAccountNumber2(data.accountNumber2);
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
      if(data.selectedAccount === 'account1'){
        setImgUrl1(data.qr);
        setIfscCode1(data.ifscCode);
        setAccountNumber1(data.accountNumber);
      }else if(data.selectedAccount === 'account2'){
        setImgUrl2(data.qr);
        setIfscCode2(data.ifscCode);
        setAccountNumber2(data.accountNumber);
      }
      console.log("recieved in socket")
    });


    socket.on('qrData-only', (data) => {
      if(data.selectedAccount === 'account1'){
        setImgUrl1(data.qr);
      }else if(data.selectedAccount === 'account2'){

        setImgUrl2(data.qr);
      }
      console.log("recieved in socket qr only")
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
      imgUrl1,
      imgUrl2,
      ifscCode1,
      ifscCode2,
      accountNumber1,
      accountNumber2,
      WinNum, 
      slotNum,
      activeViewers,
      setActiveViewers,
      isLoading,
      error
    }}>
      {children}
    </SocketContext.Provider>
  );
};