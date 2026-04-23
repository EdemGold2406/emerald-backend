require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get('/', (req, res) => res.send('Emerald Backend Online'));

// This is the route you were trying to reach
app.get('/api/students', async (req, res) => {
    try {
        const { data, error } = await supabase.from('profiles').select('*').eq('role', 'Student');
        if (error) throw error;
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// This is your Test route
app.get('/test-db', async (req, res) => {
    try {
        const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        if (error) throw error;
        res.json({ status: "Connected!", studentCount: count });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
