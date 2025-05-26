import mongoose from "mongoose";

// Skapa schema får våra Posts(inlägg),
const postSchema = new mongoose.Schema(
  {
    title: { type: String },
    content: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  //   Timestamp true för att för createdAt och updatedAt automagiskt, för att sen kunna sortera.
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
