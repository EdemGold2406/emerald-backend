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
    // CREATE (Individual)
   router.post('/add', async (req, res) => {
    const { first_name, surname, reg_no } = req.body;
    const password = Math.random().toString(36).slice(-8); // Generate 8-char random pass
    const email = `${first_name.toLowerCase()}${surname.toLowerCase()}@efa.sch.ng`;

    const { data, error } = await supabase
        .from('profiles')
        .insert([{ first_name, surname, email, reg_no, password, role: 'Student' }])
        .select(); // IMPORTANT: This returns the newly created row!

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]); // Send back the object with the credentials
});

    // DELETE
    router.delete('/:id', async (req, res) => {
    const { error } = await supabase.from('profiles').delete().eq('id', req.params.id);
    res.json({ success: !error });
});

    return router;
};
