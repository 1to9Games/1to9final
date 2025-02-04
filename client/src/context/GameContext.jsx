import React, { createContext, useState, useContext, useMemo } from 'react';

const GameContext = createContext(undefined);

export function GameProvider({ children }) {
  const [winningNumbers, setWinningNumbers] = useState(Array(5).fill(0));

  const updateWinningNumber = (slotNumber, number) => {
    setWinningNumbers(prev => {
      const newNumbers = [...prev];
      newNumbers[slotNumber - 1] = number;
      return newNumbers;
    });
  };

  const value = useMemo(() => ({
    winningNumbers,
    updateWinningNumber,
  }), [winningNumbers]); // Add dependencies here

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}
