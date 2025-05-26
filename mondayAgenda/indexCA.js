import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import UserCA from "./modelsCA/UserCA.js";
import PostCA from "./modelsCA/PostCA.js";

dotenv.config();
const app = express();
app.use(express.json());

// Nu kopplar vi upp oss mot Atlas – den här strängen döljer vi i vår .env så att vi inte råkar pusha lösenord till GitHub.
mongoose.connect(process.env.MONGODB_URI);

// Skapa en ny användare – enkel route.
app.post("/usersCA", async (req, res) => {
  const userCA = await UserCA.create(req.body);
  res.json(userCA);
});

// Vi vill kunna hämta alla användare. Vi använder UserCA.find() utan filter just nu.
app.get("/usersCA", async (req, res) => {
  const users = await UserCA.find();
  res.json(users);
});

// Den här routen skapar ett nytt inlägg (postCA) i databasen.
// Viktigt att förstå här: vi skickar med ett userCA-fält i request-bodyn, och det ska vara ett ID från en existerande användare.
// Det betyder att vi INTE sparar hela användarobjektet i posten – bara en referens (precis som en foreign key i SQL).
// Det här är grunden till hur vi skapar relationer i MongoDB med hjälp av Mongoose.
// Vi kan sedan använda .populate() i andra routes för att hämta den fullständiga användardatan, om det behövs.
app.post("/postsCA", async (req, res) => {
  const postCA = await PostCA.create(req.body);
  res.json(postCA);
});
// Här är det avgörande att förstå att relationen sker via ID:t. När ni skickar en ny post i Postman, måste userCA vara ett giltigt ID från en användare ni redan skapat.
// Det här är alltså det praktiska momentet av relationsdatamodellering i MongoDB – och motsvarar det vi annars gör med FOREIGN KEY i SQL.

// Här kan vi skapa en route med ett fält userCA som innehåller användarens ID. Vi sparar alltså en relation, inte hela användaren.
app.get("/postsCA", async (req, res) => {
  // I vanliga fall skulle vi bara få ett ID – men med .populate() ersätts ID:t med hela användarobjektet.”

  // “Det här är väldigt likt en SQL JOIN – fast i MongoDB-form.
  const postsCA = await PostCA.find().populate("userCA");

  // Detta ger full lista med användardata.

  res.json(postsCA);
});

// ✅ Ny route /postsCA/clean
// Detta är en alternativ route till /postsCA
// Här lär vi oss hur man kan styra exakt vilka fält som returneras i API-svaret
// Det är vanligt när man bygger appar med feeds eller listor som bara ska visa ett urval av information

app.get("/postsCA/clean", async (req, res) => {
  // Vi använder .populate() precis som tidigare – men nu specificerar vi EXAKT vilka fält vi vill hämta från den refererade användaren
  // Vi tar bara med namn och e-post (nameCA och emailCA), men utesluter MongoDB:s automatiska _id-fält
  // Detta är bra om vi inte behöver användarens ID i frontend just nu – t.ex. för en enkel visning
  // `-` betyder "ta bort" i MongoDB-syntax, så "-_id" betyder: ta bort det här fältet

  const postsCA = await PostCA.find()
    .populate("userCA", "nameCA emailCA -_id") // hämta bara nameCA och emailCA från userCA, utan _id.
    .select("titleCA contentCA userCA -_id"); // hämta endast postens titel, innehåll och användare (utan _id)

  // Detta är ett exempel på hur man anpassar svaret till frontendens behov – t.ex. när man bygger en nyhetsfeed
  // Det minskar mängden data vi skickar, vilket gör vår app snabbare och tydligare

  res.json(postsCA);
});

// "Nu skapar vi en alternativ route till vår GET /postsCA. Den ska visa exakt det vi vill ha – varken mer eller mindre.
// Det är superviktigt i verkliga appar där vi inte vill skicka onödig data till frontend, både av prestandaskäl och säkerhetsskäl.
// Här använder vi .populate() som vanligt, men vi begränsar fälten. Vi tar bara med nameCA och emailCA från användaren – alltså det som är relevant för visningen.
// Vi lägger också till .select() för själva posten, där vi väljer ut titleCA, contentCA och userCA.
// Och vi tar bort _id från båda nivåerna – eftersom vi kanske inte behöver dem just nu.
// Det här är alltså som att säga: vi vill bara ha exakt det som ska synas i gränssnittet – inget annat.

// Tänk om vi bara vill visa de 5 senaste inläggen? Då kan vi lägga till sort() och limit() i vår query."

app.get("/postsCA/latest", async (req, res) => {
  const latestPosts = await PostCA.find()
    .populate("userCA")
    .sort({ createdAt: -1 })
    .limit(5);

  // Nu sorterar vi på createdAt och visar bara de fem senaste posterna. Här ser ni nyttan med timestamps: true.”

  res.json(latestPosts);
});

// Nu har vi inte bara skapat relationer – vi kan även kontrollera hur datan presenteras. Det här är grunden till hur man bygger feed-flöden, sorteringsfunktioner och filtrering i riktiga appar.

app.listen(3210, () => console.log("Server på http://localhost:3210"));
