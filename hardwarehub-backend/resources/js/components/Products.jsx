import React, { useState, useEffect } from 'react';
import { 
    Package, 
    Plus, 
    Search, 
    Filter, 
    Eye, 
    Edit3, 
    Trash2, 
    CheckCircle2, 
    XCircle, 
    RefreshCw, 
    AlertCircle,
    Check,
    AlertTriangle,
    Flame
} from 'lucide-react';
import ProductFormModal from './ProductFormModal.jsx';
import ProductViewModal from './ProductViewModal.jsx';
import DeleteConfirmModal from './DeleteConfirmModal.jsx';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

    // Filter and Search States
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [onlyLowStock, setOnlyLowStock] = useState(false);

    // Modal States
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [selectedProductForEdit, setSelectedProductForEdit] = useState(null);

    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedProductForView, setSelectedProductForView] = useState(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedProductForDelete, setSelectedProductForDelete] = useState(null);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (searchTerm.trim()) params.append('search', searchTerm.trim());
        if (statusFilter) params.append('status', statusFilter);

        try {
            const response = await fetch(`/api/web/products?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to load products list');
            }
            const data = await response.json();
            setProducts(data.products || []);
        } catch (err) {
            setError(err.message || 'Error fetching products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchProducts();
        }, 250);
        return () => clearTimeout(timeout);
    }, [searchTerm, statusFilter]);

    const showToast = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 4000);
    };

    // Open Modals
    const handleOpenCreate = () => {
        setSelectedProductForEdit(null);
        setFormModalOpen(true);
    };

    const handleOpenEdit = (product) => {
        setSelectedProductForEdit(product);
        setFormModalOpen(true);
    };

    const handleOpenView = (product) => {
        setSelectedProductForView(product);
        setViewModalOpen(true);
    };

    const handleOpenDelete = (product) => {
        setSelectedProductForDelete(product);
        setDeleteModalOpen(true);
    };

    // Callback on Save
    const handleProductSaved = (savedProduct, actionType) => {
        showToast(`Product "${savedProduct.name}" was successfully ${actionType}!`);
        fetchProducts();
    };

    // Callback on Delete
    const handleProductDeleted = (deletedId) => {
        setProducts(products.filter(p => p.id !== deletedId));
        showToast('Product was moved to Recycle Bin.');
        fetchProducts();
    };

    // Filter low stock (< 20 units threshold)
    const lowStockThreshold = 20;
    const lowStockCount = products.filter(p => p.quantity <= lowStockThreshold).length;

    const displayedProducts = onlyLowStock
        ? products.filter(p => p.quantity <= lowStockThreshold)
        : products;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                            <Package className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Products Management</h1>
                            <p className="text-xs text-slate-400">Inventory catalog, pricing, quantity & real-time stock alert</p>
                        </div>
                    </div>
                </div>

                {/* Primary Add Button (Amber) */}
                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchProducts}
                        disabled={loading}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
                        title="Refresh List"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            {/* Low Stock Warning Banner (if any item is below threshold) */}
            {lowStockCount > 0 && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-rose-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/5">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <AlertTriangle className="w-5 h-5 animate-bounce" />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-amber-300">
                                Low Stock Alert: <strong className="text-white">{lowStockCount}</strong> products require restocking!
                            </span>
                            <p className="text-xs text-slate-400">
                                Stock quantity is at or below {lowStockThreshold} units.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setOnlyLowStock(!onlyLowStock)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            onlyLowStock
                                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                                : 'bg-slate-900/80 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                        }`}
                    >
                        {onlyLowStock ? 'Show All Products' : 'Filter Low Stock Items'}
                    </button>
                </div>
            )}

            {/* Notification Alert */}
            {notification && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-3 text-emerald-400 text-sm animate-in fade-in slide-in-from-top-2">
                    <Check className="w-5 h-5 shrink-0" />
                    <span className="font-medium">{notification}</span>
                </div>
            )}

            {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-3 text-rose-400 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Filter and Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900 border border-slate-800/80 p-4 rounded-2xl shadow-xl">
                {/* Search */}
                <div className="sm:col-span-2 relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Search className="w-4 h-4" />
                    </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search product by name, SKU, or keyword..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                </div>

                {/* Status Filter */}
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>
                </div>
            </div>

            {/* Products Table Card */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-3xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/70 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <th className="py-4 px-6">SKU</th>
                                <th className="py-4 px-6">Product Name</th>
                                <th className="py-4 px-6">Unit Price</th>
                                <th className="py-4 px-6">Quantity & Stock Alert</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-400">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
                                        <span>Loading hardware products...</span>
                                    </td>
                                </tr>
                            ) : displayedProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-400">
                                        <Package className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                                        <p className="font-semibold text-slate-300">No products found</p>
                                        <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or add a new product.</p>
                                    </td>
                                </tr>
                            ) : (
                                displayedProducts.map((prod) => {
                                    const isActive = prod.status === 'active';
                                    const isLowStock = prod.quantity <= lowStockThreshold;
                                    const isOutOfStock = prod.quantity <= 0;

                                    return (
                                        <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors group">
                                            {/* SKU */}
                                            <td className="py-4 px-6 font-mono text-xs font-bold text-amber-400">
                                                {prod.sku}
                                            </td>

                                            {/* Name & Description */}
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-white group-hover:text-amber-300 transition-colors">
                                                    {prod.name}
                                                </div>
                                                {prod.description && (
                                                    <div className="text-xs text-slate-400 truncate max-w-xs mt-0.5">
                                                        {prod.description}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Price */}
                                            <td className="py-4 px-6 font-mono font-bold text-slate-100">
                                                ${parseFloat(prod.price).toFixed(2)}
                                            </td>

                                            {/* Quantity & Low Stock Alert Badge */}
                                            <td className="py-4 px-6">
                                                {isOutOfStock ? (
                                                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                                        <XCircle className="w-3.5 h-3.5" />
                                                        <span>Out of Stock (0)</span>
                                                    </span>
                                                ) : isLowStock ? (
                                                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                                        <span>Low Stock ({prod.quantity} left)</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700/60 font-mono">
                                                        <span>{prod.quantity} units in stock</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                    isActive
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        : 'bg-slate-800 text-slate-400 border-slate-700'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                                                    <span className="capitalize">{prod.status}</span>
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-6 text-right">
                                                <div className="inline-flex items-center space-x-2">
                                                    {/* View Button */}
                                                    <button
                                                        onClick={() => handleOpenView(prod)}
                                                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                    {/* Edit Button (Blue) */}
                                                    <button
                                                        onClick={() => handleOpenEdit(prod)}
                                                        className="p-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/30 transition-colors"
                                                        title="Edit Product"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>

                                                    {/* Delete Button (Rose) */}
                                                    <button
                                                        onClick={() => handleOpenDelete(prod)}
                                                        className="p-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/30 transition-colors"
                                                        title="Delete Product"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer Stats */}
                <div className="p-4 bg-slate-950/60 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                    <span>Showing <strong className="text-white">{displayedProducts.length}</strong> products {onlyLowStock && '(Filtered to Low Stock only)'}</span>
                    <span>Database: <strong className="text-emerald-400">MySQL</strong></span>
                </div>
            </div>

            {/* Product Form Modal (Create & Edit) */}
            <ProductFormModal
                isOpen={formModalOpen}
                onClose={() => setFormModalOpen(false)}
                product={selectedProductForEdit}
                onSaved={handleProductSaved}
            />

            {/* Product View Modal */}
            <ProductViewModal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                product={selectedProductForView}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                product={selectedProductForDelete}
                onDeleted={handleProductDeleted}
            />
        </div>
    );
}
