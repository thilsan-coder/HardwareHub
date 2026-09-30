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
    PlusCircle,
    AlertTriangle,
    TrendingUp,
    BarChart3,
    Boxes,
    ArrowUpRight
} from 'lucide-react';

export default function Dashboard({ setActivePage }) {
    const [stats, setStats] = useState({
        total_products: 0,
        active_products: 0,
        inactive_products: 0,
    });
    const [productsList, setProductsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStatsAndProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const [statsRes, productsRes] = await Promise.all([
                fetch('/api/web/dashboard-stats'),
                fetch('/api/web/products')
            ]);

            if (!statsRes.ok || !productsRes.ok) {
                throw new Error('Failed to load dashboard metrics');
            }

            const statsData = await statsRes.json();
            const productsData = await productsRes.json();

            setStats(statsData);
            setProductsList(productsData.products || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatsAndProducts();
    }, []);

    // Inventory Calculations
    const totalProducts = productsList.length;
    const outOfStockItems = productsList.filter(p => p.quantity <= 0);
    const lowStockItems = productsList.filter(p => {
        const threshold = p.low_stock_threshold !== undefined && p.low_stock_threshold !== null ? p.low_stock_threshold : 10;
        return p.quantity > 0 && p.quantity <= threshold;
    });
    const healthyStockItems = productsList.filter(p => {
        const threshold = p.low_stock_threshold !== undefined && p.low_stock_threshold !== null ? p.low_stock_threshold : 10;
        return p.quantity > threshold;
    });

    const healthyPercent = totalProducts > 0 ? Math.round((healthyStockItems.length / totalProducts) * 100) : 0;
    const lowStockPercent = totalProducts > 0 ? Math.round((lowStockItems.length / totalProducts) * 100) : 0;
    const outOfStockPercent = totalProducts > 0 ? Math.round((outOfStockItems.length / totalProducts) * 100) : 0;

    return (
        <div className="space-y-8">
            {/* Top Actionable Store Header */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                            <Zap className="w-3.5 h-3.5 text-amber-600" />
                            <span>Executive Inventory Hub</span>
                        </span>
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>All Systems Live</span>
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Store Inventory Command Center
                    </h1>
                    <p className="text-sm text-slate-500 max-w-2xl">
                        Monitor stock thresholds, real-time product quantities, and execute management tasks.
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchStatsAndProducts}
                        disabled={loading}
                        className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs font-semibold transition-colors shadow-xs"
                        title="Refresh metrics"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                        onClick={() => setActivePage('products')}
                        className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold shadow-sm transition-all active:scale-95"
                    >
                        <Boxes className="w-4 h-4 stroke-[2.5]" />
                        <span>Manage Products</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center space-x-3 text-rose-700 text-sm shadow-xs">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* 4-KPI Metric Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Total Catalog */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Products</span>
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                            <Package className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-3xl font-black text-slate-900 font-mono">
                            {loading ? '...' : totalProducts}
                        </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Database Catalog</span>
                        <span className="font-semibold text-slate-700">{stats.active_products} active</span>
                    </div>
                </div>

                {/* Healthy Stock */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-emerald-200 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Healthy Stock</span>
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-3xl font-black text-emerald-700 font-mono">
                            {loading ? '...' : healthyStockItems.length}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 ml-2">({healthyPercent}%)</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Above alert limit</span>
                        <span className="font-semibold text-emerald-700">Good condition</span>
                    </div>
                </div>

                {/* Low Stock Warning */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-amber-300 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Low Stock Warnings</span>
                        <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-5 h-5 text-amber-600 animate-bounce" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-3xl font-black text-amber-800 font-mono">
                            {loading ? '...' : lowStockItems.length}
                        </span>
                        <span className="text-xs font-bold text-amber-700 ml-2">({lowStockPercent}%)</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-800">
                        <span>At/Below Alert Limit</span>
                        <button 
                            onClick={() => setActivePage('products')}
                            className="font-bold underline hover:text-amber-950 transition-colors"
                        >
                            Review &rarr;
                        </button>
                    </div>
                </div>

                {/* Out of Stock */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-rose-200 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Out of Stock</span>
                        <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-3xl font-black text-rose-700 font-mono">
                            {loading ? '...' : outOfStockItems.length}
                        </span>
                        <span className="text-xs font-bold text-rose-600 ml-2">({outOfStockPercent}%)</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>0 units remaining</span>
                        <span className="font-semibold text-rose-700">Needs Order</span>
                    </div>
                </div>
            </div>

            {/* Inventory Health Meter Bar Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5 text-amber-600" />
                        <h3 className="font-extrabold text-slate-900 text-base">Inventory Health Distribution</h3>
                    </div>
                    <div className="flex items-center space-x-4 text-xs font-bold">
                        <span className="flex items-center space-x-1.5 text-emerald-700">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            <span>Healthy: {healthyStockItems.length} ({healthyPercent}%)</span>
                        </span>
                        <span className="flex items-center space-x-1.5 text-amber-800">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            <span>Low Stock: {lowStockItems.length} ({lowStockPercent}%)</span>
                        </span>
                        <span className="flex items-center space-x-1.5 text-rose-700">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                            <span>Out of Stock: {outOfStockItems.length} ({outOfStockPercent}%)</span>
                        </span>
                    </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                    <div 
                        style={{ width: `${healthyPercent}%` }} 
                        className="h-full bg-emerald-500 transition-all duration-500" 
                        title={`Healthy: ${healthyPercent}%`}
                    />
                    <div 
                        style={{ width: `${lowStockPercent}%` }} 
                        className="h-full bg-amber-400 transition-all duration-500" 
                        title={`Low Stock: ${lowStockPercent}%`}
                    />
                    <div 
                        style={{ width: `${outOfStockPercent}%` }} 
                        className="h-full bg-rose-500 transition-all duration-500" 
                        title={`Out of Stock: ${outOfStockPercent}%`}
                    />
                </div>
            </div>

            {/* Quick Action Hub & System Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Live Inventory Preview */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Product Overview</h2>
                            <p className="text-xs text-slate-500">Latest catalog items with live stock metrics</p>
                        </div>
                        <button
                            onClick={() => setActivePage('products')}
                            className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 transition-colors"
                        >
                            <span>Open Full Catalog</span>
                            <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                    <th className="py-2.5 px-4">SKU</th>
                                    <th className="py-2.5 px-4">Product Name</th>
                                    <th className="py-2.5 px-4">Price</th>
                                    <th className="py-2.5 px-4">Stock In Hand</th>
                                    <th className="py-2.5 px-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {productsList.slice(0, 5).map((prod) => {
                                    const threshold = prod.low_stock_threshold !== undefined && prod.low_stock_threshold !== null ? prod.low_stock_threshold : 10;
                                    const isLowStock = prod.quantity <= threshold;
                                    const isOutOfStock = prod.quantity <= 0;

                                    return (
                                        <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                                                    {prod.sku}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-bold text-slate-900">
                                                {prod.name}
                                            </td>
                                            <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                                ${parseFloat(prod.price).toFixed(2)}
                                            </td>
                                            <td className="py-3 px-4">
                                                {isOutOfStock ? (
                                                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                        Out of Stock (0)
                                                    </span>
                                                ) : isLowStock ? (
                                                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                                                        ⚠️ Low: {prod.quantity} (Limit: ≤{threshold})
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                        {prod.quantity} units
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                                                    prod.status === 'active'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                                }`}>
                                                    <span>{prod.status}</span>
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right 1 Col: Quick Navigation & Diagnostics */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center space-x-2 text-slate-900">
                        <Server className="w-5 h-5 text-amber-600" />
                        <h3 className="font-extrabold text-base">Quick Shortcuts</h3>
                    </div>

                    <div className="space-y-2.5">
                        <button
                            onClick={() => setActivePage('products')}
                            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 transition-all text-left group"
                        >
                            <div className="flex items-center space-x-3">
                                <Package className="w-4 h-4 text-amber-600" />
                                <div>
                                    <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800">Products Catalog</p>
                                    <p className="text-[10px] text-slate-500">Manage all hardware products</p>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-1" />
                        </button>

                        <button
                            onClick={() => setActivePage('recycle-bin')}
                            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-rose-50/60 border border-slate-200 hover:border-rose-300 transition-all text-left group"
                        >
                            <div className="flex items-center space-x-3">
                                <Trash2 className="w-4 h-4 text-rose-600" />
                                <div>
                                    <p className="text-xs font-bold text-slate-900 group-hover:text-rose-800">Recycle Bin Archive</p>
                                    <p className="text-[10px] text-slate-500">Restore or purge items</p>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-transform group-hover:translate-x-1" />
                        </button>

                        <button
                            onClick={() => setActivePage('users')}
                            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 transition-all text-left group"
                        >
                            <div className="flex items-center space-x-3">
                                <Users className="w-4 h-4 text-amber-600" />
                                <div>
                                    <p className="text-xs font-bold text-slate-900 group-hover:text-amber-800">System Users</p>
                                    <p className="text-[10px] text-slate-500">Accounts & permissions</p>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Database:</span>
                                <span className="font-bold text-slate-800">MySQL (hardwarehub_db)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Framework:</span>
                                <span className="font-bold text-slate-800">Laravel 12 + React 19</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
