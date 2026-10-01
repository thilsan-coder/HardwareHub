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
    AlertTriangle,
    Boxes,
    ArrowUpRight,
    TrendingUp,
    Shield
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
        <div className="space-y-6 w-full">
            {/* Top Workspace Banner Header */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 lg:p-9 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
                <div className="space-y-2">
                    <div className="flex items-center space-x-2.5">
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70 text-xs font-semibold">
                            <span>Overview & Diagnostics</span>
                        </span>
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-xs font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>All Systems Live</span>
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Store Inventory Command Center
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-3xl">
                        Real-time hardware stock analytics, live catalog health tracking, and automated threshold alerts.
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchStatsAndProducts}
                        disabled={loading}
                        className="p-3 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80 text-xs font-semibold transition-colors shadow-xs"
                        title="Refresh metrics"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                        onClick={() => setActivePage('products')}
                        className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
                    >
                        <Package className="w-4 h-4 stroke-[2.2]" />
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

            {/* 4-KPI Metric Cards (Grand & Spacious) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {/* Total Catalog */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs transition-all hover:border-slate-300">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Products</span>
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                            <Package className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                            {loading ? '...' : totalProducts}
                        </span>
                    </div>
                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Database Catalog</span>
                        <span className="font-semibold text-slate-800">{stats.active_products} active</span>
                    </div>
                </div>

                {/* Healthy Stock */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs transition-all hover:border-emerald-200">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Healthy Stock</span>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline space-x-2.5">
                        <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                            {loading ? '...' : healthyStockItems.length}
                        </span>
                        <span className="text-xs font-bold text-emerald-600">({healthyPercent}%)</span>
                    </div>
                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Adequate Level</span>
                        <span className="font-bold text-emerald-700">Good condition</span>
                    </div>
                </div>

                {/* Low Stock Alert */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs transition-all hover:border-amber-300">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Low Stock Alerts</span>
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline space-x-2.5">
                        <span className="text-3xl sm:text-4xl font-extrabold text-amber-700 tracking-tight">
                            {loading ? '...' : lowStockItems.length}
                        </span>
                        <span className="text-xs font-bold text-amber-600">({lowStockPercent}%)</span>
                    </div>
                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Threshold ≤ Limit</span>
                        <button 
                            onClick={() => setActivePage('products')}
                            className="font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                        >
                            View Products &rarr;
                        </button>
                    </div>
                </div>

                {/* Out of Stock */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs transition-all hover:border-rose-200">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Out of Stock</span>
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                            <XCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline space-x-2.5">
                        <span className="text-3xl sm:text-4xl font-extrabold text-rose-600 tracking-tight">
                            {loading ? '...' : outOfStockItems.length}
                        </span>
                        <span className="text-xs font-bold text-rose-600">({outOfStockPercent}%)</span>
                    </div>
                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Inventory Depleted</span>
                        <span className="font-bold text-rose-600">{outOfStockItems.length > 0 ? 'Restock Required' : 'Zero items'}</span>
                    </div>
                </div>
            </div>

            {/* Visual Stock Ratio Segment */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-800 uppercase tracking-wider">Inventory Health Distribution</span>
                    <div className="flex items-center space-x-5 text-xs font-semibold">
                        <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                            <span className="text-slate-700">Healthy ({healthyPercent}%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                            <span className="text-slate-700">Low Stock ({lowStockPercent}%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                            <span className="text-slate-700">Out of Stock ({outOfStockPercent}%)</span>
                        </div>
                    </div>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
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

            {/* Recent Product Overview & Quick Shortcuts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left 2 Cols: Live Inventory Preview */}
                <div className="xl:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Recent Products Catalog</h2>
                            <p className="text-xs text-slate-500">Latest catalog items with live stock metrics</p>
                        </div>
                        <button
                            onClick={() => setActivePage('products')}
                            className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                        >
                            <span>Open Full Catalog</span>
                            <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    <th className="py-3 px-4">SKU</th>
                                    <th className="py-3 px-4">Product Name</th>
                                    <th className="py-3 px-4">Price</th>
                                    <th className="py-3 px-4">Stock Level</th>
                                    <th className="py-3 px-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {productsList.slice(0, 5).map((prod) => {
                                    const threshold = prod.low_stock_threshold !== undefined && prod.low_stock_threshold !== null ? prod.low_stock_threshold : 10;
                                    const isLowStock = prod.quantity <= threshold;
                                    const isOutOfStock = prod.quantity <= 0;

                                    return (
                                        <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                                                {prod.sku}
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-slate-900">
                                                {prod.name}
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-slate-900">
                                                ${parseFloat(prod.price).toFixed(2)}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {isOutOfStock ? (
                                                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                                        <span>Out of Stock (0)</span>
                                                    </span>
                                                ) : isLowStock ? (
                                                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                        <span>Low: {prod.quantity} (≤{threshold})</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                        <span>{prod.quantity} units</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                                    prod.status === 'active'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                }`}>
                                                    {prod.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right 1 Col: Quick Navigation */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Quick Shortcuts</h3>
                        <p className="text-xs text-slate-500">Instant access to core system modules</p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => setActivePage('products')}
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 transition-all text-left group cursor-pointer"
                        >
                            <div className="flex items-center space-x-3.5">
                                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">Products Catalog</p>
                                    <p className="text-[11px] text-slate-500">Manage all hardware products</p>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
                        </button>

                        <button
                            onClick={() => setActivePage('recycle-bin')}
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 transition-all text-left group cursor-pointer"
                        >
                            <div className="flex items-center space-x-3.5">
                                <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                                    <Trash2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 group-hover:text-rose-600">Recycle Bin Archive</p>
                                    <p className="text-[11px] text-slate-500">Restore or purge items</p>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-transform group-hover:translate-x-1" />
                        </button>

                        <button
                            onClick={() => setActivePage('users')}
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 transition-all text-left group cursor-pointer"
                        >
                            <div className="flex items-center space-x-3.5">
                                <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">System Users</p>
                                    <p className="text-[11px] text-slate-500">Accounts & permissions</p>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
