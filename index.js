require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const { createClient } = require('@supabase/supabase-js'); // 1. Import Supabase

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// 2. Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.get('/', (req, res) => res.send('Emerald Backend Online'));

// 3. Updated Copilot Endpoint that can talk to Supabase
app.post('/api/copilot', async (req, res) => {
  const { messages, userRole, context } = req.body;
  const lastMessage = messages[messages.length - 1].content;

  try {
    // A. Check if the user is asking for specific student data
    if (lastMessage.toLowerCase().includes('result') || lastMessage.toLowerCase().includes('average')) {
      const { data, error } = await supabase
        .from('results')
        .select('*, subjects(name)')
        .limit(5); // This fetches real data from your DB!
      
      if (data) {
        // We inject the database data into the AI prompt so it knows the answer
        messages.push({ role: "system", content: `Here is the student data from the database: ${JSON.stringify(data)}` });
      }
    }

    // B. AI Processing
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: `You are Emerald. Current Page: ${context}. 
          If user asks for navigation, return JSON: {"action": "navigate", "path": "/your-path"}. 
          If user asks for data, use the provided context to answer.` },
        ...messages
      ],
      temperature: 0.5,
    });

    res.json({ reply: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to connect to AI/Database" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
