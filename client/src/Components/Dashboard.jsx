import { useState, useEffect, useRef, useContext } from 'react';
import toast from 'react-hot-toast';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';
import DepositSection from '../Components/Deposit';
import WithdrawSection from '../Components/Withdraw';
import UserProfile from '../Components/UserProfile';
import BetHistory from '../Components/Bets';
import TransactionHistory from '../Components/Transactions';
import SlotsScoreboard from '../Components/SlotScoreboard';
import logo from '../Pages/logo.png';
import profilepic from '../Pages/profilepic.jpeg'

const Dashboard=()=> {
  const { account,setAccount,url } = useContext(AppContext);
  const { imgUrl, activeViewers } = useContext(SocketContext);
  const [balance, setBalance] = useState(account?.user?.balance);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedNumbers, setSelectedNumbers] = useState(Array(5).fill(null));
  const [betAmounts, setBetAmounts] = useState(Array(5).fill(''));
  const [timeRemaining, setTimeRemaining] = useState(Array(5).fill(0));
  const [isSlotActive, setIsSlotActive] = useState(Array(5).fill(true));
  const betInputRefs = useRef(Array(5).fill(null));
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [winarr, setWinarr] = useState(new Array(5).fill(0));



  useEffect(()=>{
    if(account){
      const data = localStorage.getItem('userData');
      const parsedData = JSON.parse(data);
      let ID;
      if(parsedData.user){
        ID = parsedData.user._id;
      }else{
        ID = parsedData.userId;
      }
      try {
        if(parsedData){
          const fetchUser = async()=>{
            const res = await fetch(`${url}/api/auth/users/${ID}`,{
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                }
            });
            const data = await res.json();
            setAccount(data);
            setBalance(data?.user?.balance);
          }
          fetchUser();
        }         
      } catch (error) {
        console.log(error);
      }
      
    }
  }, [account, navigate, setAccount,balance,setBalance]);

  useEffect(() =>  {
    if (!account) {
      navigate('/login');
    }
  }, [account, navigate]);

  const getCurrentGameDate = () => {
    const now = new Date();
    const gameDate = new Date();
    
    // If current time is after 5:15 PM, use next day's date
    if (now.getHours() > 17 || (now.getHours() === 17 && now.getMinutes() >= 15)) {
      gameDate.setDate(gameDate.getDate() + 1);
    }
    
    return gameDate;
  };


  useEffect(() => {
    const fetchWinningNumbers = async () => {
      try {
        const gameDate = getCurrentGameDate();
        
        const day = gameDate.getDate().toString().padStart(2, '0');
        const month = (gameDate.getMonth() + 1).toString().padStart(2, '0');
        const year = gameDate.getFullYear();
        const gameId = `GAME${day}${month}${year}`;
  
        const response = await fetch(`${url}/api/auth/games/winning-numbers/${gameId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${account?.user?.token || account?.token}`
          },
        });
  
        if (!response.ok) {
            setWinarr(new Array(5).fill(null));
            return;
        }
        
        const data = await response.json();
        
        if (data && data.winningNumbers) {
          const newWinArr = new Array(5).fill(0);
          data.winningNumbers.forEach((num, index) => {
            newWinArr[index] = num;
          });
          setWinarr(newWinArr);
        }
        else {
          // If winningNumbers is empty or undefined
          setWinarr(new Array(5).fill(null));
        }
      } catch (error) {
        console.error('Error fetching winning numbers:', error);
        setWinarr(new Array(5).fill(null));
      }
    };
  
    fetchWinningNumbers();
    const interval = setInterval(fetchWinningNumbers, 60000);
    return () => clearInterval(interval);
  }, [account]);

  useEffect(() => {
    const updateTimeAndStatus = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const isNextDayBetting = currentHour > 17 || (currentHour === 17 && currentMinute >= 15);
  
      // Update slot status and time remaining
      const newSlotStatus = Array(5).fill(false);
      const newTimeRemaining = Array(5).fill(0);
  
      for (let i = 0; i < 5; i++) {
        const slotStartHour = 12 + i; // Slots start from 12 PM (12, 1, 2, 3, 4)
        const slotEndHour = slotStartHour + 1;
  
        if (isNextDayBetting) {
          // After 5:15 PM - All slots are for next day
          newSlotStatus[i] = true;
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(slotStartHour, 0, 0, 0);
          newTimeRemaining[i] = tomorrow.getTime() - now.getTime();
        } else {
          // Current day logic
          if (currentHour < slotEndHour) {
            // Slot is active if current hour is less than its end hour
            newSlotStatus[i] = true;
            const target = new Date();
            target.setHours(slotEndHour, 0, 0, 0);
            newTimeRemaining[i] = target.getTime() - now.getTime();
          } else {
            // Slot has ended
            newSlotStatus[i] = false;
            newTimeRemaining[i] = 0;
          }
        }
      }
  
      setIsSlotActive(newSlotStatus);
      setTimeRemaining(newTimeRemaining);
    };
  
    updateTimeAndStatus();
    const interval = setInterval(updateTimeAndStatus, 1000);
    return () => clearInterval(interval);
  }, []);
  
  const getTimeDisplay = (slotIndex) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const slotStartHour = 12 + slotIndex;
    const slotEndHour = slotStartHour + 1;
  
    // After 5:15 PM - Show next day countdown for all slots
    if (currentHour > 17 || (currentHour === 17 && currentMinute >= 15)) {
      return `Remaining Time: ${formatTime(timeRemaining[slotIndex])}`;
    }
  
    // Current hour is less than slot end hour - Show countdown
    if (currentHour < slotEndHour) {
      return `Remaining Time: ${formatTime(timeRemaining[slotIndex])}`;
    }
  
    // After slot's end hour but before 5:15 PM
    if (currentHour >= slotEndHour && (currentHour < 17 || (currentHour === 17 && currentMinute < 15))) {
      return 'Status: Slot ended';
    }
  
    // Default case
    return 'Status: Slot ended';
  };
     
  const handleNumberSelect = (slotIndex, number) => {
    if (!isSlotActive[slotIndex]) {
      toast.error('Slot is inactive');
      return;
    }
    setSelectedNumbers(prev => {
      const newNumbers = [...prev];
      newNumbers[slotIndex] = number;
      return newNumbers;
    });
  };

  const handleBetAmountChange = (slotIndex, value) => {
    setBetAmounts(prev => {
      const newAmounts = [...prev];
      newAmounts[slotIndex] = value;
      return newAmounts;
    });
  };

  const handlePlaceBet = async (slotIndex) => {
    if (!isSlotActive[slotIndex]) {
      toast.error('Slot is inactive');
      return;
    }
  
    const selectedNumber = selectedNumbers[slotIndex];
    if (!selectedNumber) {
      toast.error('Select a number first');
      return;
    }
  
    const betAmount = Number(betAmounts[slotIndex]);
    if (!betAmount || betAmount < 20 || betAmount > 100000) {
      toast.error('Bet must be between ₹20 and ₹100,000');
      return;
    }
  
    if (betAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }
  
    try {
      const response = await fetch(`${url}/api/auth/bets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: account.user._id,
          slotNumber: slotIndex + 1,
          selectedNumber,
          betAmount
        })
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
  
      // Update balance in state
      setBalance(data.updatedBalance);
  
      // Update account context
      const updatedAccount = {
        ...account,
        user: {
          ...account.user,
          balance: data.updatedBalance
        }
      };
      setAccount(updatedAccount);
  
      // Update localStorage
      localStorage.setItem('userData', JSON.stringify(updatedAccount));
  
      // Reset bet inputs
      setBetAmounts(prev => {
        const newAmounts = [...prev];
        newAmounts[slotIndex] = '';
        return newAmounts;
      });
      setSelectedNumbers(prev => {
        const newNumbers = [...prev];
        newNumbers[slotIndex] = null;
        return newNumbers;
      });
  
      toast.success('Bet placed successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatTime = (milliseconds) => {
    if (milliseconds <= 0) return '00:00:00';
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getSlotTimeRange = (slotIndex) => {
    const gameDate = getCurrentGameDate();
    const startHour = 12 + slotIndex;
    
    const formatHour = (hour) => {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour;
      return `${displayHour}:00 ${period}`;
    };
    
    return {
      start: formatHour(startHour),
      end: formatHour(startHour + 1),
      date: gameDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    };
  };

  if (showProfile) {
    return <UserProfile account={account} onBack={() => setShowProfile(false)} />;
  }

  return (
    <div className="min-h-screen bg-[url('/1to9games.png')] bg-cover bg-center flex flex-col">
      {/* Mobile-optimized header */}
      <header className="bg-black/20 backdrop-blur-sm p-3 border-b border-gray-600">
        <div className="container mx-auto flex items-center justify-between">
          {/* <h1 className="text-xl sm:text-4xl font-bold text-white">1to9games</h1> */}
          <img 
                src={logo}
                alt="logo"
                className="w-24 h-24 object-contain"
              />
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-red-900 to-red-700 px-3 py-1.5 rounded-lg">
              <span className="text-gray-300 text-xs block">Balance</span>
              <span className="text-white font-semibold">₹{balance}</span>
            </div>
            <div className="bg-black/50 px-3 py-1.5 rounded-lg">
              <span className="text-gray-300 text-xs block">Users</span>
              <span className="text-white font-semibold">{activeViewers || 0}</span>
            </div>
            <div 
              onClick={() => setShowProfile(true)}
              className="w-12 h-12 sm:w-24 sm:h-24 bg-black/50 rounded-lg overflow-hidden p-1 sm:p-2 cursor-pointer hover:ring-2 hover:ring-red-500 transition duration-200"
            >
              <img 
                src={profilepic}
                alt="Profile Pic"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </header>
  
      {/* Mobile-friendly navigation */}
      <nav className="bg-black/30 backdrop-blur-sm p-2 border-b border-gray-600 overflow-x-auto">
        <div className="container mx-auto">
          <div className="flex justify-start sm:justify-center space-x-2 min-w-max px-2">
            {['home', 'Bets' , 'results', 'Deposit', 'Withdraw', 'Transactions', 'contact'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition duration-200 whitespace-nowrap
                  ${activeTab === tab 
                    ? 'bg-red-900/85 text-white' 
                    : 'text-white hover:bg-red-900/50'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>
  
      {/* Main content with preserved desktop layout */}
      <div className="container mx-auto p-3 sm:p-8 flex justify-center">
        <main className="w-full max-w-4xl">
          {activeTab === 'home' && (
            <div className="space-y-4">
              {/* Your original Game Slots heading */}
              <div className="relative">
                <h2 className="text-3xl sm:text-5xl font-bold text-center mb-8 tracking-wider uppercase">
                  <span className="relative inline-block">
                    <span className="relative inline-block text-red-900
                      [-webkit-text-stroke:2px_white]
                      [text-shadow:3px_3px_0_#fff,
                      -1px_-1px_0_#fff,
                      1px_-1px_0_#fff,
                      -1px_1px_0_#fff,
                      1px_1px_0_#fff]">
                      Game Slots
                    </span>
                  </span>
                  <div className="absolute w-32 sm:w-48 h-1 bg-gradient-to-r from-transparent via-red-900 to-transparent bottom-0 left-1/2 transform -translate-x-1/2"></div>
                </h2>
              </div>
  
              {/* Game slots with mobile-optimized layout */}
              <div className="space-y-4">
                {Array(5).fill().map((_, index) => {
                  const { start, end, date } = getSlotTimeRange(index);
                  return (
                    <div key={index} className="bg-black/20 backdrop-blur-sm rounded-xl p-3 sm:p-6 border border-gray-600">
                      <div className="flex items-start justify-between mb-4">
  <div>
    <div className="text-lg sm:text-2xl font-bold">
      <span className="bg-gradient-to-r from-white to-white bg-clip-text text-transparent">
        Slot {index + 1}
      </span>
    </div>
    <div className="text-sm text-gray-300">
      ({start} - {end}, {date})
    </div>
  </div>
  <div className="text-sm text-red-200 animate-pulse font-medium text-right min-w-[120px]">
    {getTimeDisplay(index)}
  </div>
</div>
  
                      {/* Number grid with consistent sizing */}
                      <div className="flex justify-center items-center gap-2 sm:gap-4 my-4">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
                          const isSelected = selectedNumbers[index] === num;
                          return (
                            <button
                              key={num}
                              onClick={() => handleNumberSelect(index, isSelected ? null : num)}
                              className={`
                                w-8 h-8 sm:w-14 sm:h-14 rounded-lg font-bold text-2xl sm:text-4xl
                                flex items-center justify-center transition-all duration-200
                                p-0 leading-none
                                ${isSelected 
                                  ? 'bg-gradient-to-br from-gray-800 to-black text-white ring-2 ring-white scale-105 shadow-lg' 
                                  : num % 2 === 0 
                                    ? 'bg-black text-white hover:bg-gray-900' 
                                    : 'bg-red-900 text-white hover:bg-red-800'
                                }
                                transform hover:scale-105 active:scale-95
                                ${isSelected ? 'hover:ring-4 hover:ring-red-500/50' : ''}
                              `}
                            >
                              {num}
                            </button>
                          );
                        })}
                      </div>
  
                      {/* Betting controls with enhanced styling */}
                      <div className="flex gap-2 items-center">
                        <div className="flex-1 min-w-0">
                          <input
                            type="number"
                            ref={el => betInputRefs.current[index] = el}
                            value={betAmounts[index]}
                            onChange={(e) => handleBetAmountChange(index, e.target.value)}
                            placeholder="Bet amount"
                            className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-600 text-white
                                     focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <button
                          onClick={() => handlePlaceBet(index)}
                          disabled={!isSlotActive[index]}
                          className="whitespace-nowrap px-6 py-2 bg-gradient-to-r from-red-900 to-red-700 
                                   text-white rounded-lg font-medium disabled:opacity-50 
                                   transform hover:scale-105 active:scale-95
                                   transition-all duration-200 
                                   hover:shadow-lg hover:shadow-red-900/50
                                   disabled:hover:scale-100 disabled:hover:shadow-none"
                        >
                          Place Bet
                        </button>
                      </div>
  
                      <div className="mt-4 text-lg sm:text-2xl font-bold text-white text-center">
                        Winning: <span className="text-red-500">{winarr[index] || "Not Drawn"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
  
          {/* Other tabs remain unchanged */}
          {activeTab === 'Bets' && (
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 sm:p-6 border border-gray-600">
              <div className="overflow-x-auto">
                <BetHistory userId={account.user._id} />
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 sm:p-6 border border-gray-600">
              <div className="overflow-x-auto">
                <SlotsScoreboard/>
              </div>
            </div>
          )}

          {activeTab === 'Transactions' && (
            <div className="bg-black/20 backdrop-blur-sm rounded-xl min-h-[500px] p-6 border border-gray-600">
              <TransactionHistory userId={account.user._id} />
            </div>
          )}

          {activeTab === 'Deposit' && (
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-gray-600">
              <DepositSection />
            </div>
          )}

          {activeTab === 'Withdraw' && (
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-gray-600">
              <WithdrawSection />
            </div>
          )}

{activeTab === 'contact' && (
  <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-gray-600 min-h-[400px] flex flex-col items-center justify-center">
    <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-4">Contact Us</h2>
    <p className="text-center text-gray-300 mb-4">
      For any inquiries, please contact us at
    </p>
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-3 text-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
        <span>Email: sproblem900@gmail.com</span>
      </div>
      <div className="flex items-center gap-3 text-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
        <span>Support: +1234567890</span>
      </div>
    </div>
  </div>
)}
</main>
</div>
<footer className="bg-black/20 backdrop-blur-sm border-t border-gray-600 w-full mt-auto">
        <div className="container mx-auto p-2 sm:p-4">
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 sm:p-4 max-w-2xl w-full">
              <p className="text-white text-center text-sm sm:text-base font-medium">
                ⚠️ WARNING: Gambling can be addictive. Play at your own risk. Please gamble responsibly.
              </p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-gray-400 text-xs sm:text-sm">
                © {new Date().getFullYear()} 1to9games. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;