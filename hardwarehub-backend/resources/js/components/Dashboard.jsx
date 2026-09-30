import React, { useEffect, useState } from 'react';
import { Package, CheckCircle2, XCircle, ArrowRight, Users, Trash2, RefreshCw, AlertCircle } from 'lucide-react';

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
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Overview Dashboard</h1>
                    <p className="text-sm text-slate-400 mt-1">Hardware shop inventory metrics & system management</p>
                </div>
                <button
                    onClick={fetchStats}
                    disabled={loading}
                    className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-sm font-medium transition-colors w-fit"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh Stats</span>
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-3 text-rose-400 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Metrics Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Products */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-400">Total Products</p>
                            <p className="text-3xl font-extrabold text-white mt-2">
                                {loading ? '...' : stats.total_products}
                            </p>
                        </div>
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                            <Package className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center text-xs text-slate-400">
                        <span>Items tracked in inventory database</span>
                    </div>
                </div>

                {/* Active Products */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-400">Active Products</p>
                            <p className="text-3xl font-extrabold text-emerald-400 mt-2">
                                {loading ? '...' : stats.active_products}
                            </p>
                        </div>
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center text-xs text-slate-400">
                        <span>Available for customer sales</span>
                    </div>
                </div>

                {/* Inactive Products */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-400">Inactive Products</p>
                            <p className="text-3xl font-extrabold text-slate-400 mt-2">
                                {loading ? '...' : stats.inactive_products}
                            </p>
                        </div>
                        <div className="p-3 bg-slate-800 rounded-xl text-slate-400 border border-slate-700">
                            <XCircle className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center text-xs text-slate-400">
                        <span>Disabled or out of stock status</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-white">Quick Actions</h2>
                    <p className="text-sm text-slate-400 mt-0.5">Shortcuts to manage your hardware shop modules</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* View Users Quick Action */}
                    <button
                        onClick={() => setActivePage('users')}
                        className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/50 transition-all group text-left"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="font-semibold text-white group-hover:text-amber-400 transition-colors block">
                                    System Users
                                </span>
                                <span className="text-xs text-slate-400">View user accounts & credentials</span>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors group-hover:translate-x-1" />
                    </button>

                    {/* Products Quick Action */}
                    <button
                        onClick={() => alert('Product CRUD & Management will be unlocked in PHASE 4.')}
                        className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 transition-all group text-left"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                <Package className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="font-semibold text-white group-hover:text-blue-400 transition-colors block">
                                    Products Catalogue
                                </span>
                                <span className="text-xs text-slate-400">Product CRUD ready for Phase 4</span>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors group-hover:translate-x-1" />
                    </button>
                </div>
            </div>
        </div>
    );
}
