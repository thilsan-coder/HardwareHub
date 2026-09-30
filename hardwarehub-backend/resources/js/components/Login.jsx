import React, { useState } from 'react';
import { Wrench, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('admin@hardwarehub.com');
    const [password, setPassword] = useState('password');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Get CSRF cookie first for web auth
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch('/api/web/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    const firstError = Object.values(data.errors)[0]?.[0];
                    throw new Error(firstError || 'Login failed');
                }
                throw new Error(data.message || 'Invalid email or password');
            }

            if (data.user) {
                onLoginSuccess(data.user);
            }
        } catch (err) {
            setError(err.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 mb-4 shadow-lg shadow-amber-500/20">
                    <Wrench className="w-9 h-9 stroke-[2.5]" />
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                    Hardware<span className="text-amber-500">Hub</span>
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                    Manage Products. Track Stock. Simplify Management.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
                <div className="bg-slate-900 py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-400 text-sm">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors text-sm"
                                    placeholder="admin@hardwarehub.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-slate-950 font-bold bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:ring-offset-slate-900 transition-all transform active:scale-[0.99] disabled:opacity-50 shadow-lg shadow-amber-500/25"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign in to Dashboard</span>
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
                        <p className="text-xs text-slate-400">
                            Demo Admin Credentials: <span className="text-amber-400 font-mono">admin@hardwarehub.com</span> / <span className="text-amber-400 font-mono">password</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
