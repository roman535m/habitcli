#!/usr/bin/env node
import { program } from 'commander';
import chalk from 'chalk';
import db from './db.js';

// Commands

program
    .command('add <name>')
    .description('Add a new habit')
    .action((name) => {
        const stmt = db.prepare('INSERT INTO habits (name) VALUES (?)');
        const result = stmt.run(name);
        console.log(chalk.green(`✔ Added habit: "${name}" (id: ${result.lastInsertRowid})`));
    });

program
    .command('list')
    .description('List all habits')
    .action(() => {
        const habits = db.prepare('SELECT * FROM habits').all();
        if (habits.length === 0) {
            console.log(chalk.yellow('No habits yet. Add one with: add "habit name"'));
            return
        }
        console.log(chalk.bold('\nYour Habits:'));
        habits.forEach((habit) => {
            const status = habit.done ? chalk.green('✔') : chalk.red('✘');
            console.log(`  ${status} [${habit.id}] ${habit.name}`);
        });
        console.log('');
    });

program
    .command('complete <id>')
    .description('Mark a habit as complete')
    .action((id) => {
        const stmt = db.prepare('UPDATE habits SET done = 1 WHERE id = ?');
        const result = stmt.run(Number(id));
        if (result.changes === 0) {
            console.log(chalk.red(`No habit found with id ${id}`));
            return;
        }
        console.log(chalk.green(`✔ Marked habit "${id}" as complete!`));
    });

program
    .command('delete <id>')
    .description('Delete a habit')
    .action ((id) => {
        let stmt = db.prepare('DELETE FROM habits WHERE id = ?');
        const result = stmt.run(Number(id));
        if (result.changes === 0) {
            console.log(chalk.red(`No habit found with id ${id}`));
            return;
        }
        console.log(chalk.red(`Deleted habit "${id}"`));
    });

program.parse();
