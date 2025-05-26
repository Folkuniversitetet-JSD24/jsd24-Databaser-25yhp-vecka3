import mongoose from "mongoose";

// Skapa schema får våra users
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

export default mongoose.model("User", userSchema);
