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
            <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold tracking-wide">
                            <Zap className="w-3.5 h-3.5 text-amber-600" />
                            <span>Hardware Shop Management System</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Welcome to Hardware<span className="text-amber-600">Hub</span>
                        </h1>
                        <p className="text-sm text-slate-600 max-w-xl">
                            Manage Products. Track Stock. Simplify Management. Monitor real-time store metrics and administer accounts.
                        </p>
                    </div>

                    <button
                        onClick={fetchStats}
                        disabled={loading}
                        className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 text-sm font-semibold transition-all shadow-xs active:scale-95 disabled:opacity-50 w-fit"
                    >
                        <RefreshCw className={`w-4 h-4 text-amber-600 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh Metrics</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center space-x-3 text-rose-700 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Core Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Products */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Products</p>
                            <p className="text-4xl font-black text-slate-900 mt-2 font-mono">
                                {loading ? '...' : stats.total_products}
                            </p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 border border-amber-200 group-hover:scale-105 transition-transform">
                            <Package className="w-7 h-7" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Items tracked in inventory</span>
                        <span className="text-amber-600 font-semibold">Live Database</span>
                    </div>
                </div>

                {/* Active Products */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Products</p>
                            <p className="text-4xl font-black text-emerald-600 mt-2 font-mono">
                                {loading ? '...' : stats.active_products}
                            </p>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 border border-emerald-200 group-hover:scale-105 transition-transform">
                            <CheckCircle2 className="w-7 h-7" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Available for customer sales</span>
                        <span className="text-emerald-600 font-semibold">100% Active</span>
                    </div>
                </div>

                {/* Inactive Products */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inactive Products</p>
                            <p className="text-4xl font-black text-slate-700 mt-2 font-mono">
                                {loading ? '...' : stats.inactive_products}
                            </p>
                        </div>
                        <div className="p-4 bg-slate-100 rounded-2xl text-slate-600 border border-slate-200 group-hover:scale-105 transition-transform">
                            <XCircle className="w-7 h-7" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Disabled or out of stock items</span>
                        <span className="text-slate-600 font-semibold">Zero Inactive</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions & System Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Quick Action Shortcuts */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Quick Action Shortcuts</h2>
                        <p className="text-xs text-slate-500 mt-1">Direct access to manage system modules</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Users Page */}
                        <button
                            onClick={() => setActivePage('users')}
                            className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 transition-all group text-left"
                        >
                            <div className="flex items-center space-x-3.5">
                                <div className="p-3 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 group-hover:scale-105 transition-transform">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors block text-sm">
                                        System Users
                                    </span>
                                    <span className="text-xs text-slate-500">Manage administrator profiles</span>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-1" />
                        </button>

                        {/* Product Management */}
                        <button
                            onClick={() => setActivePage('products')}
                            className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 transition-all group text-left"
                        >
                            <div className="flex items-center space-x-3.5">
                                <div className="p-3 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 group-hover:scale-105 transition-transform">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors block text-sm">
                                        Products Catalogue
                                    </span>
                                    <span className="text-xs text-slate-500">Manage hardware products & stock</span>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-1" />
                        </button>

                        {/* Recycle Bin */}
                        <button
                            onClick={() => setActivePage('recycle-bin')}
                            className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-rose-300 hover:bg-rose-50/40 transition-all group text-left"
                        >
                            <div className="flex items-center space-x-3.5">
                                <div className="p-3 rounded-xl bg-rose-100 text-rose-800 border border-rose-200 group-hover:scale-105 transition-transform">
                                    <Trash2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="font-bold text-slate-900 group-hover:text-rose-700 transition-colors block text-sm">
                                        Recycle Bin
                                    </span>
                                    <span className="text-xs text-slate-500">Restore or purge soft-deleted items</span>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-rose-600 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>

                {/* Right 1 Col: System Environment Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                    <div className="flex items-center space-x-2.5 text-slate-900">
                        <Server className="w-5 h-5 text-amber-600" />
                        <h3 className="font-bold text-base">System Environment</h3>
                    </div>

                    <div className="space-y-3 pt-2 text-xs">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-slate-500">Backend</span>
                            <span className="font-semibold text-slate-800">Laravel 12 / PHP 8.4</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-slate-500">Database</span>
                            <span className="font-semibold text-emerald-700 flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>MySQL (hardwarehub_db)</span>
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-slate-500">Frontend</span>
                            <span className="font-semibold text-slate-800">React 19 + Tailwind CSS</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-slate-500">Authentication</span>
                            <span className="font-semibold text-amber-700">Session & Sanctum</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
