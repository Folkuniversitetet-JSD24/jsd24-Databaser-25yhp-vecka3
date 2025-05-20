import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import UserCA from "./modelsCA/UserCA.js";
import MovieCA from "./modelsCA/MovieCA.js";
import ReviewCA from "./modelsCA/ReviewCA.js";

dotenv.config();
const app = express();
app.use(express.json());

// Nu kopplar vi upp oss mot Atlas – den här strängen döljer vi i vår .env så att vi inte råkar pusha lösenord till GitHub.
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.once("open", () => {
  console.log(
    "✅ MongoDB connection established to:",
    mongoose.connection.name
  );
});

// Skapa en ny användare
app.post("/usersCA", async (req, res) => {
  // 🔐 Vi använder try/catch för att hantera eventuella fel som kan uppstå – t.ex. om e-posten redan finns (unique), eller databasen inte svarar.
  // Det här mönstret används alltid i produktionskod.
  try {
    const userCA = await UserCA.create(req.body);
    res.status(201).json(userCA);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vi vill kunna hämta alla användare. Vi använder UserCA.find() utan filter just nu.
app.get("/usersCA", async (req, res) => {
  try {
    const users = await UserCA.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST Movie
app.post("/moviesCA", async (req, res) => {
  try {
    const movie = await MovieCA.create(req.body);
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST Review
app.post("/reviewsCA", async (req, res) => {
  try {
    const review = await ReviewCA.create(req.body);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  // “Här skapar vi en recension – notera att movieIdCA och userIdCA ska vara MongoDB-ID:n.”
});

// GET /reviewsCA (dubbel populate)
app.get("/reviewsCA", async (req, res) => {
  try {
    const reviews = await ReviewCA.find()
      .populate("userIdCA", "nameCA -_id")
      .populate("movieIdCA", "titleCA -_id");
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  // Titta här i GET /reviewsCA – om vi bara använt .find() så hade vi fått userIdCA och movieIdCA som ID:n. Men med .populate() fyller vi ut hela objektet automatiskt.”
  // Här använder vi .populate() två gånger: en gång för att hämta användarnamnet och en gång för filmtiteln. Det här är som två JOINs i ett.

  // Detta motsvarar en JOIN i SQL – men mycket enklare. Vi får alla användaruppgifter och filmtitlar direkt utan att slå upp dem manuellt.
});

// GET /moviesCA/ratingsCA → Snittbetyg per film + genre, med $lookup istället för .populate()
app.get("/moviesCA/ratingsCA", async (req, res) => {
  try {
    const result = await ReviewCA.aggregate([
      {
        $group: {
          _id: "$movieIdCA",
          avgRatingCA: { $avg: "$ratingCA" },
          reviewCountCA: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "moviecas", // MongoDB använder lowercase + plural
          localField: "_id", // _id = movieIdCA
          foreignField: "_id", // matchar mot Movie-dokumentens _id
          as: "movieData",
        },
      },
      { $unwind: "$movieData" }, // Tar ut movieData ur array
      {
        $project: {
          _id: 0,
          titleCA: "$movieData.titleCA",
          genreCA: "$movieData.genreCA",
          avgRatingCA: 1,
          reviewCountCA: 1,
        },
      },
      { $sort: { avgRatingCA: -1 } },
    ]);
    // 🧠 Förklara live:
    // Detta är en databehandlingspipeline – som ett produktionsband där varje steg bygger på det föregående.
    // Vi använder $group för att gruppera recensionerna per film.
    // För varje grupp räknar vi ut snittbetyg ($avg) och antal recensioner ($sum).
    // Sedan hämtar vi filminformation via $lookup – motsvarande en JOIN i SQL.
    // $unwind gör att vi får ett enskilt objekt istället för en array.
    // $project används för att bestämma exakt vilka fält som ska visas – precis som SELECT col1, col2 i SQL.
    // Slutligen sorterar vi med $sort – motsvarar ORDER BY i SQL.

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/seed-review", async (req, res) => {
  try {
    const review = await ReviewCA.create({
      ratingCA: 5,
      commentCA: "Seedad film",
      movieIdCA: new mongoose.Types.ObjectId("6650fc1ed1f081d2a8a9fa92"),
      userIdCA: new mongoose.Types.ObjectId("6650fbcfd1f081d2a8a9fa91"),
    });
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /moviesCA/top-sci-fiCA → Top 3 Sci-Fi-filmer med högst betyg
app.get("/moviesCA/top-sci-fiCA", async (req, res) => {
  try {
    const result = await ReviewCA.aggregate([
      {
        $lookup: {
          from: "moviecas",
          localField: "movieIdCA",
          foreignField: "_id",
          as: "movieData",
        },
      },
      { $unwind: "$movieData" },
      { $match: { "movieData.genreCA": "Sci-Fi", ratingCA: { $gte: 3 } } },
      {
        $group: {
          _id: "$movieData._id",
          titleCA: { $first: "$movieData.titleCA" },
          genreCA: { $first: "$movieData.genreCA" },
          avgRatingCA: { $avg: "$ratingCA" },
          reviewCountCA: { $sum: 1 },
        },
      },
      { $sort: { avgRatingCA: -1 } },
      { $limit: 3 },
      {
        $project: {
          _id: 0,
          titleCA: 1,
          genreCA: 1,
          avgRatingCA: 1,
          reviewCountCA: 1,
        },
      },
    ]);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

  // 🧠 Förklara live:
  // Det här är en avancerad pipeline som visar de bäst betygsatta Sci-Fi-filmerna.
  // $lookup fungerar som en JOIN för att koppla in metadata om filmer.
  // $unwind gör att vi får en film som objekt istället för array.
  // $match filtrerar så att vi bara tittar på Sci-Fi-filmer med betyg ≥ 3.
  // $group räknar ut genomsnittligt betyg och antal recensioner per film – motsvarar GROUP BY i SQL.
  // $sort och $limit plockar ut de tre filmer med högst snittbetyg.
  // $project används för att formatera svaret – som SELECT title, genre, avg i SQL.
  // Hela pipelinen fungerar som ett produktionsband där varje steg förfinar datan.
});

app.listen(3210, () => console.log("Server på http://localhost:3210"));
