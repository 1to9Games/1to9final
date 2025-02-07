const express = require("express");
const Game = require("../models/Game");
const router = express.Router();

router.post("/game-create", async (req, res) => {
  try {
    // Generate tomorrow's date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const formattedDate = `${tomorrow.getDate().toString().padStart(2, "0")}${(
      tomorrow.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}${tomorrow.getFullYear()}`;
    const gameId = `GAME${formattedDate}`;

    // Check if game already exists
    const existingGame = await Game.findOne({ gameId });
    if (existingGame) {
      return res.status(400).json({ error: "Game already created" });
    }

    // Fetch the latest game
    const prevGame = await Game.findOne().sort({ createdAt: -1 });
    if (!prevGame) {
      return res
        .status(400)
        .json({ error: "No previous game found to inherit properties." });
    }

    // Create new game
    const game = new Game({
      gameId,
      account1: {
        qrImage: prevGame.account1.qrImage,
        ifscCode: prevGame.account1.ifscCode,
        accountNumber: prevGame.account1.accountNumber,
      },
      account2: {
        qrImage: prevGame.account2.qrImage,
        ifscCode: prevGame.account2.ifscCode,
        accountNumber: prevGame.account2.accountNumber,
      },
    });

    await game.save();
    res.status(201).json({ game });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/update-winning-number", async (req, res) => {
  try {
    const { gameId, slotNumber, winningNumber } = req.body;
    console.log(slotNumber);
    // Validate request body
    if (!gameId || !slotNumber || winningNumber === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find the game by gameId
    const game = await Game.findOne({ gameId });
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    const Slot = slotNumber;

    // Update the numberDrawn in the found slot
    game.winningNumbers[Slot - 1] = winningNumber;
    // Save the updated game document
    await game.save();

    return res.status(200).json({
      message: "Winning number updated successfully",
      game,
    });
  } catch (error) {
    console.error("Error updating winning number:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/update-game-details", async (req, res) => {
  try {
    const {  ifscCode, accountNumber, selectedAccount } = req.body;

    // Find the active game and update QR details
    const updatedGame = await Game.findOne().sort({ createdAt: -1 });
    if (selectedAccount === "account1") {
      updatedGame.account1.ifscCode = ifscCode;
      updatedGame.account1.accountNumber = accountNumber;
    } else if (selectedAccount === "account2") {
      updatedGame.account2.ifscCode = ifscCode;
      updatedGame.account2.accountNumber = accountNumber;
    }
    await updatedGame.save();
    if (!updatedGame) {
      return res.status(404).json({
        success: false,
        error: "No active game found",
      });
    }
    res.status(200).json({
      success: true,
      data: updatedGame,
    });
  } catch (error) {
    console.error("Game QR Update Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update game QR details",
    });
  }
});


router.put("/update-game-qr-only", async (req, res) => {
  try {
    const { imageUrl, selectedAccount } = req.body;
    const updatedGame = await Game.findOne().sort({ createdAt: -1 });
    if (selectedAccount === "account1") {
      updatedGame.account1.qrImage = imageUrl;
    } else if (selectedAccount === "account2") {
      updatedGame.account2.qrImage = imageUrl;
    }
    await updatedGame.save();
    if (!updatedGame) {
      return res.status(404).json({
        success: false,
        error: "No active game found",
      });
    }
    res.status(200).json({
      success: true,
      data: updatedGame,
    });
  } catch (error) {
    console.error("Game QR Update Error:", error);  
    res.status(500).json({
      success: false,
      error: "Failed to update game QR details",
    });
  }
});
    
    






router.get("/get-game-qr", async (req, res) => {
  try {
    // Assuming you're storing only one active QR record
    const qrDetails = await Game.findOne().sort({ createdAt: -1 });

    if (!qrDetails) {
      return res.status(404).json({
        message: "No QR details found",
        imageUrl: null,
        ifscCode: "",
        accountNumber: "",
      });
    }

    res.status(200).json({
      imageUrl1: qrDetails.account1.qrImage,
      ifscCode1: qrDetails.account1.ifscCode,
      accountNumber1: qrDetails.account1.accountNumber,
      imageUrl2: qrDetails.account2.qrImage,
      ifscCode2: qrDetails.account2.ifscCode,
      accountNumber2: qrDetails.account2.accountNumber,
    });

  } catch (error) {
    console.error("Error fetching QR details:", error);
    res.status(500).json({ error: "Failed to fetch QR details" });
  }
});
router.get("/get-gamedata", async (req, res) => {
  try {
    // Assuming you're storing only one active QR record
    const GameScore = await Game.find();

    if (!GameScore) {
      return res.status(404).json({
        message: "No  details found",
      });
    }

    res.status(200).json({
      GameScore,
    });
  } catch (error) {
    console.error("Error fetching details:", error);
    res.status(500).json({ error: "Failed to fetch details" });
  }
});

// GET winning numbers for a specific game
router.get("/games/winning-numbers/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await Game.findOne({ gameId });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({
      winningNumbers: game.winningNumbers,
      isActive: game.isActive,
    });
  } catch (error) {
    console.error("Error fetching winning numbers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/get-gameId", async (req, res) => {
  try {
    const latestGame = await Game.findOne().sort({ createdAt: -1 });
    res.status(200).json(latestGame);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bets data", error });
  }
});

module.exports = router;
