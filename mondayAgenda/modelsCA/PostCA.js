import mongoose from "mongoose";

// Här definierar vi ett schema för våra inlägg
// titleCA och contentCA är fria strängar – alltså inga valideringskrav här
// userCA innehåller en referens till en användare via ObjectId – det är så vi skapar relationen,l det fungerar ungefär som en foreign key.
// Vi pekar på UserCA-modellen (ref: "UserCA"), vilket gör att .populate() senare vet vad som ska hämtas

const postSchemaCA = new mongoose.Schema(
  {
    titleCA: String,
    contentCA: String,
    userCA: { type: mongoose.Schema.Types.ObjectId, ref: "UserCA" },
  },
  // timestamps: true skapar automatiskt createdAt och updatedAt för varje dokument
  // Det gör det enkelt att sortera poster på tid (t.ex. senaste först)
  { timestamps: true }
);

// Exportera modellen så att den kan användas i routes/controller
export default mongoose.model("PostCA", postSchemaCA);
