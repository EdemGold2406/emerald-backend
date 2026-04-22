require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
// Enable CORS for your specific frontend URL
app.use(cors({ origin: "*" })); 
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.get('/', (req, res) => res.send('Emerald Backend Online'));

app.post('/api/copilot', async (req, res) => {
  const { messages, userRole, context } = req.body;

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { 
          role: "system", 
          content: `You are Emerald, an executive assistant for Emerald Field School. 
          Current Page Context: ${context}. User Role: ${userRole}.
          If the user asks to go to a page, return ONLY this JSON: {"action": "navigate", "path": "/your-path"}.
          Otherwise, provide a helpful, concise text response. Be professional and supportive.` 
        },
        ...messages
      ],
      temperature: 0.5,
    });

    res.json({ reply: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error("Groq Error:", error);
    res.status(500).json({ error: "Failed to reach AI." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
