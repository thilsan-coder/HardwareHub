import React, { useState, useEffect, useMemo } from 'react';
import { 
    Trash2, 
    RotateCcw, 
    Search, 
    RefreshCw, 
    AlertCircle, 
    Check, 
    Package, 
    Calendar,
    ArrowLeft,
    ArrowRightLeft,
    ArrowUpRight,
    ArrowDownRight,
    AlertTriangle,
    Layers
} from 'lucide-react';
import PermanentDeleteModal from './PermanentDeleteModal.jsx';
import Pagination from './Pagination.jsx';

export default function RecycleBin({ setActivePage }) {
    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'stock-movements'
    const [trashedProducts, setTrashedProducts] = useState([]);
    const [trashedMovements, setTrashedMovements] = useState([]);
    const [counts, setCounts] = useState({ products: 0, movements: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    // Modal state for Permanent Delete
    const [forceDeleteModalOpen, setForceDeleteModalOpen] = useState(false);
    const [itemToForceDelete, setItemToForceDelete] = useState(null);
    const [forceDeleteType, setForceDeleteType] = useState('product'); // 'product' or 'movement'
    const [restoringId, setRestoringId] = useState(null);

    const fetchTrashed = async () => {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (searchTerm.trim()) params.append('search', searchTerm.trim());
        params.append('tab', activeTab);

        try {
            const response = await fetch(`/api/web/recycle-bin?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to load recycle bin records');
            }
            const data = await response.json();
            setTrashedProducts(data.products || []);
            setTrashedMovements(data.movements || []);
            setCounts(data.counts || { products: 0, movements: 0 });
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
        }, 200);
        return () => clearTimeout(timeout);
    }, [searchTerm, activeTab]);

    const showToast = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 4000);
    };

    // Restore Product
    const handleRestoreProduct = async (product) => {
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
            setCounts(prev => ({ ...prev, products: Math.max(0, prev.products - 1) }));
            showToast(`Product "${product.name}" successfully restored to active catalog!`);
        } catch (err) {
            alert(err.message || 'Could not restore product');
        } finally {
            setRestoringId(null);
        }
    };

    // Restore Stock Movement
    const handleRestoreMovement = async (movement) => {
        setRestoringId(movement.id);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        try {
            const response = await fetch(`/api/web/recycle-bin/stock-movements/${movement.id}/restore`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to restore stock movement');
            }

            setTrashedMovements(trashedMovements.filter(m => m.id !== movement.id));
            setCounts(prev => ({ ...prev, movements: Math.max(0, prev.movements - 1) }));
            showToast(`Stock Movement LOG-#${String(movement.id).padStart(5, '0')} restored & inventory balance re-applied!`);
        } catch (err) {
            alert(err.message || 'Could not restore stock movement');
        } finally {
            setRestoringId(null);
        }
    };

    // Open Permanent Delete Modal
    const handleOpenForceDelete = (item, type) => {
        setItemToForceDelete(item);
        setForceDeleteType(type);
        setForceDeleteModalOpen(true);
    };

    // Callback on Permanent Delete
    const handleDeletedPermanently = (deletedId) => {
        if (forceDeleteType === 'product') {
            setTrashedProducts(trashedProducts.filter(p => p.id !== deletedId));
            setCounts(prev => ({ ...prev, products: Math.max(0, prev.products - 1) }));
            showToast('Product permanently purged from system.');
        } else {
            setTrashedMovements(trashedMovements.filter(m => m.id !== deletedId));
            setCounts(prev => ({ ...prev, movements: Math.max(0, prev.movements - 1) }));
            showToast('Stock movement log permanently purged from system.');
        }
    };

    // Active Dataset Pagination
    const currentDataset = activeTab === 'products' ? trashedProducts : trashedMovements;
    const paginatedItems = useMemo(() => {
        return currentDataset.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    }, [currentDataset, currentPage, pageSize]);

    return (
        <div className="space-y-6 select-none">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200/80">
                <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setActivePage('products')}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                            title="Back to Catalog"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Recycle Bin Archive</h1>
                    </div>
                    <p className="text-xs text-slate-500">Safely restore or permanently purge archived products and voided stock movement records</p>
                </div>

                <div className="flex items-center space-x-2.5">
                    <button
                        onClick={fetchTrashed}
                        disabled={loading}
                        className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80 text-xs font-medium transition-colors shadow-xs"
                        title="Refresh Archive"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Notification Toast */}
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

            {/* Tab Navigation & Search Bar */}
            <div className="bg-white border border-slate-200/80 p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                {/* Tabs */}
                <div className="flex items-center space-x-1.5 w-full sm:w-auto">
                    <button
                        onClick={() => { setActiveTab('products'); setCurrentPage(1); }}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'products'
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <Package className="w-3.5 h-3.5" />
                        <span>Archived Products</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                            {counts.products}
                        </span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('stock-movements'); setCurrentPage(1); }}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'stock-movements'
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Voided Stock Movements</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            activeTab === 'stock-movements' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                            {counts.movements}
                        </span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Search className="w-3.5 h-3.5" />
                    </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={activeTab === 'products' ? 'Search archived product or SKU...' : 'Search voided movements, SKU...'}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Main Table Grid */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    {activeTab === 'products' ? (
                        /* Products Table */
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider select-none">
                                    <th className="py-3.5 px-5">SKU Code</th>
                                    <th className="py-3.5 px-5">Product Name</th>
                                    <th className="py-3.5 px-5">Category</th>
                                    <th className="py-3.5 px-5">Price</th>
                                    <th className="py-3.5 px-5">Archived At</th>
                                    <th className="py-3.5 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-500">
                                            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-600 mb-2" />
                                            <span>Loading archived items...</span>
                                        </td>
                                    </tr>
                                ) : currentDataset.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-500">
                                            <Trash2 className="w-7 h-7 mx-auto text-slate-300 mb-2" />
                                            <p className="font-semibold text-slate-700">No archived products in Recycle Bin</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Deleted products will appear here and can be restored anytime.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedItems.map((prod) => (
                                        <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors group">
                                            <td className="py-3.5 px-5 font-mono text-xs text-slate-600 font-semibold">
                                                {prod.sku}
                                            </td>
                                            <td className="py-3.5 px-5 font-medium text-slate-900">
                                                {prod.name}
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                                    {prod.category || 'General'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-5 font-medium text-slate-900">
                                                ${parseFloat(prod.price).toFixed(2)}
                                            </td>
                                            <td className="py-3.5 px-5 text-slate-500 text-[11px]">
                                                <div className="flex items-center space-x-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>{prod.deleted_at ? new Date(prod.deleted_at).toLocaleString() : 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-5 text-right">
                                                <div className="inline-flex items-center space-x-1.5">
                                                    <button
                                                        onClick={() => handleRestoreProduct(prod)}
                                                        disabled={restoringId === prod.id}
                                                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
                                                        title="Restore product to catalog"
                                                    >
                                                        <RotateCcw className={`w-3.5 h-3.5 ${restoringId === prod.id ? 'animate-spin' : ''}`} />
                                                        <span>Restore</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenForceDelete(prod, 'product')}
                                                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                                                        title="Permanently Delete"
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
                    ) : (
                        /* Stock Movements Table */
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider select-none">
                                    <th className="py-3.5 px-5">Log ID</th>
                                    <th className="py-3.5 px-5">Product Details</th>
                                    <th className="py-3.5 px-5">Type</th>
                                    <th className="py-3.5 px-5">Qty Shift</th>
                                    <th className="py-3.5 px-5">Reason</th>
                                    <th className="py-3.5 px-5">Voided At</th>
                                    <th className="py-3.5 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-slate-500">
                                            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-600 mb-2" />
                                            <span>Loading voided movement records...</span>
                                        </td>
                                    </tr>
                                ) : currentDataset.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-slate-500">
                                            <ArrowRightLeft className="w-7 h-7 mx-auto text-slate-300 mb-2" />
                                            <p className="font-semibold text-slate-700">No voided movements in Recycle Bin</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Voided movement records will appear here.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedItems.map((m) => (
                                        <tr key={m.id} className="hover:bg-slate-50/70 transition-colors group">
                                            <td className="py-3.5 px-5 font-mono text-xs text-slate-700 font-bold">
                                                LOG-#{String(m.id).padStart(5, '0')}
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <div className="font-medium text-slate-900">{m.product?.name || 'Deleted Product'}</div>
                                                <div className="font-mono text-[11px] text-slate-400">{m.product?.sku}</div>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <span className="capitalize px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                                    {m.type}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-5 font-mono font-bold text-xs">
                                                {m.quantity_changed > 0 ? `+${m.quantity_changed}` : m.quantity_changed} units
                                            </td>
                                            <td className="py-3.5 px-5 text-slate-600 max-w-xs truncate">
                                                {m.reason}
                                            </td>
                                            <td className="py-3.5 px-5 text-slate-500 text-[11px]">
                                                {m.deleted_at}
                                            </td>
                                            <td className="py-3.5 px-5 text-right">
                                                <div className="inline-flex items-center space-x-1.5">
                                                    <button
                                                        onClick={() => handleRestoreMovement(m)}
                                                        disabled={restoringId === m.id}
                                                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
                                                        title="Restore and re-apply inventory balance"
                                                    >
                                                        <RotateCcw className={`w-3.5 h-3.5 ${restoringId === m.id ? 'animate-spin' : ''}`} />
                                                        <span>Restore</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenForceDelete(m, 'movement')}
                                                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                                                        title="Permanently Purge Record"
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
                    )}
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalItems={currentDataset.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(newSize) => {
                        setPageSize(newSize);
                        setCurrentPage(1);
                    }}
                />
            </div>

            {/* Permanent Delete Modal */}
            <PermanentDeleteModal
                isOpen={forceDeleteModalOpen}
                onClose={() => setForceDeleteModalOpen(false)}
                product={itemToForceDelete}
                onDeleted={handleDeletedPermanently}
                type={forceDeleteType}
            />
        </div>
    );
}
