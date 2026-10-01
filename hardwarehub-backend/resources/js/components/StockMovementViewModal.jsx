import React from 'react';
import { 
    X, 
    Calendar, 
    User, 
    ArrowRightLeft, 
    ArrowUpRight, 
    ArrowDownRight, 
    RefreshCw, 
    AlertTriangle,
    Package,
    Hash,
    Layers,
    FileText,
    CheckCircle2
} from 'lucide-react';

export default function StockMovementViewModal({ isOpen, onClose, movement, onEdit }) {
    if (!isOpen || !movement) return null;

    const isPositive = movement.quantity_changed > 0;
    const isNegative = movement.quantity_changed < 0;

    const getTypeDetails = (type) => {
        switch (type) {
            case 'in':
                return {
                    label: 'Stock In (Arrival / Restock)',
                    icon: ArrowUpRight,
                    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
                    dotColor: 'bg-emerald-500'
                };
            case 'out':
                return {
                    label: 'Stock Out (Sale / Dispatch)',
                    icon: ArrowDownRight,
                    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80',
                    dotColor: 'bg-blue-500'
                };
            case 'damage':
                return {
                    label: 'Damaged / Waste Write-off',
                    icon: AlertTriangle,
                    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
                    dotColor: 'bg-rose-500'
                };
            default:
                return {
                    label: 'Physical Count Adjustment',
                    icon: RefreshCw,
                    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
                    dotColor: 'bg-indigo-500'
                };
        }
    };

    const typeConfig = getTypeDetails(movement.type);
    const TypeIcon = typeConfig.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col scale-in-95 duration-150">
                {/* Header Strip */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/15 text-indigo-300 shadow-inner">
                            <ArrowRightLeft className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="text-base font-bold text-white tracking-tight">Stock Movement Voucher</h3>
                                <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-white/15 text-indigo-200 border border-white/20">
                                    LOG-#{String(movement.id).padStart(5, '0')}
                                </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-0.5">Verified Inventory Audit Entry</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Body */}
                <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
                    {/* Movement Type & Time Status Card */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${typeConfig.badgeClass}`}>
                                <span className={`w-2 h-2 rounded-full ${typeConfig.dotColor}`}></span>
                                <span>{typeConfig.label}</span>
                            </span>
                        </div>

                        <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{movement.created_at}</span>
                        </div>
                    </div>

                    {/* Product Details Section */}
                    <div className="border border-slate-200/80 rounded-2xl p-4 bg-white space-y-3">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                            <Package className="w-3.5 h-3.5 text-slate-500" />
                            <span>Target Product Details</span>
                        </div>

                        {movement.product ? (
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div className="col-span-2">
                                    <div className="text-xs text-slate-400">Product Name</div>
                                    <div className="text-sm font-bold text-slate-900">{movement.product.name}</div>
                                </div>

                                <div>
                                    <div className="text-xs text-slate-400">SKU Code</div>
                                    <div className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-0.5 border border-slate-200/70">
                                        {movement.product.sku}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs text-slate-400">Category</div>
                                    <div className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-0.5 border border-indigo-100">
                                        {movement.product.category || 'General'}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 italic">This product has been removed or archived.</p>
                        )}
                    </div>

                    {/* Stock Shift Calculation Card */}
                    <div className="bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-100/90 rounded-2xl p-4">
                        <div className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center space-x-1.5 mb-3">
                            <Layers className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Inventory Shift Balance</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-white p-3 rounded-xl border border-indigo-100/80 shadow-xs">
                                <div className="text-[11px] font-semibold text-slate-400">Previous Stock</div>
                                <div className="text-base font-bold text-slate-700 mt-0.5 font-mono">
                                    {movement.previous_stock}
                                </div>
                                <div className="text-[10px] text-slate-400">units</div>
                            </div>

                            <div className="bg-white p-3 rounded-xl border border-indigo-100/80 shadow-xs flex flex-col justify-center items-center">
                                <div className="text-[11px] font-semibold text-indigo-600">Quantity Shift</div>
                                <div className={`text-base font-bold mt-0.5 font-mono ${isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : 'text-slate-700'}`}>
                                    {isPositive ? `+${movement.quantity_changed}` : movement.quantity_changed}
                                </div>
                                <div className="text-[10px] text-indigo-400 font-semibold">units</div>
                            </div>

                            <div className="bg-white p-3 rounded-xl border border-indigo-200 shadow-xs ring-2 ring-indigo-500/10">
                                <div className="text-[11px] font-bold text-indigo-900">New Balance</div>
                                <div className="text-base font-extrabold text-indigo-900 mt-0.5 font-mono">
                                    {movement.new_stock}
                                </div>
                                <div className="text-[10px] text-indigo-600 font-semibold">units</div>
                            </div>
                        </div>
                    </div>

                    {/* Operator & Reason Section */}
                    <div className="space-y-3 pt-1">
                        <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                            <span className="text-slate-400 flex items-center space-x-1.5">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span>Logged By Operator</span>
                            </span>
                            <span className="font-semibold text-slate-800">{movement.user?.name || 'System Administrator'}</span>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs text-slate-400 flex items-center space-x-1.5">
                                <FileText className="w-3.5 h-3.5 text-slate-400" />
                                <span>Reason / Reference Notes</span>
                            </span>
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium leading-relaxed">
                                {movement.reason || 'Standard stock adjustment recorded in system.'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-end space-x-2.5">
                    {onEdit && (
                        <button
                            onClick={() => {
                                onClose();
                                onEdit(movement);
                            }}
                            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                        >
                            Edit Reason Notes
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                        Close Voucher
                    </button>
                </div>
            </div>
        </div>
    );
}
