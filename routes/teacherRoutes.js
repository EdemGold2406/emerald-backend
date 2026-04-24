const express = require('express');
const router = express.Router();

module.exports = (supabase) => {
    router.get('/', async (req, res) => {
        const { data } = await supabase.from('profiles').select('*').eq('role', 'Teacher');
        res.json(data || []);
    });

    router.post('/assign', async (req, res) => {
        const { teacherId, subjectId } = req.body;
        const { error } = await supabase.from('teacher_assignments').insert([{ teacher_id: teacherId, subject_id: subjectId }]);
        res.json({ success: !error });
    });

    return router;
};
