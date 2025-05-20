import mongoose from "mongoose";

// Vi skapar ett schema för våra användare
// nameCA och emailCA är båda obligatoriska (required: true)
// emailCA måste dessutom vara unikt – vi tillåter alltså inte två användare med samma e-postadress
// Denna validering sker automatiskt av Mongoose och MongoDB – vi slipper alltså manuell kontroll i backendkoden

const userSchemaCA = new mongoose.Schema({
  nameCA: { type: String, required: true },
  emailCA: { type: String, required: true, unique: true },
});

// Vi exporterar en Mongoose-modell baserat på schemat
// Det är den här modellen vi använder i vår controller/server för att skapa och hämta användare
export default mongoose.model("UserCA", userSchemaCA);
