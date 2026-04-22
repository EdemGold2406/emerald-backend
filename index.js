require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(require('cors')());
app.use(express.json());

// Verify variables exist
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error("CRITICAL: SUPABASE_URL or SUPABASE_KEY is missing!");
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get('/test-db', async (req, res) => {
    try {
        const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        if (error) throw error;
        res.json({ status: "Database Connected!", studentCount: count });
    } catch (err) {
        res.status(500).json({ status: "Error", message: err.message });
    }
});

app.listen(10000, () => console.log("Backend running on 10000"));
