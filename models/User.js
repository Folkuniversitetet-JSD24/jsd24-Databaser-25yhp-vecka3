import mongoose from "mongoose"; // ✅ korrekt

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

export default mongoose.model("User", userSchema);
