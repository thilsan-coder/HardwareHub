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
    Layers
} from 'lucide-react';
import ProductFormModal from './ProductFormModal.jsx';
import ProductViewModal from './ProductViewModal.jsx';
import DeleteConfirmModal from './DeleteConfirmModal.jsx';
import Pagination from './Pagination.jsx';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

    // Filter and Search States
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [onlyLowStock, setOnlyLowStock] = useState(false);

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

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
            setCurrentPage(1);
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

    // Filter low stock using per-product threshold (fallback 10)
    const lowStockCount = products.filter(p => p.quantity <= (p.low_stock_threshold !== undefined && p.low_stock_threshold !== null ? p.low_stock_threshold : 10)).length;

    const displayedProducts = onlyLowStock
        ? products.filter(p => p.quantity <= (p.low_stock_threshold !== undefined && p.low_stock_threshold !== null ? p.low_stock_threshold : 10))
        : products;

    // Slice for pagination
    const paginatedProducts = displayedProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
                <div>
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shadow-xs">
                            <Package className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products Management</h1>
                            <p className="text-xs text-slate-500">Inventory catalog, custom stock alert limits & real-time monitoring</p>
                        </div>
                    </div>
                </div>

                {/* Primary Add Button (Amber) */}
                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchProducts}
                        disabled={loading}
                        className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs font-semibold transition-colors shadow-xs"
                        title="Refresh List"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-sm transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            {/* Low Stock Warning Banner (if any item is below threshold) */}
            {lowStockCount > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-5 h-5 animate-bounce text-amber-600" />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-amber-900">
                                Low Stock Alert: <strong className="text-amber-950 font-black">{lowStockCount}</strong> products require restocking!
                            </span>
                            <p className="text-xs text-amber-700">
                                Inventory has fallen to or below the customized low-stock threshold for these items.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setOnlyLowStock(!onlyLowStock);
                            setCurrentPage(1);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs ${
                            onlyLowStock
                                ? 'bg-amber-500 text-slate-950 border-amber-500'
                                : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-100'
                        }`}
                    >
                        {onlyLowStock ? 'Show All Products' : 'Filter Low Stock Items'}
                    </button>
                </div>
            )}

            {/* Notification Alert */}
            {notification && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3 text-emerald-800 text-sm shadow-xs">
                    <Check className="w-5 h-5 shrink-0 text-emerald-600" />
                    <span className="font-semibold">{notification}</span>
                </div>
            )}

            {error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center space-x-3 text-rose-700 text-sm shadow-xs">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Filter and Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                {/* Search */}
                <div className="sm:col-span-2 relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Search className="w-4 h-4" />
                    </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search product by name, SKU, or keyword..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    />
                </div>

                {/* Status Filter */}
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>
                </div>
            </div>

            {/* Products Table Card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                <th className="py-3.5 px-6">SKU</th>
                                <th className="py-3.5 px-6">Product Details</th>
                                <th className="py-3.5 px-6">Unit Price</th>
                                <th className="py-3.5 px-6">Quantity & Stock Alert</th>
                                <th className="py-3.5 px-6">Status</th>
                                <th className="py-3.5 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-500">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-600 mb-2" />
                                        <span>Loading hardware products...</span>
                                    </td>
                                </tr>
                            ) : displayedProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-500">
                                        <Package className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                                        <p className="font-semibold text-slate-700">No products found</p>
                                        <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or add a new product.</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedProducts.map((prod) => {
                                    const isActive = prod.status === 'active';
                                    const threshold = prod.low_stock_threshold !== undefined && prod.low_stock_threshold !== null ? prod.low_stock_threshold : 10;
                                    const isLowStock = prod.quantity <= threshold;
                                    const isOutOfStock = prod.quantity <= 0;

                                    return (
                                        <tr key={prod.id} className="hover:bg-amber-50/30 transition-colors group">
                                            {/* SKU */}
                                            <td className="py-4 px-6 font-mono text-xs font-bold text-slate-900">
                                                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                                                    {prod.sku}
                                                </span>
                                            </td>

                                            {/* Name & Description */}
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                                                    {prod.name}
                                                </div>
                                                {prod.description && (
                                                    <div className="text-xs text-slate-500 truncate max-w-xs mt-0.5">
                                                        {prod.description}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Price */}
                                            <td className="py-4 px-6 font-mono font-bold text-slate-900">
                                                ${parseFloat(prod.price).toFixed(2)}
                                            </td>

                                            {/* Quantity & Low Stock Alert Badge */}
                                            <td className="py-4 px-6">
                                                {isOutOfStock ? (
                                                    <div className="space-y-1">
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                            <XCircle className="w-3.5 h-3.5" />
                                                            <span>Out of Stock (0)</span>
                                                        </span>
                                                        <div className="text-[11px] text-slate-500 font-mono">Alert Limit: ≤{threshold}</div>
                                                    </div>
                                                ) : isLowStock ? (
                                                    <div className="space-y-1">
                                                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
                                                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                                                            <span>Low Stock ({prod.quantity} left)</span>
                                                        </span>
                                                        <div className="text-[11px] text-amber-800 font-mono font-semibold">Alert Limit: ≤{threshold} units</div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                                                            <span>{prod.quantity} units</span>
                                                        </span>
                                                        <div className="text-[11px] text-slate-400 font-mono">Alert Limit: ≤{threshold}</div>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                    isActive
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                    <span className="capitalize">{prod.status}</span>
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-6 text-right">
                                                <div className="inline-flex items-center space-x-1.5">
                                                    {/* View Button */}
                                                    <button
                                                        onClick={() => handleOpenView(prod)}
                                                        className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors shadow-xs"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                    {/* Edit Button (Blue) */}
                                                    <button
                                                        onClick={() => handleOpenEdit(prod)}
                                                        className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors shadow-xs"
                                                        title="Edit Product"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>

                                                    {/* Delete Button (Rose) */}
                                                    <button
                                                        onClick={() => handleOpenDelete(prod)}
                                                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors shadow-xs"
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

                {/* Pagination Component */}
                <Pagination
                    currentPage={currentPage}
                    totalItems={displayedProducts.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    }}
                />
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
