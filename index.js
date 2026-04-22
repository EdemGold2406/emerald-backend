const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// The AI Copilot Endpoint
app.post('/api/copilot', async (req, res) => {
  const { messages, userRole, context } = req.body;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: `You are Emerald, an executive assistant for Emerald Field School. 
          User Role: ${userRole}. Current Context: ${context}.
          You can navigate pages by returning JSON like {"action": "navigate", "path": "/admin"}.
          Only allow actions permitted by the user's role.` },
        ...messages
      ],
      temperature: 0.5,
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Supabase Setup (Variables will be added in Render)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

// Memory storage for Excel uploads
const upload = multer({ storage: multer.memoryStorage() });

// Basic Route
app.get('/', (req, res) => {
  res.send('Emerald Field Backend is Running!');
});

// Endpoint: Upload Students via Excel
app.post('/api/upload-students', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send('No file uploaded.');
    
    const xlsx = require('xlsx');
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Here you would loop through 'data', generate emails (e.g., aasuquo@efa.sch.ng),
    // and push to Supabase.
    
    res.status(200).json({ message: "File parsed successfully", studentCount: data.length, preview: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
