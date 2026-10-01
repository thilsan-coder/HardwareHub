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
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10">
            {/* Grand Split-Screen Card */}
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl shadow-slate-300/60 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
                
                {/* Left Visual Brand Showcase (5 Cols) */}
                <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    {/* Ambient Glows */}
                    <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

                    {/* Brand Header */}
                    <div className="relative z-10 space-y-4">
                        <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 shadow-inner">
                            <div className="w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold shadow-sm shadow-indigo-500/30">
                                <Boxes className="w-5 h-5 stroke-[2.2]" />
                            </div>
                            <div>
                                <span className="text-base font-bold tracking-tight text-white">Hardware</span>
                                <span className="text-base font-bold text-indigo-400">Hub</span>
                            </div>
                        </div>

                        <div className="pt-4 space-y-2">
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                                Enterprise Inventory Management Platform
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                Professional suite for tracking hardware catalog stock levels, automated low-stock triggers, and POS management.
                            </p>
                        </div>
                    </div>

                    {/* Highlighted Feature Pills */}
                    <div className="relative z-10 space-y-3 my-8">
                        <div className="flex items-center space-x-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-white">Real-Time Stock Tracking</p>
                                <p className="text-[11px] text-slate-400">Live quantity deductions and inventory synchronization</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                                <Zap className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-white">Configurable Alert Limits</p>
                                <p className="text-[11px] text-slate-400">Instant low stock threshold alerts per product</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-white">Secure Access & Recycle Bin</p>
                                <p className="text-[11px] text-slate-400">Soft-delete protection and administrative user roles</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                        <span>HardwareHub &bull; v2.5</span>
                        <span className="text-emerald-400 flex items-center space-x-1 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>System Online</span>
                        </span>
                    </div>
                </div>

                {/* Right Login Form (7 Cols) */}
                <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-white">
                    <div className="max-w-md w-full mx-auto space-y-6">
                        {/* Form Title */}
                        <div className="space-y-2">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Welcome Back
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500">
                                Please enter your administrator credentials to access the store management console.
                            </p>
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-700 text-xs font-medium">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {/* Email Address */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <Mail className="w-4 h-4" />
                                    </span>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full h-12 pl-11 pr-4 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm"
                                        placeholder="admin@hardwarehub.com"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Password
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <Lock className="w-4 h-4" />
                                    </span>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full h-12 pl-11 pr-4 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Sign In Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 flex justify-center items-center px-6 rounded-xl text-white font-bold text-sm bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all active:scale-[0.99] disabled:opacity-50 shadow-md shadow-indigo-600/25 cursor-pointer"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            <span>Authenticating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Sign in to Dashboard</span>
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Security Notice */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-center space-x-2 text-xs text-slate-400">
                            <ShieldCheck className="w-4 h-4 text-indigo-500" />
                            <span>Protected by end-to-end encrypted session authentication</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
