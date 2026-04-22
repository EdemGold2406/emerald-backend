require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// Initialize Supabase with the key we just fixed
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.get('/', (req, res) => res.send('Emerald Backend Online'));

app.post('/api/copilot', async (req, res) => {
  const { messages, userRole, context } = req.body;
  const lastMessage = messages[messages.length - 1].content.toLowerCase();

  try {
    let dbInfo = "";
    
    // IF USER ASKS FOR STUDENT COUNT, FETCH FROM SUPABASE
    if (lastMessage.includes('total') || lastMessage.includes('how many')) {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        dbInfo = `Database report: There are exactly ${count} students in the profiles table.`;
      }
    }

    // AI Processing with Database Context
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { 
          role: "system", 
          content: `You are Emerald, an executive assistant for Emerald Field School. 
          Context: ${dbInfo}. Current Page: ${context}. User Role: ${userRole}.
          If the user asks for a total count, use the database report provided.
          If the user asks to navigate, return JSON: {"action": "navigate", "path": "/your-path"}.` 
        },
        ...messages
      ],
      temperature: 0.5,
    });

    res.json({ reply: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ reply: "I'm having trouble reading the database. Check logs." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
