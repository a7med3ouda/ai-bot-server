import * as dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";
import caputchaGuard from "./caputchaGuard";
import rateLimit, { Options } from "express-rate-limit";

const app = express();
const port = process.env.PORT || 8090;

const aiConfig = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});

const openai = new OpenAIApi(aiConfig);

const limiterOptions: Partial<Options> = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 12, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "Too many messages, please try again after an hour",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
};

app.use(cors());
app.use(express.json());

const serverRunning = async (req: Request, res: Response) => {
  return res.json("Server is running");
};

app
  .get("/", serverRunning)
  .get("/api", serverRunning)
  .post(
    "/api",
    caputchaGuard,
    rateLimit(limiterOptions),
    async (req: Request, res: Response) => {
      try {
        const message = req.body.message as string;

        const formattedMsg = message
          .trim()
          .split(" ")
          .filter((x) => x)
          .join(" ");
        if (!formattedMsg) return res.status(400).json("Invalid Message");

        const aiResponse = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: `${message}`,
          temperature: 0.7,
          max_tokens: 4000,
          top_p: 1,
          frequency_penalty: 0.5,
          presence_penalty: 0,
        });

        return res.json({
          message: aiResponse.data.choices[0].text,
        });
      } catch (error: any) {
        return res.status(500).json({
          subject: "bot",
          message: error.message,
        });
      }
    }
  )
  .all("/*", async (_, res) => {
    return res.status(404).json("Error 404 Route Not Found");
  });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
