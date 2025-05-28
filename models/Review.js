import mongoose from "mongoose"; // ✅ korrekt

const reviewSchema = new mongoose.Schema(
  {
    rating: { type: Number, min: 1, max: 10, required: true },
    comment: String,
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    //   createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
