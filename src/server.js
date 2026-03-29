import express from 'express';
import cors from 'cors';
import chalk from 'chalk';
import db from './db.js';

const app = express()
const PORT = 3001;

app.use(cors());
app.use(express.json());

// GET /habits - list all habits
app.get('/habits', (req, res) => {
    const habits = db.prepare('SELECT * FROM habits').all();
    res.json(habits);
});

// GET /habits/:id - get a habit by ID
app.get('/habits/:id', (req, res) => {
    const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(req.params.id);
    if (!habit) {
        return res.status(404).json({ error: "Habit not found" });
    }
    res.json(habit);
})

// POST /habits - create a habit
app.post('/habits', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }
    const stmt = db.prepare('INSERT INTO habits (name) VALUES (?)');
    const result = stmt.run(name);
    const newHabit = db.prepare('SELECT * FROM habits WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newHabit);
});

// PATCH /habits/:id/complete - mark a habit complete
app.patch('/habits/:id/complete', (req, res) => {
    const result = db.prepare('UPDATE habits SET done = 1 WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
        return res.status(404).json({ error: 'Habit not found' });
    }
    const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(req.params.id);
    res.json(habit);
})

// DELETE /habits/:id - delete a habit by ID
app.delete('/habits/:id', (req, res) => {
    const result = db.prepare('DELETE FROM habits WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
        return res.status(404).json({ error: 'Habit not found' });
    }
    res.status(204).send()
});

app.listen(PORT, () => {
    console.log(chalk.green(`Server running on http://localhost:${PORT}`));
});
