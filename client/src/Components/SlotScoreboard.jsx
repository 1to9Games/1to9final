import { useState, useEffect,useContext } from 'react';
import { Loader2 } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const ROWS_PER_PAGE = 10;

const SlotsScoreboard = () => {
  const [gamesData, setGamesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
const { url } = useContext(AppContext);

  useEffect(() => {
    const fetchGamesData = async () => {
      try {
        const response = await fetch(`${url}/api/auth/get-gamedata`);
        const data = await response.json();
        setGamesData(data);
      } catch (error) {
        console.error('Error fetching games data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGamesData();
  }, []);

  const formatGameDate = (gameId) => {
    if (!gameId || gameId.length !== 12) return 'Invalid Date';
    const day = gameId.substring(4, 6);
    const month = gameId.substring(6, 8);
    const year = gameId.substring(8, 12);
    return `${day}/${month}/${year}`;
  };

  const gameIdToDate = (gameId) => {
    if (!gameId || gameId.length !== 12) return new Date(0);
    const day = gameId.substring(4, 6);
    const month = gameId.substring(6, 8);
    const year = gameId.substring(8, 12);
    return new Date(`${year}-${month}-${day}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <Loader2 className="animate-spin text-red-500 h-8 w-8" />
      </div>
    );
  }

  // Get date 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Filter and sort the data
  const filteredAndSortedData = [...gamesData.GameScore]
    .filter(game => {
      const gameDate = gameIdToDate(game.gameId);
      return gameDate >= thirtyDaysAgo;
    })
    .sort((a, b) => {
      const dateA = gameIdToDate(a.gameId);
      const dateB = gameIdToDate(b.gameId);
      return dateB - dateA;
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedData.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full px-2 sm:px-4 md:container md:mx-auto md:max-w-6xl">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Game Results Scoreboard
        </h2>
        <p className="text-sm sm:text-base text-gray-300">
          Showing results from the last 30 days
        </p>
      </div>

      {/* Table - Now used for all screen sizes */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr>
              <th className="p-3 sm:p-4 text-left text-white bg-red-900/85 rounded-tl-lg whitespace-nowrap">
                Date
              </th>
              <th className="p-3 sm:p-4 text-center text-white bg-red-900/85 whitespace-nowrap">
                Slot 1<br className="hidden sm:block"/>(12-1)
              </th>
              <th className="p-3 sm:p-4 text-center text-white bg-red-900/85 whitespace-nowrap">
                Slot 2<br className="hidden sm:block"/>(1-2)
              </th>
              <th className="p-3 sm:p-4 text-center text-white bg-red-900/85 whitespace-nowrap">
                Slot 3<br className="hidden sm:block"/>(2-3)
              </th>
              <th className="p-3 sm:p-4 text-center text-white bg-red-900/85 whitespace-nowrap">
                Slot 4<br className="hidden sm:block"/>(3-4)
              </th>
              <th className="p-3 sm:p-4 text-center text-white bg-red-900/85 rounded-tr-lg whitespace-nowrap">
                Slot 5<br className="hidden sm:block"/>(4-5)
              </th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((game, idx) => (
              <tr
                key={game.gameId}
                className={`
                  border-b border-gray-600
                  ${idx % 2 === 0 ? 'bg-black/30' : 'bg-black/50'}
                `}
              >
                <td className="p-3 sm:p-4 text-gray-300 whitespace-nowrap">
                  {formatGameDate(game.gameId)}
                </td>
                {game.winningNumbers.map((number, index) => (
                  <td key={index} className="p-3 sm:p-4">
                    <div className="bg-black/50 backdrop-blur-sm border border-gray-600 rounded-lg p-2 sm:p-3">
                      <span className="text-white font-bold text-center block text-sm sm:text-base">
                        {number}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Centered Pagination */}
      <div className="mt-6 flex justify-center">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-red-900/85 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            Previous
          </button>
          <span className="text-gray-300 text-sm sm:text-base">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-red-900/85 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            Next
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 p-4 bg-black/30 backdrop-blur-sm rounded-lg border border-gray-600">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-gray-300 text-sm sm:text-base">
          <span>Last Updated: {new Date().toLocaleString()}</span>
          
        </div>
      </div>
    </div>
  );
};

export default SlotsScoreboard;