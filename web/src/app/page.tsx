import HabitList from "./components/HabitList";

export default function Home() {
  return (
    <main className="max-w-2x1 mx-auto p-8">
      <h1 className="text-3x1 font-bold mb-6">My Habits</h1>
      <HabitList />
    </main>
  );
}