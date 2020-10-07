// import mongoose from "mongoose";

const mongoose = require("mongoose");

const Message = mongoose.Schema({
  message: String,
  name: String,
  timestamp: String,
  received: Boolean,
});

module.exports = mongoose.model("messages", Message);

// export default mongoose.model("messageContent", whatsappSchema);
