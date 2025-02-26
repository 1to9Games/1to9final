import { useEffect, useState,useContext } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import toast from "react-hot-toast";
import { AppContext } from '../context/AppContext';


const QRUploadDialog = ({ open, handleOpen }) => {
    const { url } = useContext(AppContext);

  const [todayGameId, setTodayGameId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
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

      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleClose = () => {
    handleOpen(false);
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
    <Dialog 
  open={open} 
  handler={handleOpen}
  animate={{
    mount: { scale: 1, y: 0 },
    unmount: { scale: 0.9, y: -100 },
  }}
  className="fixed inset-0 z-[999] grid w-full max-w-[90%] sm:max-w-[450px] h-[300px] mx-auto bg-gray-900 rounded-lg"
>
  <div className="flex flex-col h-full overflow-hidden">
    <DialogHeader className="flex-shrink-0 text-white text-lg p-3 bg-black/20 backdrop-blur-sm">
      Create a New Game
    </DialogHeader>

    <DialogBody 
      className="flex-grow p-4 bg-black/20 backdrop-blur-sm"
    >
      <div className='flex flex-col items-center justify-center space-y-6'>
        <Button
          className="w-48 py-3 bg-red-600 hover:bg-red-500 transition-all text-white font-semibold rounded-lg shadow-lg"
          onClick={() => createGame()}
        >
          Create New Game
        </Button> 
        <div className='text-center'>
          <div className='text-gray-300 text-sd mb-1'>Today's Game ID:</div>
          <div className='text-green-400 font-bold text-2xl'>{todayGameId}</div>
        </div>
      </div>
    </DialogBody>

    <DialogFooter className="flex-shrink-0 p-3 bg-black/20 backdrop-blur-sm">
      <Button
        variant="text"
        color="red"
        onClick={handleClose}
        className="w-full sm:w-auto text-red-500 hover:bg-red-900/20"
      >
        Close
      </Button>
    </DialogFooter>
  </div>
</Dialog>
  );
};

export default QRUploadDialog;