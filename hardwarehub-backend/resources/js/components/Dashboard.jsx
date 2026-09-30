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
        <div className="space-y-6">
            {/* Top Workspace Header */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
                <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-xs font-semibold">
                            <span>Overview</span>
                        </span>
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Live Database</span>
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Store Management Dashboard
                    </h1>
                    <p className="text-xs text-slate-500">
                        Real-time stock analytics, inventory thresholds, and catalog health.
                    </p>
                </div>

                <div className="flex items-center space-x-2.5">
                    <button
                        onClick={fetchStatsAndProducts}
                        disabled={loading}
                        className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80 text-xs font-medium transition-colors shadow-xs"
                        title="Refresh metrics"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                        onClick={() => setActivePage('products')}
                        className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all active:scale-95"
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

            {/* 4-KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Catalog */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs transition-all hover:border-slate-300">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-semibold uppercase tracking-wider">Total Products</span>
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Package className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-2xl font-bold text-slate-900">
                            {loading ? '...' : totalProducts}
                        </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Active Catalog</span>
                        <span className="font-semibold text-slate-800">{stats.active_products} active</span>
                    </div>
                </div>

                {/* Healthy Stock */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs transition-all hover:border-emerald-200">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-semibold uppercase tracking-wider">Healthy Stock</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline space-x-2">
                        <span className="text-2xl font-bold text-slate-900">
                            {loading ? '...' : healthyStockItems.length}
                        </span>
                        <span className="text-xs font-medium text-emerald-600">({healthyPercent}%)</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Adequate Level</span>
                        <span className="font-semibold text-emerald-700">Good</span>
                    </div>
                </div>

                {/* Low Stock Alert */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs transition-all hover:border-amber-300">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-semibold uppercase tracking-wider">Low Stock Alerts</span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline space-x-2">
                        <span className="text-2xl font-bold text-amber-700">
                            {loading ? '...' : lowStockItems.length}
                        </span>
                        <span className="text-xs font-medium text-amber-600">({lowStockPercent}%)</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Threshold ≤ Limit</span>
                        <button 
                            onClick={() => setActivePage('products')}
                            className="font-medium text-indigo-600 hover:text-indigo-700"
                        >
                            View &rarr;
                        </button>
                    </div>
                </div>

                {/* Out of Stock */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs transition-all hover:border-rose-200">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-semibold uppercase tracking-wider">Out of Stock</span>
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                            <XCircle className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline space-x-2">
                        <span className="text-2xl font-bold text-rose-600">
                            {loading ? '...' : outOfStockItems.length}
                        </span>
                        <span className="text-xs font-medium text-rose-600">({outOfStockPercent}%)</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Depleted</span>
                        <span className="font-semibold text-rose-600">{outOfStockItems.length > 0 ? 'Restock' : 'Zero'}</span>
                    </div>
                </div>
            </div>

            {/* Visual Stock Ratio Segment */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">Inventory Distribution Ratio</span>
                    <div className="flex items-center space-x-4 text-xs font-medium">
                        <div className="flex items-center space-x-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            <span className="text-slate-600">Healthy ({healthyPercent}%)</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                            <span className="text-slate-600">Low Stock ({lowStockPercent}%)</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                            <span className="text-slate-600">Out of Stock ({outOfStockPercent}%)</span>
                        </div>
                    </div>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Live Inventory Preview */}
                <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900">Recent Products</h2>
                            <p className="text-xs text-slate-500">Latest catalog items with live stock metrics</p>
                        </div>
                        <button
                            onClick={() => setActivePage('products')}
                            className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                            <span>Open Catalog</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                    <th className="py-2.5 px-3">SKU</th>
                                    <th className="py-2.5 px-3">Product Name</th>
                                    <th className="py-2.5 px-3">Price</th>
                                    <th className="py-2.5 px-3">Stock Level</th>
                                    <th className="py-2.5 px-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {productsList.slice(0, 5).map((prod) => {
                                    const threshold = prod.low_stock_threshold !== undefined && prod.low_stock_threshold !== null ? prod.low_stock_threshold : 10;
                                    const isLowStock = prod.quantity <= threshold;
                                    const isOutOfStock = prod.quantity <= 0;

                                    return (
                                        <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-3 px-3 font-mono text-slate-600">
                                                {prod.sku}
                                            </td>
                                            <td className="py-3 px-3 font-medium text-slate-900">
                                                {prod.name}
                                            </td>
                                            <td className="py-3 px-3 font-medium text-slate-900">
                                                ${parseFloat(prod.price).toFixed(2)}
                                            </td>
                                            <td className="py-3 px-3">
                                                {isOutOfStock ? (
                                                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                                        <span>Out of Stock (0)</span>
                                                    </span>
                                                ) : isLowStock ? (
                                                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                        <span>Low: {prod.quantity} (≤{threshold})</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                        <span>{prod.quantity} units</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                                    prod.status === 'active'
                                                        ? 'bg-slate-100 text-slate-700'
                                                        : 'bg-slate-50 text-slate-400'
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
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Quick Shortcuts</h3>
                        <p className="text-xs text-slate-500">Jump directly to key modules</p>
                    </div>

                    <div className="space-y-2">
                        <button
                            onClick={() => setActivePage('products')}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 transition-all text-left group"
                        >
                            <div className="flex items-center space-x-3">
                                <Package className="w-4 h-4 text-indigo-600" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600">Products Catalog</p>
                                    <p className="text-[10px] text-slate-500">Manage all hardware products</p>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                        </button>

                        <button
                            onClick={() => setActivePage('recycle-bin')}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 transition-all text-left group"
                        >
                            <div className="flex items-center space-x-3">
                                <Trash2 className="w-4 h-4 text-rose-500" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-900 group-hover:text-rose-600">Recycle Bin Archive</p>
                                    <p className="text-[10px] text-slate-500">Restore or purge items</p>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-transform group-hover:translate-x-0.5" />
                        </button>

                        <button
                            onClick={() => setActivePage('users')}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 transition-all text-left group"
                        >
                            <div className="flex items-center space-x-3">
                                <Users className="w-4 h-4 text-slate-700" />
                                <div>
                                    <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600">System Users</p>
                                    <p className="text-[10px] text-slate-500">Accounts & permissions</p>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
