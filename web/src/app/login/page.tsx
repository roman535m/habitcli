"use client";

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { SegmentStateProvider } from 'next/dist/next-devtools/userspace/app/segment-explorer-node';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isRegistering, setIsRegsitering] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        setError("");
        setLoading(true);
        const endpoint = isRegistering ? '/auth/register' : '/auth/login';

        try {
            const res = await fetch(`http://localhost:3001${endpoint}`, {
                method: 'POST',
                headers: { "Content-Type": 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong");
                setLoading(false);
                return;
            }

            if (isRegistering) {
                setIsRegsitering(false);
                setLoading(false);
                return;
            }

            login(data.token);
            router.push('/');
        } catch {
            setError("Could not connect to server")
            setLoading(false)
        }
    }

    return (
        <main className='max-m-md mx-auto p-8 mt-20'>
            <h1 className='text-3x1 font-bold mb-8'>
                {isRegistering ? "Create Account" : "Welcome Back"}
            </h1>

            <div className='space-y-4'>
                <input
                    type='email'
                    placeholder='Email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-blue-500'
                />
                <input
                    type='password'
                    placeholder='Password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className='w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />

                {error && <p className='text-red-500 text-sm'>{error}</p>}

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className='w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50'
                >
                    {loading ? "Loading..." : isRegistering ? "Register" : "Login"}
                </button>

                <button
                    onClick={() => setIsRegsitering(!isRegistering)}
                    className='w-full text-gray-500 text-sm hover:text-gray-700'
                >
                    {isRegistering ? "Already have an account? Login" : "No account? Register"}
                </button>
            </div>
        </main>
    )
}