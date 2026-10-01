import React, { useState } from 'react';
import { 
    Boxes, 
    Lock, 
    Mail, 
    ArrowRight, 
    AlertCircle, 
    Loader2, 
    ShieldCheck, 
    CheckCircle2, 
    Zap, 
    TrendingUp, 
    Package 
} from 'lucide-react';

export default function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
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
        <div className="min-h-screen bg-slate-100/90 flex items-center justify-center p-4 sm:p-6">
            {/* Compact Split-Screen Card */}
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl shadow-slate-300/50 border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12">
                
                {/* Left Visual Brand Showcase (5 Cols) */}
                <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden">
                    {/* Ambient Glows */}
                    <div className="absolute top-0 right-0 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16"></div>

                    {/* Brand Header */}
                    <div className="relative z-10 space-y-3">
                        <div className="inline-flex items-center space-x-2.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                            <div className="w-7 h-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold shadow-xs shadow-indigo-500/30">
                                <Boxes className="w-4 h-4 stroke-[2.2]" />
                            </div>
                            <div>
                                <span className="text-sm font-bold tracking-tight text-white">Hardware</span>
                                <span className="text-sm font-bold text-indigo-400">Hub</span>
                            </div>
                        </div>

                        <div className="pt-2 space-y-1.5">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                                Hardware Inventory System
                            </h1>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Manage hardware catalog items, real-time stock levels, and automated low-stock alert triggers.
                            </p>
                        </div>
                    </div>

                    {/* Highlighted Feature Items */}
                    <div className="relative z-10 space-y-2.5 my-6">
                        <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-white">Stock & Catalog Tracking</p>
                                <p className="text-[11px] text-slate-400">Live quantities and product metrics</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                                <Zap className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-white">Low-Stock Alert Limits</p>
                                <p className="text-[11px] text-slate-400">Configurable threshold warnings</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-white">Roles & Recycle Bin</p>
                                <p className="text-[11px] text-slate-400">Safe recovery & user access control</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Status */}
                    <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                        <span>HardwareHub &bull; Pro Edition</span>
                        <span className="text-emerald-400 flex items-center space-x-1 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>System Online</span>
                        </span>
                    </div>
                </div>

                {/* Right Login Form (7 Cols) */}
                <div className="md:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-white">
                    <div className="max-w-sm w-full mx-auto space-y-5">
                        {/* Form Title */}
                        <div className="space-y-1">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                Sign In
                            </h2>
                            <p className="text-xs text-slate-500">
                                Enter your credentials to access the management dashboard.
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-rose-700 text-xs font-medium">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {/* Email Address */}
                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-700">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Mail className="w-4 h-4" />
                                    </span>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full h-10.5 pl-10 pr-3.5 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-xs"
                                        placeholder="admin@hardwarehub.com"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-700">
                                    Password
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Lock className="w-4 h-4" />
                                    </span>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full h-10.5 pl-10 pr-3.5 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-xs"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Sign In Button */}
                            <div className="pt-1">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-10.5 flex justify-center items-center px-4 rounded-xl text-white font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all active:scale-[0.99] disabled:opacity-50 shadow-sm shadow-indigo-600/25 cursor-pointer"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                                            <span>Authenticating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Sign In to System</span>
                                            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Security Notice */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Protected by encrypted session authentication</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
