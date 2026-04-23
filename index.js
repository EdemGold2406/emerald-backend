require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// LAZY INITIALIZATION
// We don't crash the server here; we check for the keys later when used
const getSupabase = () => {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
        throw new Error("SUPABASE_URL or SUPABASE_KEY missing in environment variables!");
    }
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
};

app.get('/api/test-db', async (req, res) => {
    try {
        const supabase = getSupabase();
        const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        if (error) throw error;
        res.json({ status: "Connected!", studentCount: count });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/students', async (req, res) => {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase.from('profiles').select('*').eq('role', 'Student');
        if (error) throw error;
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(10000, () => console.log("Backend running on 10000"));
