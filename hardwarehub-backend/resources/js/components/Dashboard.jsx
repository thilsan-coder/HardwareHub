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
        <div className="space-y-4 sm:space-y-5 w-full">
            {/* Top Workspace Banner Header (Compact & Sleek) */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5.5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md relative overflow-hidden text-white">
                {/* Ambient Glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16"></div>

                <div className="relative z-10 space-y-1.5">
                    <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-xs text-indigo-300 border border-white/10 text-[11px] font-semibold">
                            <span>Overview & Diagnostics</span>
                        </span>
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>All Systems Live</span>
                        </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        Store Inventory Command Center
                    </h1>
                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                        Real-time hardware stock analytics, live catalog health tracking, and automated threshold alerts.
                    </p>
                </div>

                <div className="relative z-10 flex items-center space-x-2.5">
                    <button
                        onClick={fetchStatsAndProducts}
                        disabled={loading}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                        title="Refresh metrics"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 text-slate-200 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                        onClick={() => setActivePage('products')}
                        className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
                    >
                        <Package className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>Manage Products</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2.5 text-rose-700 text-xs shadow-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* 4-KPI Metric Cards (Compact & Elegant) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Total Catalog */}
                <div className="bg-white border border-slate-200/80 border-t-4 border-t-indigo-600 rounded-2xl p-4 sm:p-4.5 shadow-xs transition-all hover:shadow-md">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Products</span>
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                            <Package className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2.5">
                        <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                            {loading ? '...' : totalProducts}
                        </span>
                    </div>
                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Database Catalog</span>
                        <span className="font-semibold text-slate-800">{stats.active_products} active</span>
                    </div>
                </div>

                {/* Healthy Stock */}
                <div className="bg-white border border-slate-200/80 border-t-4 border-t-emerald-500 rounded-2xl p-4 sm:p-4.5 shadow-xs transition-all hover:shadow-md">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Healthy Stock</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2.5 flex items-baseline space-x-2">
                        <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                            {loading ? '...' : healthyStockItems.length}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600">({healthyPercent}%)</span>
                    </div>
                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Adequate Level</span>
                        <span className="font-bold text-emerald-700">Good condition</span>
                    </div>
                </div>

                {/* Low Stock Alert */}
                <div className="bg-white border border-slate-200/80 border-t-4 border-t-amber-500 rounded-2xl p-4 sm:p-4.5 shadow-xs transition-all hover:shadow-md">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Low Stock Alerts</span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2.5 flex items-baseline space-x-2">
                        <span className="text-2xl sm:text-3xl font-bold text-amber-700 tracking-tight">
                            {loading ? '...' : lowStockItems.length}
                        </span>
                        <span className="text-[11px] font-bold text-amber-600">({lowStockPercent}%)</span>
                    </div>
                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Threshold ≤ Limit</span>
                        <button 
                            onClick={() => setActivePage('products')}
                            className="font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                        >
                            View &rarr;
                        </button>
                    </div>
                </div>

                {/* Out of Stock */}
                <div className="bg-white border border-slate-200/80 border-t-4 border-t-rose-500 rounded-2xl p-4 sm:p-4.5 shadow-xs transition-all hover:shadow-md">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Out of Stock</span>
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                            <XCircle className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2.5 flex items-baseline space-x-2">
                        <span className="text-2xl sm:text-3xl font-bold text-rose-600 tracking-tight">
                            {loading ? '...' : outOfStockItems.length}
                        </span>
                        <span className="text-[11px] font-bold text-rose-600">({outOfStockPercent}%)</span>
                    </div>
                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Inventory Depleted</span>
                        <span className="font-bold text-rose-600">{outOfStockItems.length > 0 ? 'Restock' : 'Zero items'}</span>
                    </div>
                </div>
            </div>

            {/* Visual Stock Ratio Segment (Compact) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Inventory Health Distribution</span>
                    <div className="flex items-center space-x-4 text-[11px] font-semibold">
                        <div className="flex items-center space-x-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            <span className="text-slate-700">Healthy ({healthyPercent}%)</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                            <span className="text-slate-700">Low Stock ({lowStockPercent}%)</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                            <span className="text-slate-700">Out of Stock ({outOfStockPercent}%)</span>
                        </div>
                    </div>
                </div>

                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
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
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
                {/* Left 2 Cols: Live Inventory Preview */}
                <div className="xl:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">Recent Products Catalog</h2>
                            <p className="text-[11px] text-slate-500">Latest catalog items with live stock metrics</p>
                        </div>
                        <button
                            onClick={() => setActivePage('products')}
                            className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                        >
                            <span>Full Catalog</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    <th className="py-2.5 px-3.5">SKU</th>
                                    <th className="py-2.5 px-3.5">Product Name</th>
                                    <th className="py-2.5 px-3.5">Price</th>
                                    <th className="py-2.5 px-3.5">Stock Level</th>
                                    <th className="py-2.5 px-3.5">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {productsList.slice(0, 5).map((prod) => {
                                    const threshold = prod.low_stock_threshold !== undefined && prod.low_stock_threshold !== null ? prod.low_stock_threshold : 10;
                                    const isLowStock = prod.quantity <= threshold;
                                    const isOutOfStock = prod.quantity <= 0;

                                    return (
                                        <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-2.5 px-3.5 font-mono font-semibold text-slate-700">
                                                {prod.sku}
                                            </td>
                                            <td className="py-2.5 px-3.5 font-bold text-slate-900">
                                                {prod.name}
                                            </td>
                                            <td className="py-2.5 px-3.5 font-bold text-slate-900">
                                                ${parseFloat(prod.price).toFixed(2)}
                                            </td>
                                            <td className="py-2.5 px-3.5">
                                                {isOutOfStock ? (
                                                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                                        <span>Out of Stock</span>
                                                    </span>
                                                ) : isLowStock ? (
                                                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                        <span>Low ({prod.quantity})</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                        <span>{prod.quantity} units</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-3.5">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
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

                {/* Right 1 Col: Quick Navigation (Compact) */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">Quick Shortcuts</h3>
                        <p className="text-[11px] text-slate-500">Instant access to core system modules</p>
                    </div>

                    <div className="space-y-2.5">
                        <button
                            onClick={() => setActivePage('products')}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 transition-all text-left group cursor-pointer"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <Package className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">Products Catalog</p>
                                    <p className="text-[10px] text-slate-500">Manage all hardware products</p>
                                </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
                        </button>

                        <button
                            onClick={() => setActivePage('recycle-bin')}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 transition-all text-left group cursor-pointer"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                                    <Trash2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 group-hover:text-rose-600">Recycle Bin Archive</p>
                                    <p className="text-[10px] text-slate-500">Restore or purge items</p>
                                </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-transform group-hover:translate-x-1" />
                        </button>

                        <button
                            onClick={() => setActivePage('users')}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 transition-all text-left group cursor-pointer"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                                    <Users className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">System Users</p>
                                    <p className="text-[10px] text-slate-500">Accounts & permissions</p>
                                </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
