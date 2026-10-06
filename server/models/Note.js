
const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    favorite: {
  type: Boolean,
  default: false,
},

isDeleted: {
  type: Boolean,
  default: false,
},
  },
  { timestamps: true }

  
);

module.exports = mongoose.model("Note", noteSchema);