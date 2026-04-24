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

// --- TEACHERS ROUTE ---
app.get('/api/teachers', async (req, res) => {
    // Try both lowercase and capitalized to be safe
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or('role.eq.Teacher,role.eq.teacher'); 
    
    if (error) {
        console.error("Supabase Error:", error);
        return res.status(500).json({ error: error.message });
    }
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
app.post('/api/students/bulk', upload.single('file'), async (req, res) => {
    try {
        const { class_id } = req.body; // Admin selects target class
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        
        const students = data.map(s => ({
            first_name: s.first_name,
            surname: s.surname,
            email: `${s.first_name.toLowerCase()}${s.surname.toLowerCase()}@efa.sch.ng`,
            role: 'Student',
            reg_no: s.reg_no,
            class_id: class_id // Attach to class
        }));

        const { error } = await supabase.from('profiles').insert(students);
        if (error) throw error;
        res.json({ message: "Bulk upload successful!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/students/add-individual', async (req, res) => {
    try {
        const { first_name, surname, reg_no, class_id } = req.body;
        const student = {
            first_name, surname, reg_no, class_id,
            email: `${first_name.toLowerCase()}${surname.toLowerCase()}@efa.sch.ng`,
            role: 'Student'
        };
        const { error } = await supabase.from('profiles').insert([student]);
        if (error) throw error;
        res.json({ message: "Student added successfully!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
