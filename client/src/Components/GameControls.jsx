import React, { useContext, useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Alert,
  List,
  ListItem,
  Select,
  Option
} from "@material-tailwind/react";
import toast from 'react-hot-toast';
import { SocketContext } from '../context/SocketContext';
import { AppContext } from '../context/AppContext';
import { format } from 'date-fns';

const GameControls = () => {
  const [bets, setBets] = useState([]);
  const [todayBets, setTodayBets] = useState([]);
  const [winningNumber, setWinningNumber] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [todayGameId, setTodayGameId] = useState(null); // Add state for gameId
  const {socket} = useContext(SocketContext);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(1);
  
  const { url } = useContext(AppContext);

  const timeSlots = ["1PM", "2PM", "3PM", "4PM", "5PM"];

  const sendWin = (winN, slotN) => {
    socket.emit('WinNumber', winN, slotN);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch bets
        const response = await fetch(
          `${url}/api/auth/bets`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();
        const actualdata = data.reverse();

        // Fetch game ID
        const response2 = await fetch(`${url}/api/auth/get-gameId`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        if (!response2.ok) {
          throw new Error("Failed to get Game Id");
        }
        
        const data2 = await response2.json();
        setTodayGameId(data2.gameId); // Set the gameId in state

        // Filter today's bets
        const filteredTodayBets = actualdata.filter(bet => bet.gameId === data2.gameId);
        setTodayBets(filteredTodayBets);

        // Keep the last 100 bets
        setBets(actualdata.slice(0, 100));

        if (!response.ok) {
          throw new Error(data.error);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSetWinningNumber = async (winningNumber, slotNumber) => {
    // Check if we have a valid gameId
    if (!todayGameId) {
      toast.error('Game ID not found. Please ensure a game is created.');
      return;
    }

    try {
      console.log('Sending request with:', { winningNumber, slotNumber, gameId: todayGameId });
      
      // First API call to set the winning number
      const response1 = await fetch(`${url}/api/auth/admin/draw-number`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slotNumber,
          winningNumber,
          gameId: todayGameId,
        }),
      });
  
      if (!response1.ok) {
        const errorData = await response1.json();
        throw new Error(errorData.error || "Failed to set winning number");
      }
  
      // Send winning number through socket
      sendWin(winningNumber, slotNumber);
  
      // Second API call to process winners
      const response2 = await fetch(`${url}/api/auth/admin/process-winners`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          winningNumber,
          slotNumber,
          gameId: todayGameId,
          multiplier: 9
        }),
      });
  
      if (!response2.ok) {
        const errorData = await response2.json();
        throw new Error(errorData.error || "Failed to process winners");
      }
  
      toast.success('Winners processed and balances updated successfully');
      
      // Show the alert with winning number
      setWinningNumber({ number: winningNumber, timeSlot: timeSlots[slotNumber - 1] });
      setShowAlert(true);
    } catch (error) {
      console.error('Error processing game:', error);
      toast.error(error.message || 'Failed to process game results');
    }
  };

  
  const calculateStats = (slotNumber) => {
    const stats = {};
    for (let i = 1; i <= 10; i++) {
      stats[i] = {
        number: i,
        totalBets: 0,
        totalCoins: 0,
        users: new Set(),
        timeSlot: timeSlots[slotNumber - 1]
      };
    }
    
    todayBets.filter(bet => bet.slotNumber === slotNumber)
      .forEach(bet => {
        if (bet.selectedNumber >= 1 && bet.selectedNumber <= 10) {
          stats[bet.selectedNumber].totalBets += 1;
          stats[bet.selectedNumber].totalCoins += bet.betAmount;
          stats[bet.selectedNumber].users.add(bet.userId);
        }
      });

    return Object.values(stats).sort((a, b) => b.totalCoins - a.totalCoins);
  };


  
  const createGame = async () => {
       try {
        
        const response1 = await fetch(`${url}/api/auth/game-create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        if (!response1.ok) {
          throw new Error("Failed to create game");
        }
        toast.success('Game created successfully');
       } catch (error) {
        console.error('Error creating game:', error);
        toast.error('Failed to create game');
       }
  }
  

  return (
    <div className="p-2 md:p-4 lg:p-6 max-w-[95%] md:max-w-3xl lg:max-w-5xl mx-auto space-y-4 md:space-y-6">
      <Card className="w-full bg-black bg-opacity-20 shadow-sm shadow-white">
        <CardHeader className="p-4 md:p-6 bg-red-900 bg-opacity-85">
          <Typography variant="h4" className="text-xl md:text-2xl text-white text-center lg:text-3xl">
            Betting Game Admin Panel
          </Typography>
        </CardHeader>
        
        <CardBody className="space-y-4 md:space-y-6 bg-transparent">
          {/* Current Bets Section */}
          <div className=' flex md:flex-row justify-between items-center'>
            
          <div className='flex flex-col items-center w-full'>
            <span className='text-gray-300 text-md mb-1'>Today's Game ID:</span>
            <span className='text-green-400 font-bold text-2xl'>{todayGameId}</span>
          </div>
            
          </div>
          <div>
            <Typography variant="h5" className="mb-2 md:mb-4 md:text-[2rem] text-white">
              Current Bets
            </Typography>
            <Card className="w-full h-[480px] overflow-y-scroll bg-black bg-opacity-50 my-4">
              <List>
                {bets.map((bet) => (
                  <ListItem key={bet.id} className="py-2 px-4 hover:bg-transparent hover:shadow-none focus:bg-transparent  border-b border-gray-700/50">
                    <div className="flex flex-col sm:flex-row justify-between w-full gap-2 sm:gap-0">
                      <Typography className="font-medium text-white">
                        {bet.username}
                      </Typography>
                      <Typography className="font-medium text-white">
                        {format(new Date(bet.createdAt), 'dd/MM/yyyy hh:mm:ss a')}
                      </Typography>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <Typography className="font-medium text-red-500">
                          {bet.gameId}
                        </Typography>
                        <Typography className="font-medium text-gray-400">
                          {timeSlots[bet.slotNumber - 1]}
                        </Typography>
                        <Typography className="font-medium text-blue-800">
                          Number: {bet.selectedNumber}
                        </Typography>
                        <Typography color="green" className="font-medium">
                          {bet.betAmount} coins
                        </Typography>
                      </div>
                    </div>
                  </ListItem>
                ))}
              </List>
            </Card>
          </div>

          {/* Statistics Section */}
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
              <Typography variant="h5" className="text-lg md:text-[2rem] text-white">
                Number Statistics By Time Slot
              </Typography>
              <div className="w-full md:w-48">
                <Select
                  value={selectedTimeSlot}
                  onChange={(value) => setSelectedTimeSlot(parseInt(value))}
                  label="Select Time Slot"
                  className="w-full bg-black text-white"
                >
                  {timeSlots.map((time, index) => (
                    <Option key={index + 1} value={index + 1}>
                      {time}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {calculateStats(selectedTimeSlot).map((data) => (
                <Card key={data.number} className="p-3 md:p-4 bg-black bg-opacity-80">
                  <CardBody className="p-0">
                    <Typography variant="h6" className="mb-2 text-white">
                      Number {data.number}
                    </Typography>
                    <List className="p-0 text-blue-gray-500">
                      <ListItem className="py-1 hover:bg-transparent hover:shadow-none focus:bg-transparent">
                        <Typography variant="small" className="text-sm md:text-base">
                          Total Bets: {data.totalBets}
                        </Typography>
                      </ListItem>
                      <ListItem className="py-1 hover:bg-transparent hover:shadow-none focus:bg-transparent">
                        <Typography variant="small" className="text-sm md:text-base">
                          Total Coins: {data.totalCoins}
                        </Typography>
                      </ListItem>
                      <ListItem className="py-1 hover:bg-transparent hover:shadow-none focus:bg-transparent">
                        <Typography variant="small" className="text-sm md:text-base">
                          Unique Users: {data.users.size}
                        </Typography>
                      </ListItem>
                    </List>
                    <div className="mt-3">
                      {/* <Button
                        size="sm"
                        fullWidth
                        onClick={() => handleSetWinningNumber(data.number, selectedTimeSlot, todayGameId)}
                        className="text-sm md:text-base py-2 md:py-3 bg-red-900 bg-opacity-80"
                      >
                        Draw Number {data.number}/
                      </Button> */}
                      <Button
                          size="sm"
                          fullWidth
                          onClick={() => handleSetWinningNumber(data.number, selectedTimeSlot)}
                          className="text-sm md:text-base py-2 md:py-3 bg-red-900 bg-opacity-80"
                        >
                          Draw Number {data.number}
                    </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {showAlert && (
        <Alert
          color="green"
          open={showAlert}
          onClose={() => setShowAlert(false)}
          className="mt-4 fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-50"
          animate={{
            mount: { y: 0 },
            unmount: { y: 100 },
          }}
        >
          <Typography variant="h6" color="white" className="text-sm md:text-base">
            Winning number drawn: {winningNumber.number} for {winningNumber.timeSlot}
          </Typography>
        </Alert>
      )}
    </div>
  );
};

export default GameControls;
