import React, { useEffect, useState } from 'react';
import { 
    Package, 
    CheckCircle2, 
    XCircle, 
    ArrowRight, 
    Users, 
    Trash2, 
    RefreshCw, 
    AlertCircle,
    Server,
    Shield,
    Database,
    Zap,
    PlusCircle
} from 'lucide-react';

export default function Dashboard({ setActivePage }) {
    const [stats, setStats] = useState({
        total_products: 0,
        active_products: 0,
        inactive_products: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/web/dashboard-stats');
            if (!response.ok) {
                throw new Error('Failed to load dashboard metrics');
            }
            const data = await response.json();
            setStats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            {/* Top Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-8 shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-wide">
                            <Zap className="w-3.5 h-3.5" />
                            <span>Hardware Shop Management System</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Welcome to Hardware<span className="text-amber-500">Hub</span>
                        </h1>
                        <p className="text-sm text-slate-400 max-w-xl">
                            Manage Products. Track Stock. Simplify Management. Monitor real-time store metrics and administer accounts.
                        </p>
                    </div>

                    <button
                        onClick={fetchStats}
                        disabled={loading}
                        className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-sm font-semibold transition-all shadow-lg active:scale-95 disabled:opacity-50 w-fit"
                    >
                        <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh Metrics</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-3 text-rose-400 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Core Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Products */}
                <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Products</p>
                            <p className="text-4xl font-black text-white mt-2 font-mono">
                                {loading ? '...' : stats.total_products}
                            </p>
                        </div>
                        <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                            <Package className="w-7 h-7" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span>Items tracked in inventory</span>
                        <span className="text-amber-400 font-semibold">Live Database</span>
                    </div>
                </div>

                {/* Active Products */}
                <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Products</p>
                            <p className="text-4xl font-black text-emerald-400 mt-2 font-mono">
                                {loading ? '...' : stats.active_products}
                            </p>
                        </div>
                        <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="w-7 h-7" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span>Available for customer sales</span>
                        <span className="text-emerald-400 font-semibold">100% Active</span>
                    </div>
                </div>

                {/* Inactive Products */}
                <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inactive Products</p>
                            <p className="text-4xl font-black text-slate-400 mt-2 font-mono">
                                {loading ? '...' : stats.inactive_products}
                            </p>
                        </div>
                        <div className="p-4 bg-slate-800 rounded-2xl text-slate-400 border border-slate-700 group-hover:scale-110 transition-transform">
                            <XCircle className="w-7 h-7" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span>Disabled or out of stock items</span>
                        <span className="text-slate-400 font-semibold">Zero Inactive</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions & System Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Quick Action Shortcuts */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Quick Action Shortcuts</h2>
                        <p className="text-xs text-slate-400 mt-1">Direct access to manage system modules</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Users Page */}
                        <button
                            onClick={() => setActivePage('users')}
                            className="flex items-center justify-between p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/40 transition-all group text-left"
                        >
                            <div className="flex items-center space-x-3.5">
                                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="font-bold text-white group-hover:text-amber-400 transition-colors block text-sm">
                                        System Users
                                    </span>
                                    <span className="text-xs text-slate-400">Manage administrator profiles</span>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-1" />
                        </button>

                        {/* Product Management (Phase 4) */}
                        <button
                            onClick={() => setActivePage('products')}
                            className="flex items-center justify-between p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/40 transition-all group text-left"
                        >
                            <div className="flex items-center space-x-3.5">
                                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-bold text-white group-hover:text-amber-400 transition-colors text-sm">
                                            Products Catalogue
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-400">Manage hardware products & stock</span>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-1" />
                        </button>

                        {/* Recycle Bin (Phase 5) */}
                        <button
                            onClick={() => setActivePage('recycle-bin')}
                            className="flex items-center justify-between p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-rose-500/40 hover:bg-slate-800/40 transition-all group text-left"
                        >
                            <div className="flex items-center space-x-3.5">
                                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:scale-110 transition-transform">
                                    <Trash2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-bold text-white group-hover:text-rose-400 transition-colors text-sm">
                                            Recycle Bin
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-400">Restore or purge soft-deleted items</span>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-rose-400 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>

                {/* Right 1 Col: System Environment Card */}
                <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
                    <div className="flex items-center space-x-2.5 text-white">
                        <Server className="w-5 h-5 text-amber-500" />
                        <h3 className="font-bold text-base">System Environment</h3>
                    </div>

                    <div className="space-y-3 pt-2 text-xs">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                            <span className="text-slate-400">Backend</span>
                            <span className="font-semibold text-slate-200">Laravel 12 / PHP 8.4</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                            <span className="text-slate-400">Database</span>
                            <span className="font-semibold text-emerald-400 flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                <span>MySQL (hardwarehub_db)</span>
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                            <span className="text-slate-400">Frontend</span>
                            <span className="font-semibold text-slate-200">React 19 + Tailwind CSS</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                            <span className="text-slate-400">Authentication</span>
                            <span className="font-semibold text-amber-400">Session & Sanctum</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
