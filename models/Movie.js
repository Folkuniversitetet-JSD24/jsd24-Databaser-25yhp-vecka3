import mongoose from "mongoose"; // ✅ korrekt

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  //   genre: { type: String },
  genre: String,
  //   releaseYear: { type: Number },
  releaseYear: Number,
  director: String,
});

export default mongoose.model("Movie", movieSchema);
