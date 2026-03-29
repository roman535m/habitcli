"use client";

import { useEffect, useState } from "react";

type Habit = {
    id: number;
    name: string;
    done: number;
    createdAt: string;
};

export default function HabitList() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);
    const [newHabitName, setNewHabitName] = useState("");

    async function fetchHabits() {
        const rest = await fetch("http://localhost:3001/habits");
        const data = await rest.json();
        setHabits(data);
        setLoading(false);
    }

    async function addHabit() {
        if (!newHabitName.trim()) return;
        await fetch('http://localhost:3001/habits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newHabitName }),
        });
        setNewHabitName("");
        fetchHabits();
    }

    async function completeHabit(id: number) {
        await fetch(`http://localhost:3001/habits/${id}/complete`, {
            method: 'PATCH',
        });
        fetchHabits();
    }

    async function deleteHabit(id: number) {
        await fetch(`http://localhost:3001/habits/${id}`, {
            method: 'DELETE',
        });
        fetchHabits();
    }

    useEffect(() => {
        fetchHabits();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) return <p className="text-gray-500">Loading habits...</p>;
    if (habits.length === 0) return <p className="text-gray-500">No habits yet!</p>;

    return (
        <div className="space-y-6">
            {/* Add habit input */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addHabit()}
                    placeholder="Add a new habit..."
                    className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={addHabit}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                Add
                </button>
            </div>

            {/* Habit list */}
            {habits.length === 0 ? (
                <p className="text-gray-500">No habits yet!</p>
            ) : (
                <ul className="space-y-3">
                    {habits.map((habit) => (
                        <li
                            key ={habit.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                        >
                            <span className={habit.done ? "line-through text-gray-400" : ""}>
                                {habit.name}
                            </span>
                            <div className="flex gap-2">
                                {!habit.done && (
                                    <button
                                        onClick={() => completeHabit(habit.id)}
                                        className="text-green-500 hover:text-green-700 transition"
                                    >
                                    ✔ Complete
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteHabit(habit.id)}
                                    className="text-red-400 hover:text-red-600 transition"
                                >
                                ✕
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}