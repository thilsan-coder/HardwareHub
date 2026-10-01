import React, { useState, useEffect } from 'react';
import { 
    Trash2, 
    RotateCcw, 
    Search, 
    RefreshCw, 
    AlertCircle, 
    Check, 
    Package, 
    Calendar,
    ArrowLeft
} from 'lucide-react';
import PermanentDeleteModal from './PermanentDeleteModal.jsx';
import Pagination from './Pagination.jsx';

export default function RecycleBin({ setActivePage }) {
    const [trashedProducts, setTrashedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    // Modal state for Permanent Delete
    const [forceDeleteModalOpen, setForceDeleteModalOpen] = useState(false);
    const [selectedProductForForceDelete, setSelectedProductForForceDelete] = useState(null);
    const [restoringId, setRestoringId] = useState(null);

    const fetchTrashed = async () => {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (searchTerm.trim()) params.append('search', searchTerm.trim());

        try {
            const response = await fetch(`/api/web/recycle-bin?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to load recycle bin records');
            }
            const data = await response.json();
            setTrashedProducts(data.products || []);
        } catch (err) {
            setError(err.message || 'Error loading recycle bin');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchTrashed();
            setCurrentPage(1);
        }, 250);
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    const showToast = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 4000);
    };

    // Restore Action
    const handleRestore = async (product) => {
        setRestoringId(product.id);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        try {
            const response = await fetch(`/api/web/recycle-bin/${product.id}/restore`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to restore product');
            }

            setTrashedProducts(trashedProducts.filter(p => p.id !== product.id));
            showToast(`Product "${product.name}" successfully restored to active catalog!`);
        } catch (err) {
            alert(err.message || 'Could not restore product');
        } finally {
            setRestoringId(null);
        }
    };

    // Open Permanent Delete Modal
    const handleOpenForceDelete = (product) => {
        setSelectedProductForForceDelete(product);
        setForceDeleteModalOpen(true);
    };

    // Callback on Permanent Delete
    const handleForceDeleted = (deletedId) => {
        setTrashedProducts(trashedProducts.filter(p => p.id !== deletedId));
        showToast('Product was permanently purged from database.');
    };

    // Paginated list
    const paginatedTrashed = trashedProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200/80">
                <div className="space-y-0.5">
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Recycle Bin Archive</h1>
                    <p className="text-xs text-slate-500">Soft-deleted hardware items eligible for restore or permanent purging</p>
                </div>

                <div className="flex items-center space-x-2.5">
                    <button
                        onClick={() => setActivePage('products')}
                        className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 text-xs font-semibold transition-colors shadow-xs"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Products</span>
                    </button>

                    <button
                        onClick={fetchTrashed}
                        disabled={loading}
                        className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80 text-xs font-medium transition-colors shadow-xs"
                        title="Refresh Recycle Bin"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Notification Toast */}
            {notification && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3 text-emerald-800 text-xs font-semibold shadow-xs">
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

            {/* Search Bar */}
            <div className="bg-white border border-slate-200/80 p-3 rounded-2xl shadow-xs">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Search className="w-4 h-4" />
                    </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search deleted items by SKU or Name..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                </div>
            </div>

            {/* Trashed Items Table Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider select-none">
                                <th className="py-3.5 px-5">SKU</th>
                                <th className="py-3.5 px-5">Product Name</th>
                                <th className="py-3.5 px-5">Unit Price</th>
                                <th className="py-3.5 px-5">Quantity</th>
                                <th className="py-3.5 px-5">Deleted Timestamp</th>
                                <th className="py-3.5 px-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-500">
                                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-600 mb-2" />
                                        <span className="font-medium text-xs">Loading archived records...</span>
                                    </td>
                                </tr>
                            ) : trashedProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-500">
                                        <Trash2 className="w-7 h-7 mx-auto text-slate-400 mb-2" />
                                        <p className="font-semibold text-slate-700">Recycle Bin is empty</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Archived items will appear here for restore or permanent purging.</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedTrashed.map((prod) => (
                                    <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors group">
                                        {/* SKU */}
                                        <td className="py-3.5 px-5 font-mono text-xs text-slate-700">
                                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80">
                                                {prod.sku}
                                            </span>
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

                                        {/* Quantity */}
                                        <td className="py-3.5 px-5 font-medium text-slate-600">
                                            {prod.quantity} units
                                        </td>

                                        {/* Deleted Timestamp */}
                                        <td className="py-3.5 px-5 text-slate-500 text-xs">
                                            <div className="flex items-center space-x-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                                                <span>{new Date(prod.deleted_at).toLocaleString()}</span>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3.5 px-5 text-right">
                                            <div className="inline-flex items-center space-x-1.5">
                                                {/* Restore Button */}
                                                <button
                                                    onClick={() => handleRestore(prod)}
                                                    disabled={restoringId === prod.id}
                                                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 text-xs font-semibold transition-colors disabled:opacity-50"
                                                    title="Restore to active catalog"
                                                >
                                                    <RotateCcw className={`w-3.5 h-3.5 ${restoringId === prod.id ? 'animate-spin' : ''}`} />
                                                    <span>Restore</span>
                                                </button>

                                                {/* Permanent Delete Button */}
                                                <button
                                                    onClick={() => handleOpenForceDelete(prod)}
                                                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 text-xs font-semibold transition-colors"
                                                    title="Permanently purge item"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>Purge</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalItems={trashedProducts.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    }}
                />
            </div>

            {/* Permanent Delete Confirmation Modal */}
            <PermanentDeleteModal
                isOpen={forceDeleteModalOpen}
                onClose={() => setForceDeleteModalOpen(false)}
                product={selectedProductForForceDelete}
                onDeleted={handleForceDeleted}
            />
        </div>
    );
}
