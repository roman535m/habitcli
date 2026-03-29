import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from './db.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const SALT_ROUNDS = 10;

export async function register(email, password) {
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existing) {
        throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = db
        .prepare('INSERT INTO users (email, password) VALUES (?, ?)')
        .run(email, hashedPassword);

    return { id: result.lastInsertRowid, email };
}

export async function login(email, password) {
    // Check if username is valid
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
        throw new Error('Invalid email');
    }

    // Check if password is valid
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        throw new Error('Invalid password')
    }

    // Create JWT token
    const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    return { token };
}

export function verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET)
}