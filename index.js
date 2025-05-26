import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Importera våra scheman/modeller
import User from "./models/User.js";
import Post from "./models/Post.js";

dotenv.config();
const app = express();
app.use(express.json());

// Koppla upp oss mot Atlas
mongoose.connect(process.env.MONGODB_URI);

// Route för att skapa en ny användare, En POST route
app.post("/users", async (req, res) => {
  const user = await User.create(req.body);

  res.status(201).json(user);
});

// Route för att hämta alla användare, En GET route
app.get("/users", async (req, res) => {
  const users = await User.find();

  res.status(200).json(users);
});

// Route för att skapa en ny "Post", En POST route
app.post("/posts", async (req, res) => {
  const post = await Post.create(req.body);

  res.status(201).json(post);
});

// Route till "/Post", En GET route, som lägger in ett userfält/key som innehåller användarens id i Post/inlägget, så lägga till/spara en relation
app.get("/posts", async (req, res) => {
  const posts = await Post.find().populate("user");

  // Detta kommer ge oss en full lista som innnehåller userdatan.

  res.status(200).json(posts);
});

// GET Route till "/Post/clean" , för att styra vilka exakta fält som retuneras i API-svaret med populate().
app.get("/posts/clean", async (req, res) => {
  const posts = await Post.find()
    .populate("user", "name email -_id")
    .select("title content user -_id");

  res.status(200).json(posts);
});

// GET Route till "/Post/latest" , för att träna på sortera och begränsa vårat API-svar.
app.get("/posts/latest", async (req, res) => {
  const latestPosts = await Post.find()
    .populate("user")
    .sort({ createdAt: -1 })
    .limit(3);

  res.status(200).json(latestPosts);
});

// Lyssna å servern:
app.listen(8888, () => console.log("http://localhost:8888"));
