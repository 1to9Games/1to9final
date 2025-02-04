import { useState, useEffect, useContext } from "react";
import { Gamepad2 } from "lucide-react";
import { AppContext } from '../context/AppContext';

const BetHistory = ({ userId }) => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { url } = useContext(AppContext);

  useEffect(() => {
    fetchBets();
  }, [userId]);

  const fetchBets = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${url}/api/auth/get-transactiondetails/${userId}`
      );
      const data = await response.json();
      if (response.ok && data.transactionDetails) {
        setBets(data.transactionDetails.bets.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        ));
      }
    } catch (error) {
      console.error("Error fetching bets:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    };
  };

  const getStatusBadgeStyle = (status) => {
    switch (status.toLowerCase()) {
      case "won":
        return "bg-green-500/20 text-green-400 border border-green-500";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500";
      case "lost":
        return "bg-red-500/20 text-red-400 border border-red-500";
      default:
        return "bg-blue-500/20 text-blue-400 border border-blue-500";
    }
  };

  const currentBets = bets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(bets.length / itemsPerPage);

  return (
    <div className="w-full bg-black/20 backdrop-blur-sm p-3 md:p-6 rounded-lg">
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white">Bet History</h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 text-white">
          Loading bets...
        </div>
      ) : currentBets.length === 0 ? (
        <div className="flex justify-center items-center h-48 text-white">
          No bets found
        </div>
      ) : (
        <div className="space-y-3">
          {currentBets.map((bet, index) => {
            const { date, time } = formatDateTime(bet.createdAt);
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-black/30 border border-gray-600 hover:bg-black/40 transition-colors"
              >
                <div className="flex items-center space-x-2 md:space-x-4">
                  <Gamepad2 className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-base md:text-lg font-bold text-white bg-red-900/50 px-2 py-1 rounded-lg">
                        {bet.selectedNumber}
                      </span>
                      <span className="text-xs md:text-sm text-gray-400">
                        Slot {bet.slotNumber}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-400 mt-1">
                      {date} at {time}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="text-sm md:text-base font-semibold text-white mb-1">
                    {formatAmount(bet.betAmount)}
                  </p>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeStyle(bet.status)}`}>
                    {bet.status}
                  </span>
                </div>
              </div>
            );
          })}
          
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-red-900 to-red-900 text-white disabled:opacity-50 transition-colors hover:from-red-800 hover:to-red-600"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-white">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-red-900 to-red-900 text-white disabled:opacity-50 transition-colors hover:from-red-800 hover:to-red-600"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BetHistory;