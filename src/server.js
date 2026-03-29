import express from 'express';
import cors from 'cors';
import chalk from 'chalk';
import db from './db.js';
import { register, login, verifyToken } from './auth.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express()
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Register
app.post('/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await register(email, password);
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const result = await login(email, password);
        res.json(result);
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
});

function requireAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer token auth

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
}

// GET /habits - list all habits
app.get('/habits', requireAuth, (req, res) => {
    const habits = db.prepare('SELECT * FROM habits').all();
    res.json(habits);
});

// GET /habits/:id - get a habit by ID
app.get('/habits/:id', requireAuth, (req, res) => {
    const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(req.params.id);
    if (!habit) {
        return res.status(404).json({ error: "Habit not found" });
    }
    res.json(habit);
})

// POST /habits - create a habit
app.post('/habits', requireAuth, (req, res) => {
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
app.patch('/habits/:id/complete', requireAuth, (req, res) => {
    const result = db.prepare('UPDATE habits SET done = 1 WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
        return res.status(404).json({ error: 'Habit not found' });
    }
    const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(req.params.id);
    res.json(habit);
})

// DELETE /habits/:id - delete a habit by ID
app.delete('/habits/:id', requireAuth, (req, res) => {
    const result = db.prepare('DELETE FROM habits WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
        return res.status(404).json({ error: 'Habit not found' });
    }
    res.status(204).send()
});

app.listen(PORT, () => {
    console.log(chalk.green(`Server running on http://localhost:${PORT}`));
});
