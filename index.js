require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const { createClient } = require('@supabase/supabase-js');

// 1. CREATE THE APP FIRST
const app = express();

// 2. SETUP MIDDLEWARE
app.use(cors({ origin: "*" }));
app.use(express.json());

// 3. INITIALIZE CLIENTS
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 4. DEFINE ROUTES (Now 'app' is defined and safe to use)
app.get('/', (req, res) => res.send('Emerald Backend Online'));

app.post('/api/copilot', async (req, res) => {
  const { messages, userRole, context } = req.body;
  const lastMessage = messages[messages.length - 1].content.toLowerCase();

  try {
    console.log("Received request for:", lastMessage);

    let dbInfo = "";
    
    // Check if the user is asking for student count
    if (lastMessage.includes('total') || lastMessage.includes('how many') || lastMessage.includes('number of students')) {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error("Supabase Error:", error);
        dbInfo = "I am unable to access the student database right now.";
      } else {
        dbInfo = `There are currently ${count} students registered in the Emerald Field database.`;
      }
    }

    // AI Processing
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { 
          role: "system", 
          content: `You are Emerald, an executive assistant for Emerald Field School. 
          System Data: ${dbInfo}
          Current Page: ${context}. 
          If the user asks for a total count, use the System Data provided.
          If the user asks to navigate, return ONLY this JSON: {"action": "navigate", "path": "/your-path"}.
          Otherwise, be professional and helpful.` 
        },
        ...messages
      ],
      temperature: 0.5,
    });

    res.json({ reply: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error("Critical Backend Error:", error);
    res.status(500).json({ reply: "I'm having trouble connecting to my database and brain. Check the logs." });
  }
});

// 5. START SERVER
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
