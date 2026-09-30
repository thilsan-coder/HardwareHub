import React, { useState, useEffect, useMemo } from 'react';
import { 
    Package, 
    Plus, 
    Search, 
    Eye, 
    Edit3, 
    Trash2, 
    RefreshCw, 
    AlertCircle,
    Check,
    AlertTriangle,
    ArrowUpDown,
    Copy,
    CheckCheck,
    XCircle
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

    // Filter, Search, and Sort States
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest'); // 'newest', 'stock_asc', 'stock_desc', 'price_asc', 'price_desc', 'name_asc'
    const [copiedSku, setCopiedSku] = useState(null);

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

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

        try {
            const response = await fetch('/api/web/products');
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
        fetchProducts();
    }, []);

    const showToast = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 4000);
    };

    const copyToClipboard = (sku) => {
        navigator.clipboard.writeText(sku);
        setCopiedSku(sku);
        setTimeout(() => setCopiedSku(null), 2000);
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

    // Filter & Sort Pipeline
    const filteredProducts = useMemo(() => {
        let list = [...products];

        // Search Filter
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            list = list.filter(p => 
                (p.name && p.name.toLowerCase().includes(q)) ||
                (p.sku && p.sku.toLowerCase().includes(q)) ||
                (p.description && p.description.toLowerCase().includes(q))
            );
        }

        // Sorting
        list.sort((a, b) => {
            if (sortBy === 'newest') return b.id - a.id;
            if (sortBy === 'stock_asc') return a.quantity - b.quantity;
            if (sortBy === 'stock_desc') return b.quantity - a.quantity;
            if (sortBy === 'price_asc') return parseFloat(a.price) - parseFloat(b.price);
            if (sortBy === 'price_desc') return parseFloat(b.price) - parseFloat(a.price);
            if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
            return 0;
        });

        return list;
    }, [products, searchTerm, sortBy]);

    // Paginated items
    const paginatedProducts = useMemo(() => {
        return filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    }, [filteredProducts, currentPage, pageSize]);

    return (
        <div className="space-y-6">
            {/* Header Title & Primary Action */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200/80">
                <div className="space-y-0.5">
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Products Catalog</h1>
                    <p className="text-xs text-slate-500">Manage hardware inventory items, stock levels & low stock alerts</p>
                </div>

                <div className="flex items-center space-x-2.5">
                    <button
                        onClick={fetchProducts}
                        disabled={loading}
                        className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80 text-xs font-medium transition-colors shadow-xs"
                        title="Refresh Catalog"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-600/20 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4 stroke-[2.2]" />
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            {/* Notification Alert */}
            {notification && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3 text-emerald-800 text-xs font-semibold shadow-xs animate-in fade-in slide-in-from-top-2">
                    <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{notification}</span>
                </div>
            )}

            {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-3 text-rose-700 text-xs shadow-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Search & Sort Controls Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white border border-slate-200/80 p-3 rounded-2xl shadow-xs">
                {/* Search Bar */}
                <div className="sm:col-span-3 relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Search className="w-4 h-4" />
                    </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        placeholder="Search by title, SKU code, or description keyword..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                </div>

                {/* Sorting Select */}
                <div className="relative flex items-center">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <ArrowUpDown className="w-3.5 h-3.5" />
                    </span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-700 text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    >
                        <option value="newest">Sort: Newest First</option>
                        <option value="stock_asc">Sort: Stock (Lowest First)</option>
                        <option value="stock_desc">Sort: Stock (Highest First)</option>
                        <option value="price_asc">Sort: Price (Low to High)</option>
                        <option value="price_desc">Sort: Price (High to Low)</option>
                        <option value="name_asc">Sort: Product Name (A-Z)</option>
                    </select>
                </div>
            </div>

            {/* Main Products Data Grid Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/60 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider select-none">
                                <th className="py-3 px-5">SKU Code</th>
                                <th className="py-3 px-5">Product Details</th>
                                <th className="py-3 px-5">Price</th>
                                <th className="py-3 px-5">Stock In Hand</th>
                                <th className="py-3 px-5">Alert Limit</th>
                                <th className="py-3 px-5">Status</th>
                                <th className="py-3 px-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-slate-500">
                                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-600 mb-2" />
                                        <span className="font-medium text-xs">Loading products catalog...</span>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-slate-500">
                                        <Package className="w-7 h-7 mx-auto text-slate-400 mb-2" />
                                        <p className="font-semibold text-slate-700">No products found</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Try clearing filters or search query.</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedProducts.map((prod) => {
                                    const isActive = prod.status === 'active';
                                    const threshold = prod.low_stock_threshold !== undefined && prod.low_stock_threshold !== null ? prod.low_stock_threshold : 10;
                                    const isLowStock = prod.quantity > 0 && prod.quantity <= threshold;
                                    const isOutOfStock = prod.quantity <= 0;

                                    // Compute visual progress bar width
                                    const maxCapacity = Math.max(threshold * 2, 50);
                                    const progressPercent = Math.min(100, Math.round((prod.quantity / maxCapacity) * 100));

                                    return (
                                        <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors group">
                                            {/* SKU with Copy Pill */}
                                            <td className="py-3.5 px-5 font-mono text-xs text-slate-700">
                                                <button
                                                    onClick={() => copyToClipboard(prod.sku)}
                                                    className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-slate-100/80 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-colors"
                                                    title="Click to copy SKU"
                                                >
                                                    <span>{prod.sku}</span>
                                                    {copiedSku === prod.sku ? (
                                                        <CheckCheck className="w-3 h-3 text-emerald-600" />
                                                    ) : (
                                                        <Copy className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                                                    )}
                                                </button>
                                            </td>

                                            {/* Name & Description */}
                                            <td className="py-3.5 px-5">
                                                <div className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                    {prod.name}
                                                </div>
                                                {prod.description && (
                                                    <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                                                        {prod.description}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Price */}
                                            <td className="py-3.5 px-5 font-medium text-slate-900">
                                                ${parseFloat(prod.price).toFixed(2)}
                                            </td>

                                            {/* Inventory Stock & Visual Health Meter */}
                                            <td className="py-3.5 px-5 min-w-[180px]">
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-xs">
                                                        {isOutOfStock ? (
                                                            <span className="font-semibold text-rose-600 flex items-center space-x-1">
                                                                <XCircle className="w-3 h-3" />
                                                                <span>0 Units (Out of Stock)</span>
                                                            </span>
                                                        ) : isLowStock ? (
                                                            <span className="font-semibold text-amber-700 flex items-center space-x-1">
                                                                <AlertTriangle className="w-3 h-3 text-amber-500" />
                                                                <span>{prod.quantity} Left (Low Stock)</span>
                                                            </span>
                                                        ) : (
                                                            <span className="font-medium text-slate-700">
                                                                {prod.quantity} in stock
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Mini Visual Health Bar */}
                                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div 
                                                            style={{ width: `${isOutOfStock ? 4 : progressPercent}%` }}
                                                            className={`h-full rounded-full transition-all ${
                                                                isOutOfStock
                                                                    ? 'bg-rose-500'
                                                                    : isLowStock
                                                                        ? 'bg-amber-400'
                                                                        : 'bg-emerald-500'
                                                            }`}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Configured Low Stock Alert Limit */}
                                            <td className="py-3.5 px-5 font-mono text-xs text-slate-600">
                                                <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-slate-600">
                                                    &le; {threshold}
                                                </span>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-3.5 px-5">
                                                <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                                                    isActive
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                                        : 'bg-slate-100 text-slate-600 border-slate-200/80'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                    <span className="capitalize">{prod.status}</span>
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-5 text-right">
                                                <div className="inline-flex items-center space-x-1">
                                                    {/* View Button */}
                                                    <button
                                                        onClick={() => handleOpenView(prod)}
                                                        className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200/80 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* Edit Button */}
                                                    <button
                                                        onClick={() => handleOpenEdit(prod)}
                                                        className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-colors"
                                                        title="Edit Product"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={() => handleOpenDelete(prod)}
                                                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 transition-colors"
                                                        title="Archive Product"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
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

                {/* Integrated Pagination Component */}
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredProducts.length}
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
