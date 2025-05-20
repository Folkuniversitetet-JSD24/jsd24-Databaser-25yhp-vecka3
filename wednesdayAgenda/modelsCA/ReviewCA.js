import mongoose from "mongoose";

const reviewSchemaCA = new mongoose.Schema({
  ratingCA: { type: Number, min: 1, max: 10, required: true },
  commentCA: String,
  movieIdCA: { type: mongoose.Schema.Types.ObjectId, ref: "MovieCA" },
  userIdCA: { type: mongoose.Schema.Types.ObjectId, ref: "UserCA" },
  createdAtCA: { type: Date, default: Date.now },
});

export default mongoose.model("ReviewCA", reviewSchemaCA);

// “Nu knyter vi ihop alla modeller – varje recension refererar både till en användare och en film.”
