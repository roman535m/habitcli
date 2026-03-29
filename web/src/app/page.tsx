"use client";

import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import HabitList from "./components/HabitList";

export default function Home() {
  const { token, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token, router]);

  if (!token) return null;

  return (
    <main className="max-w-2x1 mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3x1 font-bold mb-6">My Habits</h1>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Logout
        </button>
      </div>
      <HabitList />
    </main>
  );
}