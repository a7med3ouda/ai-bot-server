import dotenv from "dotenv";
dotenv.config();
import express from "express";

const app = express();
const port = 8090;

app.use(express.json());

app.get("/", (req, res) => {
  res.json("Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
