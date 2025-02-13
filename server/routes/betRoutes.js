const express = require('express');
const User = require('../models/User');
const Bet = require('../models/Bet');
const Game = require('../models/Game');
const router = express.Router();

router.post('/bets', async (req, res) => {
    try {
      const { userId,username, slotNumber, selectedNumber, betAmount } = req.body;


      //taking gameId
      const latestGame = await Game.findOne().sort({ createdAt: -1 });

      if (!latestGame) {
        throw new Error('No Game found');
      }
  
  
      // Validate user and balance
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      if (user.balance < betAmount) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }
  
      // Calculate slot time
      const now = new Date();
      const slotTime = new Date(now);
      slotTime.setHours(12 + slotNumber - 1, 0, 0, 0);
      if (slotTime <= now) {
        slotTime.setDate(slotTime.getDate() + 1);
      }

     
       // Update user balance
       user.balance -= betAmount;
  
      // Create bet
      const idOfGame = latestGame._id;
      const bet = new Bet({
        userId,
        idOfGame,
        gameId:latestGame.gameId,
        username,
        slotNumber,
        selectedNumber,
        betAmount,
        slotTime
      });
    

     
      await user.save();
      await bet.save();
    
  
      res.status(201).json({ bet, updatedBalance: user.balance });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/bets", async (req, res) => {
    try {
        const bets = await Bet.find(); // Fetch all bets
        res.json(bets);
    } catch (error) {
        res.status(500).json({ message: "Error fetching bets data", error});
}
});

  module.exports = router;
