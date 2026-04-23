require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const Groq = require('groq-sdk');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

// 1. TEST DATABASE CONNECTION
app.get('/test-db', async (req, res) => {
    try {
        const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        if (error) throw error;
        res.json({ status: "Connected!", studentCount: count });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. BULK UPLOAD (Provisioning)
app.post('/api/provision-students', upload.single('file'), async (req, res) => {
    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        
        const students = data.map(s => ({
            first_name: s.first_name,
            surname: s.surname,
            email: `${s.first_name.toLowerCase()}${s.surname.toLowerCase()}@efa.sch.ng`,
            role: 'Student',
            reg_no: s.reg_no
        }));

        const { error } = await supabase.from('profiles').insert(students);
        if (error) throw error;
        res.json({ message: `Successfully provisioned ${students.length} students.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. AI COPILOT
app.post('/api/copilot', async (req, res) => {
  const { messages, userRole, context } = req.body;
  const lastMessage = messages[messages.length - 1].content.toLowerCase();

  try {
    let dbInfo = "";
    if (lastMessage.includes('total') || lastMessage.includes('how many')) {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      dbInfo = `There are currently ${count} students registered in the database.`;
    }

    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: `You are Emerald, an executive assistant. ${dbInfo}. If asked to navigate, return JSON: {"action": "navigate", "path": "/your-path"}.` },
        ...messages
      ],
      temperature: 0.5,
    });
    res.json({ reply: chatCompletion.choices[0].message.content });
  } catch (error) { res.status(500).json({ reply: "I'm offline. Check logs." }); }
});
// student records API
app.get('/api/students', async (req, res) => {
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('role', 'Student');
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/students/lock', async (req, res) => {
  const { level, locked } = req.body;
  try {
    const { data, error } = await supabase.from('profiles').update({ locked }).eq('level', level);
    if (error) throw error;
    res.json({ message: "Cohort lock status updated" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
