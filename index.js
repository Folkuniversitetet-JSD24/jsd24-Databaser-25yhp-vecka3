import express from "express";
import mongoose from "mongoose"; // ✅ korrekt – använder default export
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Models/schemas
import User from "./models/User.js";
import Movie from "./models/Movie.js";
import Review from "./models/Review.js";

// Ska koppla oss upp mot Atlas
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.once("open", () => {
  console.log("Mongodb connection established.", mongoose.connection.name);
});

// ----------------------------
// 👤 Användarendpoints
// ----------------------------

// POST för att skapa en user
app.post("/users", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({
      succes: true,
      message: "Användare skapad",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      succes: false,
      error: error.message,
    });
  }
});

// GET för att hämta alla users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      succes: true,
      message: "Alla användare hämtad/hittad från/i DB.",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      succes: false,
      error: error.message,
    });
  }
});

// ----------------------------
// 🎬 Filmer
// ----------------------------

// POST för att skapa en movie
app.post("/movies", async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({
      succes: true,
      message: "Film skapad",
      data: movie,
    });
  } catch (error) {
    res.status(500).json({
      succes: false,
      error: error.message,
    });
  }
});

// ----------------------------
// ⭐ Recensioner
// ----------------------------

// POST för att skapa en review
app.post("/reviews", async (req, res) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json({
      succes: true,
      message: "Recension skapad",
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      succes: false,
      error: error.message,
    });
  }
});

// GET för att hämta alla reviews (Här kommer vi behöva en dubbel populate)
app.get("/reviews", async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "name -_id") // hämtar endast användarnamn
      .populate("movieId", "title -_id"); // hämtar endast titel

    res.status(200).json({
      succes: true,
      message: "Alla recensioner hämtad/hittad från/i DB.",
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      succes: false,
      error: error.message,
    });
  }
});

// ----------------------------
// 📊 Statistik & analyser
// ----------------------------

// GET /movies/ratings – Snittbetyg per film
// ✅ Aggregation med korrekt ObjectId-gruppering och $lookup
app.get("/movies/ratings", async (req, res) => {
  try {
    const result = await Review.aggregate([
      {
        $group: {
          _id: "$movieId", // ObjectId direkt, viktigt: ingen konvertering till string

          avgRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "movies",
          localField: "_id", // ObjectId
          foreignField: "_id", // ObjectId
          as: "movieData",
        },
      },
      { $unwind: "$movieData" },
      {
        $project: {
          _id: 0,
          title: "$movieData.title",
          genre: "$movieData.genre",
          avgRating: 1,
          reviewCount: 1,
        },
      },
      { $sort: { avgRating: -1 } },
    ]);

    res.status(200).json({
      success: true,
      message: "Filmer med recensioner från DB.",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /movies/top-sci-fi – Top 3 filmer i genre "Sci-Fi" med betyg >= 3
// ✅ Använder korrekt .lookup + match + grupp utan dubbletter

// Varför? Denna route demonstrerar en mer avancerad analys i MongoDB med hjälp av .aggregate()
// Här introducerar vi ett fullständigt flöde för att "koppla tabeller", filtrera, gruppera och sortera data – likt en rapport i SQL.
// Mycket användbar för att förstå hur NoSQL kan hantera "queries med relationslogik".
app.get("/movies/top-sci-fi", async (req, res) => {
  try {
    const result = await Review.aggregate([
      {
        $lookup: {
          from: "movies",
          localField: "movieId",
          foreignField: "_id",
          as: "movieData",
        },
      },
      { $unwind: "$movieData" },
      {
        $match: {
          "movieData.genre": "Sci-Fi",
          rating: { $gte: 3 },
        },
      },
      {
        $group: {
          _id: "$movieId", // ObjectId direkt
          title: { $first: "$movieData.title" },
          genre: { $first: "$movieData.genre" },
          avgRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
      { $sort: { avgRating: -1 } },
      { $limit: 3 },
      {
        $project: {
          _id: 0,
          title: 1,
          genre: 1,
          avgRating: 1,
          reviewCount: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Top 3 Filmer med högst betyg inom genre SCI-FI från DB.",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ----------------------------
// 🧪 Utvecklingsverktyg
// ----------------------------

// POST /seed-review – Lägg in en dummy-recension manuellt
// ⚠️ Används endast för test – bör tas bort innan produktion

// Varför? Den här är praktisk för att snabbt lägga till testdata utan att använda frontend eller Postman.

app.post("/seed-review", async (req, res) => {
  try {
    const review = await Review.create({
      rating: 5,
      comment: "EN SEEDAD film",
      movieId: new mongoose.Types.ObjectId("68371072fe398b566cb68262"),
      userId: new mongoose.Types.ObjectId("68371040fe398b566cb68260"),
    });

    res.status(201).json({
      succes: true,
      message: "En recension skapad.",
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      succes: false,
      error: error.message,
    });
  }
});

// Lyssna på servern
app.listen(1212, () => console.log("Servern körs på http://localhost:1212"));
