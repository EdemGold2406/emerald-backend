require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const upload = multer({ storage: multer.memoryStorage() });

app.get('/api/test-db', async (req, res) => {
    try {
        const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        res.json({ status: "Connected!", studentCount: count });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// CORE FUNCTION: Upload and Save Results
app.post('/api/upload-results', upload.single('file'), async (req, res) => {
    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json(sheet);

        // Map Excel rows to Supabase format
        const resultsToInsert = rows.map(row => ({
            student_id: row.student_id,
            subject_id: row.subject_id,
            term_id: row.term_id,
            cat_1: row.cat_1,
            cat_2: row.cat_2,
            misc: row.misc,
            exam: row.exam,
            remark: row.remark
        }));

        const { error } = await supabase.from('results').insert(resultsToInsert);
        if (error) throw error;

        res.json({ message: "Results uploaded successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
