const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Bet = require("../models/Bet");
const Deposit = require("../models/Deposit");
const Withdrawal = require("../models/Withdraw");
const Game = require("../models/Game");
const Admin = require("../models/admin");

router.put("qr-upload", async (req, res) => {
  const { imageUrl } = req.body;

  try {
    const result = await User.updateOne({}, { qrUrl: imageUrl });
    res.json({ success: true, message: "Image URL updated for all users" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/get-deposits", async (req, res) => {
  try {
    const deposits = await Deposit.find({ status: "pending" });
    if (!deposits) {
      return res.status(404).json({ error: "No pending deposits found" });
    }
    res.status(200).json({
      message: "Pending deposits found",
      deposits,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/deposit/:depositId/rejected", async (req, res) => {
  try {
    const depositId = req.params.depositId;
    const deposit = await Deposit.findById(depositId);
    if (!deposit) return res.status(400).json({ message: "Deposit not found" });
    deposit.status = "rejected";
    await deposit.save();
    res.status(200).json({ message: "Deposit declined", deposit });
  } catch (error) {
    res.status(500).json({
      message: "Error declining deposit",
      error: error.message,
    });
  }
});
router.post("/deposit/:depositId/approved", async (req, res) => {
  try {
    const depositId = req.params.depositId;
    const deposit = await Deposit.findById(depositId);
    const user = await User.findById(deposit.userId);
    if (!deposit) return res.status(400).json({ message: "Deposit not found" });
    deposit.status = "approved";
    user.balance += deposit.depositAmount;
    await user.save();
    await deposit.save();
    res.status(200).json({ message: "Deposit Approved", deposit });
  } catch (error) {
    res.status(500).json({
      message: "Error Approvong deposit",
      error: error.message,
    });
  }
});

// Bank transfer withdrawal
router.post("/withdrawal/banktransfer", async (req, res) => {
  try {
    const { userId, username, withdrawalAmount, paymentMode, bankDetails } =
      req.body;

    // Check if user exists and has sufficient balance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.balance < withdrawalAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    if (paymentMode !== "bankTransfer") {
      return res
        .status(400)
        .json({ message: "Invalid payment mode for bank transfer" });
    }

    // Validate required bank details
    if (
      !bankDetails ||
      !bankDetails.accountHolderName ||
      !bankDetails.bankName ||
      !bankDetails.accountNumber ||
      !bankDetails.ifscCode
    ) {
      return res
        .status(400)
        .json({ message: "Bank details are required for bank transfer" });
    }

    // Create the withdrawal request
    const withdrawalRequest = new Withdrawal({
      userId,
      username,
      withdrawalAmount,
      paymentMode,
      bankDetails,
    });

    // Save to database
    const savedRequest = await withdrawalRequest.save();

    // Deduct the withdrawal amount from the user's balance
    user.balance -= withdrawalRequest.withdrawalAmount;

    // Save the updated user
    await user.save();

    res.status(201).json({
      message: "Withdrawal request created successfully",
      withdrawal: savedRequest,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Error creating withdrawal request",
        error: error.message,
      });
  }
});

// UPI withdrawal
router.post("/withdrawal/upitransaction", async (req, res) => {
  try {
    const { userId, username, withdrawalAmount, paymentMode, upiId } = req.body;

    // Check if user exists and has sufficient balance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.balance < withdrawalAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Validate payment mode
    if (paymentMode !== "upiTransaction") {
      return res
        .status(400)
        .json({ message: "Invalid payment mode for UPI transaction" });
    }

    // Validate required UPI ID
    if (!upiId) {
      return res
        .status(400)
        .json({ message: "UPI ID is required for UPI transaction" });
    }

    // Create the withdrawal request
    const withdrawalRequest = new Withdrawal({
      userId,
      username,
      withdrawalAmount,
      paymentMode,
      upiId,
    });

    // Save to database
    const savedRequest = await withdrawalRequest.save();

     // Deduct the withdrawal amount from the user's balance
     user.balance -= withdrawalRequest.withdrawalAmount;

     // Save the updated user
     await user.save();

    res.status(201).json({
      message: "Withdrawal request created successfully",
      withdrawal: savedRequest,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Error creating withdrawal request",
        error: error.message,
      });
  }
});

// Get all withdrawal requests with status 'pending'
router.get("/withdrawal/get-data", async (req, res) => {
  try {
    // Query for pending withdrawal requests
    const pendingRequests = await Withdrawal.find({ status: "pending" });

    // Respond with the list of pending requests
    res.status(200).json(pendingRequests);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Error fetching pending withdrawal requests",
        error: error.message,
      });
  }
});

router.post("/withdrawal/:withdrawalReqId/rejected", async (req, res) => {
  try {
    const { withdrawalReqId } = req.params;

    // Find the withdrawal request by ID
    const withdrawalRequest = await Withdrawal.findById(withdrawalReqId);

    if (!withdrawalRequest) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    // Check if the withdrawal request has already been processed
    if (withdrawalRequest.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Withdrawal request has already been processed" });
    }

    withdrawalRequest.status = "rejected";
    withdrawalRequest.rejectedAt = new Date();


    const user = await User.findById(withdrawalRequest.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // add the withdrawal amount from the user's balance
    user.balance += withdrawalRequest.withdrawalAmount;

    // Save the updated user and withdrawal request
    await user.save();
    await withdrawalRequest.save();

    res.status(200).json({
      message: "Withdrawal request rejected successfully",
      withdrawalRequest,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Error processing withdrawal request",
        error: error.message,
      });
  }
});

router.post("/withdrawal/:withdrawalReqId/approved", async (req, res) => {
  try {
    const { withdrawalReqId } = req.params;

    // Find the withdrawal request by ID
    const withdrawalRequest = await Withdrawal.findById(withdrawalReqId);

    if (!withdrawalRequest) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    // Check if the withdrawal request has already been processed
    if (withdrawalRequest.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Withdrawal request has already been processed" });
    }

    // // Find the user associated with the withdrawal request
    // const user = await User.findById(withdrawalRequest.userId);

    // if (!user) {
    //   return res.status(404).json({ message: "User not found" });
    // }

    // // Check if the user has sufficient balance
    // if (user.balance < withdrawalRequest.withdrawalAmount) {
    //   return res.status(400).json({ message: "Insufficient balance" });
    // }

    // // Deduct the withdrawal amount from the user's balance
    // user.balance -= withdrawalRequest.withdrawalAmount;

    // Update the withdrawal request status to 'approved'
    withdrawalRequest.status = "approved";
    withdrawalRequest.approvedAt = new Date();

    // Save the updated user and withdrawal request
    // await user.save();
    await withdrawalRequest.save();

    res.status(200).json({
      message: "Withdrawal request approved successfully",
      withdrawalRequest,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Error processing withdrawal request",
        error: error.message,
      });
  }
});

// In your backend routes file (e.g., routes/auth.js)
router.get("/game-status/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;

    // Find or create game document
    let game = await Game.findOne({ gameId });

    if (!game) {
      // Create new game document if it doesn't exist
      game = new Game({
        gameId,
        winningNumbers: new Array(5).fill(null),
        isActive: true,
      });
      await game.save();
    }

    // Check if we need to create next day's game
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    if (hours === 17 && minutes >= 15) {
      // Create next day's game if it's after 5:15 PM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const day = tomorrow.getDate().toString().padStart(2, "0");
      const month = (tomorrow.getMonth() + 1).toString().padStart(2, "0");
      const year = tomorrow.getFullYear();
      const nextGameId = `GAME${day}${month}${year}`;

      let nextGame = await Game.findOne({ gameId: nextGameId });
      if (!nextGame) {
        nextGame = new Game({
          gameId: nextGameId,
          winningNumbers: new Array(5).fill(null),
          isActive: true,
        });
        await nextGame.save();
      }
    }

    res.json({
      success: true,
      game,
    });
  } catch (error) {
    console.error("Error fetching game status:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching game status",
      error: error.message,
    });
  }
});

// In your backend routes file (e.g., routes/auth.js)
router.get("/user/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        balance: user.balance,
        totalWins: user.totalWins,
        totalBets: user.totalBets,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user data",
      error: error.message,
    });
  }
});

router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    if (admin.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }
    admin.password = undefined;
    res.status(200).json({ message: "Login successful", admin });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/admin/draw-number", async (req, res) => {
  const { slotNumber, winningNumber, gameId } = req.body;

  try {
    // Validate inputs
    if (!slotNumber || !winningNumber || !gameId) {
      return res
        .status(400)
        .json({
          error: "Slot number, winning number, and game ID are required",
        });
    }

    const existingGame = await Game.findOne({ gameId: gameId });
    console.log("Found game:", existingGame);

    if (!existingGame) {
      return res.status(404).json({ error: "Game not found" });
    }
    console.log("Found game:", existingGame.winningNumbers);

    if (existingGame.winningNumbers && (existingGame.winningNumbers[slotNumber-1] !== undefined && existingGame.winningNumbers[slotNumber-1] !== null)) {
      return res
        .status(400)
        .json({
          error: "Winning number already set for this slot",
        });
    }

    // Find and update all bets for the specified slot number
    const result = await Bet.updateMany(
      {
        gameId,
        slotNumber,
        status: "pending", // Only update pending bets
      },
      { $set: { winningNumber } }
    );


    res.status(200).json({
      message: "Winning number updated successfully",
      updatedBets: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating winning number:", error);
    res
      .status(500)
      .json({ error: "Server error while updating winning number" });
  }
});

// Process winners route
router.put("/admin/process-winners", async (req, res) => {
  try {
    const { winningNumber, slotNumber, gameId, multiplier } = req.body;

    if (!winningNumber || !slotNumber || !gameId || !multiplier) {
      return res.status(400).json({
        error:
          "Winning number, slot number, game ID, and multiplier are required",
      });
    }

    // Find or create game document
    let game = await Game.findOne({ gameId });

    if (!game) {
      game = new Game({
        gameId,
        winningNumbers: new Array(5).fill(null),
        isActive: true,
      });
    }

    // Update winning number for the slot
    game.winningNumbers[slotNumber - 1] = winningNumber;
    await game.save();

    // Find pending bets for this game and slot
    const bets = await Bet.find({
      gameId,
      slotNumber,
      status: "pending",
    });

    // Process each bet
    console.log(bets);
    const results = await Promise.all(
      bets.map(async (bet) => {
        const isWinner = bet.selectedNumber === winningNumber;
        const status = isWinner ? "won" : "lost";
        const winAmount = isWinner ? bet.betAmount * multiplier : 0;

        try {
          // Update bet
          await Bet.findByIdAndUpdate(bet._id, {
            status,
            winningNumber,
            winAmount,
          });

          // Update user
          await User.findByIdAndUpdate(bet.userId, {
            $inc: {
              balance: winAmount,
              totalBets: 1,
              totalWins: isWinner ? 1 : 0,
            },
          });

          return { betId: bet._id, userId: bet.userId, status, winAmount };
        } catch (err) {
          console.error(`Error updating bet or user: ${err.message}`);
          return { betId: bet._id, status: "error", message: err.message };
        }
      })
    );

    res.json({
      success: true,
      message: "Game updated and winners processed successfully",
      updatedGame: game,
      processedBets: results,
    });
  } catch (error) {
    console.error("Error processing winners:", error);
    res.status(500).json({
      success: false,
      message: "Error processing winners",
      error: error.message,
    });
  }
});

module.exports = router;
