require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Import Routes and pass the supabase client to them
const studentRoutes = require('./routes/studentRoutes')(supabase);
const teacherRoutes = require('./routes/teacherRoutes')(supabase);

app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);

app.get('/', (req, res) => res.send('Emerald Core Backend Online'));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Backend ready on ${PORT}`));
