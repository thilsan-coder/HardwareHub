import React from 'react';
import { X, Package, Hash, DollarSign, Layers, CheckCircle2, XCircle, Calendar, Edit3, Trash2, AlertTriangle } from 'lucide-react';

export default function ProductViewModal({ isOpen, onClose, product, onEdit, onDelete }) {
    if (!isOpen || !product) return null;

    const isActive = product.status === 'active';
    const threshold = product.low_stock_threshold !== undefined && product.low_stock_threshold !== null ? product.low_stock_threshold : 10;
    const isLowStock = product.quantity <= threshold;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                            <Package className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Product Specification</h3>
                            <span className="font-mono text-xs text-amber-400 font-semibold">{product.sku}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Title & Status */}
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-extrabold text-white">{product.name}</h2>
                            <p className="text-xs text-slate-400 mt-1">Database ID: #{product.id}</p>
                        </div>
                        <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            isActive
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                            {isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            <span className="capitalize">{product.status}</span>
                        </span>
                    </div>

                    {/* Low Stock Alert in Details */}
                    {isLowStock && (
                        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center space-x-3 text-amber-300 text-xs font-bold">
                            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                            <span>Low Stock Alert: Only {product.quantity} units remaining in stock (Configured threshold: ≤{threshold} units). Restocking recommended.</span>
                        </div>
                    )}

                    {/* Description */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Product Description
                        </span>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            {product.description || 'No detailed description provided for this item.'}
                        </p>
                    </div>

                    {/* Price, Quantity & Alert Threshold Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Unit Price
                            </span>
                            <span className="text-xl font-black text-amber-400 font-mono">
                                ${parseFloat(product.price).toFixed(2)}
                            </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                In Stock
                            </span>
                            <span className={`text-xl font-black font-mono ${isLowStock ? 'text-amber-400' : 'text-white'}`}>
                                {product.quantity} <span className="text-[10px] font-normal text-slate-400">pcs</span>
                            </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                                Alert Limit
                            </span>
                            <span className="text-xl font-black text-slate-200 font-mono">
                                ≤{threshold} <span className="text-[10px] font-normal text-slate-400">pcs</span>
                            </span>
                        </div>
                    </div>

                    {/* Audit Metadata */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center space-x-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Created: {new Date(product.created_at).toLocaleDateString()}</span>
                        </div>
                        <div>
                            <span>Last Updated: {new Date(product.updated_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between p-6 border-t border-slate-800 bg-slate-950/40">
                    <button
                        onClick={() => {
                            onClose();
                            onDelete(product);
                        }}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                    </button>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => {
                                onClose();
                                onEdit(product);
                            }}
                            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all"
                        >
                            <Edit3 className="w-4 h-4" />
                            <span>Edit Item</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
