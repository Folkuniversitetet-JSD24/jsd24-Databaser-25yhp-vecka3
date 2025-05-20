import mongoose from "mongoose";

const userSchemaCA = new mongoose.Schema({
  nameCA: { type: String, required: true },
  emailCA: { type: String, required: true, unique: true },
});

export default mongoose.model("UserCA", userSchemaCA);

// Vi använder oss av måndagens lektions modeller för att spara lite tid och avancera på det som vi känner igenom oss på.
