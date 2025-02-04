const mongoose = require('mongoose');

const GameSlot = new mongoose.Schema( {
    gameId: { type: String,unique:true, required: true }, // eg: GAMEddmmyyyy
    isActive: { type: Boolean, default: true },
    winningNumbers: [],
    qrImage: {type:String },
    ifscCode: {type : String},
    accountNumber: {type : String},
    createdAt: { type: Date, default: Date.now },
  });

  const Game = mongoose.model('Game', GameSlot);
  module.exports = Game;