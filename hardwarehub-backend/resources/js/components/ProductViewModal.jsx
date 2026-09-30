import React from 'react';
import { X, Package, CheckCircle2, XCircle, Calendar, Edit3, Trash2, AlertTriangle } from 'lucide-react';

export default function ProductViewModal({ isOpen, onClose, product, onEdit, onDelete }) {
    if (!isOpen || !product) return null;

    const isActive = product.status === 'active';
    const threshold = product.low_stock_threshold !== undefined && product.low_stock_threshold !== null ? product.low_stock_threshold : 10;
    const isLowStock = product.quantity <= threshold;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-lg bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden z-10">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                            <Package className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Product Details</h3>
                            <span className="font-mono text-xs text-indigo-600">{product.sku}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-5">
                    {/* Title & Status */}
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">{product.name}</h2>
                            <p className="text-[11px] text-slate-400 mt-0.5">Database ID: #{product.id}</p>
                        </div>
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                            isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                : 'bg-slate-100 text-slate-600 border-slate-200/80'
                        }`}>
                            {isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span className="capitalize">{product.status}</span>
                        </span>
                    </div>

                    {/* Low Stock Alert in Details */}
                    {isLowStock && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center space-x-2.5 text-amber-800 text-xs">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Stock is at or below the alert limit ({product.quantity} remaining).</span>
                        </div>
                    )}

                    {/* Description */}
                    <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Product Description
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed">
                            {product.description || 'No detailed specifications added.'}
                        </p>
                    </div>

                    {/* Price, Quantity & Alert Threshold Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                Unit Price
                            </span>
                            <span className="text-base font-bold text-slate-900">
                                ${parseFloat(product.price).toFixed(2)}
                            </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                In Stock
                            </span>
                            <span className={`text-base font-bold ${isLowStock ? 'text-amber-600' : 'text-slate-900'}`}>
                                {product.quantity} <span className="text-[10px] font-normal text-slate-400">pcs</span>
                            </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                Alert Limit
                            </span>
                            <span className="text-base font-bold text-slate-800">
                                ≤{threshold} <span className="text-[10px] font-normal text-slate-400">pcs</span>
                            </span>
                        </div>
                    </div>

                    {/* Audit Metadata */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center space-x-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Created: {new Date(product.created_at).toLocaleDateString()}</span>
                        </div>
                        <div>
                            <span>Updated: {new Date(product.updated_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
                    <button
                        onClick={() => {
                            onClose();
                            onDelete(product);
                        }}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 text-xs font-semibold transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Archive</span>
                    </button>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={onClose}
                            className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-xs"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => {
                                onClose();
                                onEdit(product);
                            }}
                            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Item</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
