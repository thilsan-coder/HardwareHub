import React, { useState, useEffect } from 'react';
import { 
    ArrowRightLeft, 
    ArrowUpRight, 
    ArrowDownRight, 
    RefreshCw, 
    Search, 
    Calendar, 
    User, 
    Check, 
    AlertCircle, 
    Plus, 
    FileSpreadsheet,
    Package,
    Eye,
    Edit3,
    Trash2,
    Layers,
    AlertTriangle
} from 'lucide-react';
import StockMovementModal from './StockMovementModal.jsx';
import StockMovementViewModal from './StockMovementViewModal.jsx';
import StockMovementEditModal from './StockMovementEditModal.jsx';
import StockMovementDeleteModal from './StockMovementDeleteModal.jsx';
import Pagination from './Pagination.jsx';

export default function StockMovements() {
    const [movements, setMovements] = useState([]);
    const [summary, setSummary] = useState({ total: 0, stock_in: 0, stock_out: 0, adjustments: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

    // Filters & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalItems, setTotalItems] = useState(0);

    // Products for record modal
    const [productsList, setProductsList] = useState([]);

    // Modal States
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedMovementForView, setSelectedMovementForView] = useState(null);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedMovementForEdit, setSelectedMovementForEdit] = useState(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedMovementForDelete, setSelectedMovementForDelete] = useState(null);

    const fetchMovements = async () => {
        setLoading(true);
        setError(null);

        try {
            const url = new URL('/api/web/stock-movements', window.location.origin);
            if (searchTerm) url.searchParams.set('search', searchTerm);
            if (typeFilter !== 'all') url.searchParams.set('type', typeFilter);
            url.searchParams.set('per_page', pageSize);
            url.searchParams.set('page', currentPage);

            const response = await fetch(url.toString());
            if (!response.ok) throw new Error('Failed to fetch stock movements');

            const data = await response.json();
            setMovements(data.movements || []);
            setSummary(data.summary || { total: 0, stock_in: 0, stock_out: 0, adjustments: 0 });
            setTotalItems(data.pagination?.total || 0);
        } catch (err) {
            setError(err.message || 'Error loading stock movements');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/web/products');
            if (res.ok) {
                const data = await res.json();
                setProductsList(data.products || []);
            }
        } catch (err) {
            // Ignore background error
        }
    };

    useEffect(() => {
        fetchMovements();
    }, [searchTerm, typeFilter, currentPage, pageSize]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const showToast = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 4000);
    };

    const handleMovementSaved = () => {
        showToast('Stock movement recorded & inventory updated successfully!');
        fetchMovements();
        fetchProducts();
    };

    const handleMovementUpdated = (updatedMovement) => {
        showToast(`Stock movement LOG-#${String(updatedMovement.id).padStart(5, '0')} notes updated!`);
        fetchMovements();
    };

    const handleMovementDeleted = (deletedId) => {
        showToast(`Stock movement LOG-#${String(deletedId).padStart(5, '0')} deleted & inventory balance reverted!`);
        fetchMovements();
        fetchProducts();
    };

    // Open Modals
    const handleOpenView = (movement) => {
        setSelectedMovementForView(movement);
        setViewModalOpen(true);
    };

    const handleOpenEdit = (movement) => {
        setSelectedMovementForEdit(movement);
        setEditModalOpen(true);
    };

    const handleOpenDelete = (movement) => {
        setSelectedMovementForDelete(movement);
        setDeleteModalOpen(true);
    };

    return (
        <div className="space-y-6 w-full select-none">
            {/* Top Header Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70 text-xs font-semibold">
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>Audit Trail</span>
                        </span>
                        <span className="text-xs text-slate-400">&bull;</span>
                        <span className="text-xs font-semibold text-slate-500">
                            {summary.total} Total Logged Transactions
                        </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        Stock Movements & History Log
                    </h1>
                    <p className="text-xs text-slate-500 max-w-2xl">
                        Comprehensive ledger of all stock arrivals, sales dispatches, waste write-offs, and count adjustments.
                    </p>
                </div>

                <div className="flex items-center space-x-2.5">
                    {/* Export Excel Button */}
                    <a
                        href="/api/web/export/stock-movements"
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-xs"
                        download
                        title="Download full movements audit log in styled Microsoft Excel (.xlsx)"
                    >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Export Excel (.xlsx)</span>
                    </a>

                    {/* Record Stock Movement Button (Add) */}
                    <button
                        onClick={() => setIsMovementModalOpen(true)}
                        className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/25 transition-all active:scale-95 cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Record Stock In/Out</span>
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

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
                    <div className="text-[11px] font-semibold text-slate-400">Total Entries</div>
                    <div className="text-xl font-bold text-slate-900 mt-1">{summary.total}</div>
                </div>
                <div className="bg-white border border-emerald-100 p-4 rounded-2xl shadow-xs">
                    <div className="text-[11px] font-semibold text-emerald-600 flex items-center space-x-1">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Stock In (Arrivals)</span>
                    </div>
                    <div className="text-xl font-bold text-emerald-700 mt-1">{summary.stock_in}</div>
                </div>
                <div className="bg-white border border-rose-100 p-4 rounded-2xl shadow-xs">
                    <div className="text-[11px] font-semibold text-rose-600 flex items-center space-x-1">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        <span>Stock Out (Dispatches)</span>
                    </div>
                    <div className="text-xl font-bold text-rose-700 mt-1">{summary.stock_out}</div>
                </div>
                <div className="bg-white border border-indigo-100 p-4 rounded-2xl shadow-xs">
                    <div className="text-[11px] font-semibold text-indigo-600 flex items-center space-x-1">
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Adjustments / Audits</span>
                    </div>
                    <div className="text-xl font-bold text-indigo-700 mt-1">{summary.adjustments}</div>
                </div>
            </div>

            {/* Filter Pills & Search Control */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                {/* Filter Tabs */}
                <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto">
                    {[
                        { id: 'all', label: 'All Logs' },
                        { id: 'in', label: 'Stock In' },
                        { id: 'out', label: 'Stock Out' },
                        { id: 'adjustment', label: 'Adjustments' },
                        { id: 'damage', label: 'Damage' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setTypeFilter(tab.id); setCurrentPage(1); }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                typeFilter === tab.id
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search Box */}
                <div className="relative w-full sm:w-72">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Search className="w-3.5 h-3.5" />
                    </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        placeholder="Search product, SKU, note..."
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                    />
                </div>
            </div>

            {/* Movements Data Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider select-none">
                                <th className="py-3.5 px-5">Timestamp</th>
                                <th className="py-3.5 px-5">Product Details</th>
                                <th className="py-3.5 px-5">Type</th>
                                <th className="py-3.5 px-5">Qty Change</th>
                                <th className="py-3.5 px-5">Stock Shift</th>
                                <th className="py-3.5 px-5">Logged By</th>
                                <th className="py-3.5 px-5">Reason / Note</th>
                                <th className="py-3.5 px-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="py-12 text-center text-slate-500">
                                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-600 mb-2" />
                                        <span className="font-medium text-xs">Loading stock movements log...</span>
                                    </td>
                                </tr>
                            ) : movements.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="py-12 text-center text-slate-500">
                                        <ArrowRightLeft className="w-7 h-7 mx-auto text-slate-400 mb-2" />
                                        <p className="font-semibold text-slate-700">No stock movements found</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Transactions will appear automatically as stock changes.</p>
                                    </td>
                                </tr>
                            ) : (
                                movements.map((m) => {
                                    const isPositive = m.quantity_changed > 0;
                                    const isNegative = m.quantity_changed < 0;

                                    return (
                                        <tr key={m.id} className="hover:bg-slate-50/70 transition-colors group">
                                            {/* Timestamp */}
                                            <td className="py-3.5 px-5 text-slate-600 text-[11px] whitespace-nowrap">
                                                <div className="flex items-center space-x-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>{m.created_at}</span>
                                                </div>
                                            </td>

                                            {/* Product Details */}
                                            <td className="py-3.5 px-5">
                                                {m.product ? (
                                                    <div>
                                                        <div className="font-medium text-slate-900 flex items-center space-x-2">
                                                            <span>{m.product.name}</span>
                                                            {m.product.is_deleted && (
                                                                <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-rose-50 text-rose-600 border border-rose-200">
                                                                    Archived
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono mt-0.5">
                                                            <span>{m.product.sku}</span>
                                                            <span>&bull;</span>
                                                            <span className="text-slate-500 font-sans">{m.product.category}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic">Product Removed</span>
                                                )}
                                            </td>

                                            {/* Type Pill */}
                                            <td className="py-3.5 px-5">
                                                {m.type === 'in' && (
                                                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <ArrowUpRight className="w-3 h-3" />
                                                        <span>Stock In</span>
                                                    </span>
                                                )}
                                                {m.type === 'out' && (
                                                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <ArrowDownRight className="w-3 h-3" />
                                                        <span>Stock Out</span>
                                                    </span>
                                                )}
                                                {m.type === 'adjustment' && (
                                                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                        <RefreshCw className="w-3 h-3" />
                                                        <span>Adjustment</span>
                                                    </span>
                                                )}
                                                {m.type === 'damage' && (
                                                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                                        <span>Damaged</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* Quantity Change */}
                                            <td className="py-3.5 px-5 font-mono font-bold text-xs">
                                                <span className={isPositive ? 'text-emerald-700' : isNegative ? 'text-rose-600' : 'text-slate-600'}>
                                                    {isPositive ? `+${m.quantity_changed}` : m.quantity_changed} units
                                                </span>
                                            </td>

                                            {/* Stock Shift (Previous -> New) */}
                                            <td className="py-3.5 px-5 font-mono text-xs">
                                                <div className="flex items-center space-x-1.5 text-slate-500">
                                                    <span>{m.previous_stock}</span>
                                                    <span className="text-slate-400">&rarr;</span>
                                                    <span className="font-bold text-slate-900">{m.new_stock}</span>
                                                </div>
                                            </td>

                                            {/* Logged By User */}
                                            <td className="py-3.5 px-5 text-slate-700 text-xs">
                                                <div className="flex items-center space-x-1.5">
                                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="font-medium">{m.user?.name || 'System'}</span>
                                                </div>
                                            </td>

                                            {/* Reason / Note */}
                                            <td className="py-3.5 px-5 text-slate-600 text-xs max-w-xs truncate">
                                                {m.reason}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-5 text-right">
                                                <div className="inline-flex items-center space-x-1">
                                                    {/* View Voucher Modal */}
                                                    <button
                                                        onClick={() => handleOpenView(m)}
                                                        className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200/80 transition-colors"
                                                        title="View Movement Voucher Slip"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* Edit Reason Modal */}
                                                    <button
                                                        onClick={() => handleOpenEdit(m)}
                                                        className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-colors cursor-pointer"
                                                        title="Edit Reference Notes"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* Void / Delete Modal */}
                                                    <button
                                                        onClick={() => handleOpenDelete(m)}
                                                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 transition-colors cursor-pointer"
                                                        title="Void / Delete Movement (Auto Reverts Stock)"
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

                {/* 5-Records Pagination Footer */}
                <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(newSize) => {
                        setPageSize(newSize);
                        setCurrentPage(1);
                    }}
                />
            </div>

            {/* Record Stock Movement Modal (Add) */}
            <StockMovementModal
                isOpen={isMovementModalOpen}
                onClose={() => setIsMovementModalOpen(false)}
                products={productsList}
                onSaved={handleMovementSaved}
            />

            {/* View Stock Movement Voucher Modal (View) */}
            <StockMovementViewModal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                movement={selectedMovementForView}
                onEdit={handleOpenEdit}
            />

            {/* Edit Stock Movement Notes Modal (Edit) */}
            <StockMovementEditModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                movement={selectedMovementForEdit}
                onSaved={handleMovementUpdated}
            />

            {/* Delete / Void Stock Movement Modal (Delete & Revert) */}
            <StockMovementDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                movement={selectedMovementForDelete}
                onDeleted={handleMovementDeleted}
            />
        </div>
    );
}
