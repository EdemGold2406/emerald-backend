const express = require('express');
const router = express.Router();

module.exports = (supabase) => {
    // READ ALL
    router.get('/', async (req, res) => {
        const { data, error } = await supabase.from('profiles').select('*').eq('role', 'Student');
        res.json(data || []);
    });

    // CREATE
    router.post('/add', async (req, res) => {
        const { first_name, surname, email, reg_no } = req.body;
        const { data, error } = await supabase.from('profiles').insert([{ first_name, surname, email, reg_no, role: 'Student' }]);
        res.json({ success: !error, error });
    });

    // DELETE
    router.delete('/:id', async (req, res) => {
    const { error } = await supabase.from('profiles').delete().eq('id', req.params.id);
    res.json({ success: !error });
});

    return router;
};
