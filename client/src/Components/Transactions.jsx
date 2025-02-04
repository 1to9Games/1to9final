import { useState, useEffect,useContext } from "react";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { AppContext } from '../context/AppContext';

const TransactionHistory = ({ userId }) => {
  const [transactionDetails, setTransactionDetails] = useState({
    withdrawals: [],
    deposits: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
const { url } = useContext(AppContext);

  useEffect(() => {
    fetchTransactions();
  }, [userId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${url}/api/auth/get-transactiondetails/${userId}`
      );
      const data = await response.json();
      if (response.ok && data.transactionDetails) {
        setTransactionDetails(data.transactionDetails);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTabData = () => {
    const sortByDate = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

    switch (activeTab) {
      case "withdraw":
        return transactionDetails.withdrawals
          .map((tx) => ({ ...tx, type: "withdraw" }))
          .sort(sortByDate);
      case "deposit":
        return transactionDetails.deposits
          .map((tx) => ({ ...tx, type: "deposit" }))
          .sort(sortByDate);
      default:
        return [
          ...transactionDetails.withdrawals.map((tx) => ({
            ...tx,
            type: "withdraw",
          })),
          ...transactionDetails.deposits.map((tx) => ({
            ...tx,
            type: "deposit",
          })),
        ].sort(sortByDate);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="w-5 h-5 md:w-6 md:h-6 text-green-500" />;
      case "withdraw":
        return <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 text-red-500" />;
      default:
        return null;
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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "rejected":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const currentTransactions = getTabData().slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(getTabData().length / itemsPerPage);

  
  return (
    <div className="w-full bg-black/20 backdrop-blur-sm p-4 md:p-6 rounded-lg">
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white">Transaction History</h2>
      </div>

      <div className="flex flex-row gap-1 md:gap-4 bg-black/50 p-1 mb-4 rounded-lg">
        {["all", "deposit", "withdraw"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-white rounded-lg px-2 md:px-4 py-2 text-sm md:text-base ${
              activeTab === tab ? "bg-red-900/85" : "hover:bg-red-900/50"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 text-white">
          Loading transactions...
        </div>
      ) : currentTransactions.length === 0 ? (
        <div className="flex justify-center items-center h-48 text-white">
          No transactions found
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {currentTransactions.map((transaction, index) => {
            const { date, time } = formatDateTime(transaction.createdAt);
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-black/30 border border-gray-600"
              >
                <div className="flex items-center space-x-2 md:space-x-4">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-white">
                      {transaction.type
                        ? transaction.type.charAt(0).toUpperCase() +
                          transaction.type.slice(1)
                        : ""}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-400">
                      {date} at {time}
                    </p>
                    {transaction.type === "deposit" && transaction.transactionId && (
                      <p className="text-xs md:text-sm text-gray-400 truncate max-w-[150px] md:max-w-full">
                        ID: {transaction.transactionId}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base md:text-lg font-semibold text-white">
                    {transaction.type === "withdraw" &&
                      formatAmount(transaction.withdrawalAmount)}
                    {transaction.type === "deposit" &&
                      formatAmount(transaction.depositAmount)}
                  </p>
                  <p className={`text-xs md:text-sm ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </p>
                </div>
              </div>
            );
          })}
          
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 md:px-4 py-2 text-sm md:text-base rounded-lg bg-red-900/85 text-white disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 md:px-4 py-2 text-sm md:text-base text-white">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 md:px-4 py-2 text-sm md:text-base rounded-lg bg-red-900/85 text-white disabled:opacity-50"
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

export default TransactionHistory;