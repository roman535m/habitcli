import Database from "better-sqlite3";
import path from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, '..', 'habits.db'));

db.exec(`
    CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        done INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT (datetime('now'))
    )
`);

export default db;