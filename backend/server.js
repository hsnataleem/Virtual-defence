require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body;

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: message,
        });

        res.json({
            text: result.text,
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: err.message,
        });
    }
});

app.listen(4000, () => {
    console.log("Server running on port 4000");
});