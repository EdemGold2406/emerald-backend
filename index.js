require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get('/', (req, res) => res.send('Backend Online'));

// --- STUDENTS ---
app.get('/api/students', async (req, res) => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'Student');
    res.json(data);
});

app.post('/api/students/lock', async (req, res) => {
    const { level, locked } = req.body;
    await supabase.from('profiles').update({ locked }).eq('level', level);
    res.json({ success: true });
});

// --- TEACHERS ---
app.get('/api/teachers', async (req, res) => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'Teacher');
    res.json(data);
});

app.post('/api/teachers/assign-subject', async (req, res) => {
    const { teacherId, subjectId } = req.body;
    await supabase.from('teacher_assignments').insert({ teacher_id: teacherId, subject_id: subjectId });
    res.json({ success: true });
});

app.post('/api/teachers/make-class-teacher', async (req, res) => {
    const { teacherId, classId } = req.body;
    await supabase.from('teacher_assignments').update({ is_class_teacher: true }).eq('teacher_id', teacherId).eq('class_id', classId);
    res.json({ success: true });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
