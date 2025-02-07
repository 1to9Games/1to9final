const mongoose = require('mongoose');

const GameSlot = new mongoose.Schema( {
    gameId: { type: String,unique:true, required: true }, // eg: GAMEddmmyyyy
    isActive: { type: Boolean, default: true },
    winningNumbers: [],
    account1: {
      qrImage: {type:String },
      ifscCode: {type : String},
      accountNumber: {type : String},
    },
    account2: {
      qrImage: {type:String },
      ifscCode: {type : String},
      accountNumber: {type : String},
    },
    createdAt: { type: Date, default: Date.now },
  });

  const Game = mongoose.model('Game', GameSlot);
  module.exports = Game;