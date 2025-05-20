import mongoose from "mongoose";

const movieSchemaCA = new mongoose.Schema({
  titleCA: { type: String, required: true },
  genreCA: String,
  releaseYearCA: Number,
  directorCA: String,
});

export default mongoose.model("MovieCA", movieSchemaCA);

// “Här skapar vi en filmsamling – inga relationer här än, men vi kommer använda _id från filmen när vi skapar en recension.”
