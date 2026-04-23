require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase - ensure your env variables are set in Render
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get('/', (req, res) => res.send('Emerald Backend Online'));

app.get('/api/students', async (req, res) => {
    try {
        const { data, error } = await supabase.from('profiles').select('*').eq('role', 'Student');
        if (error) throw error;
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// IMPORTANT: Use process.env.PORT, otherwise Render will kill the app
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
