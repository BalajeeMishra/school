const mongoose = require("mongoose");
const SubjectSchema = new mongoose.Schema({
  markDetail: [
    {
      subject: String,
      mark: Number,
      _id: false,
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  pdf_path: {
    type: String,
    default: "",
  },
  name: {
    type: String,
    required: true,
  },
  monthly: [
    {
      class: String,
      fees: Number,
    },
  ],
});
const Mark = mongoose.model("Mark", SubjectSchema);
module.exports = Mark;
