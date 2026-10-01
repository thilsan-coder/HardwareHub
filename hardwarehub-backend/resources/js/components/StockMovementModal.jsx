import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, RefreshCw, AlertCircle, Loader2, ArrowRightLeft, Package } from 'lucide-react';

export default function StockMovementModal({ isOpen, onClose, products = [], onSaved, initialProduct = null }) {
    const [productId, setProductId] = useState('');
    const [type, setType] = useState('in'); // 'in', 'out', 'adjustment', 'damage'
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialProduct) {
            setProductId(String(initialProduct.id));
        } else if (products.length > 0 && !productId) {
            setProductId(String(products[0].id));
        }
        setType('in');
        setQuantity('');
        setReason('');
        setErrors({});
    }, [isOpen, initialProduct, products]);

    if (!isOpen) return null;

    const selectedProduct = products.find((p) => String(p.id) === String(productId));
    const previousStock = selectedProduct ? selectedProduct.quantity : 0;
    const parsedQty = parseInt(quantity, 10) || 0;

    let computedNewStock = previousStock;
    if (type === 'in') {
        computedNewStock = previousStock + parsedQty;
    } else if (type === 'out' || type === 'damage') {
        computedNewStock = Math.max(0, previousStock - parsedQty);
    } else if (type === 'adjustment') {
        computedNewStock = parsedQty;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSaving(true);

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        try {
            const response = await fetch('/api/web/stock-movements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    product_id: parseInt(productId, 10),
                    type,
                    quantity: parsedQty,
                    reason: reason.trim() || null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ general: [data.message || 'Failed to record stock movement'] });
                }
                return;
            }

            if (onSaved) onSaved(data.movement);
            onClose();
        } catch (err) {
            setErrors({ general: [err.message || 'Network error occurred'] });
        } finally {
            setSaving(false);
        }
    };

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
                            <ArrowRightLeft className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">
                                Record Stock Movement
                            </h3>
                            <p className="text-xs text-slate-500">
                                Stock In arrival, sale dispatch, or inventory audit correction
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {errors.general && (
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2.5 text-rose-700 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{errors.general[0]}</span>
                        </div>
                    )}

                    {/* Product Selection */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Select Product <span className="text-rose-500">*</span>
                        </label>
                        <select
                            required
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        >
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    [{p.sku}] {p.name} (Current: {p.quantity} units)
                                </option>
                            ))}
                        </select>
                        {errors.product_id && <p className="text-rose-600 text-xs mt-1">{errors.product_id[0]}</p>}
                    </div>

                    {/* Movement Type Grid */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Movement Type <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <button
                                type="button"
                                onClick={() => setType('in')}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                    type === 'in'
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-2 ring-emerald-500/20'
                                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700">
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                    <span>Stock In</span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-0.5">+ Supplier Arrival</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setType('out')}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                    type === 'out'
                                        ? 'bg-rose-50 border-rose-300 text-rose-900 ring-2 ring-rose-500/20'
                                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-700">
                                    <ArrowDownRight className="w-3.5 h-3.5" />
                                    <span>Stock Out</span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-0.5">- Sale / Dispatch</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setType('adjustment')}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                    type === 'adjustment'
                                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 ring-2 ring-indigo-500/20'
                                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-700">
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    <span>Audit</span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-0.5">= Set Exact Count</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setType('damage')}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                    type === 'damage'
                                        ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-500/20'
                                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800">
                                    <X className="w-3.5 h-3.5" />
                                    <span>Damage</span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-0.5">- Waste / Scrap</p>
                            </button>
                        </div>
                    </div>

                    {/* Quantity & Live Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                {type === 'adjustment' ? 'New Exact Stock Count' : 'Quantity to Move'} <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                min={type === 'adjustment' ? '0' : '1'}
                                step="1"
                                required
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="e.g. 10, 25, 50"
                                className={`w-full h-10 px-3 rounded-xl bg-slate-50/70 border ${
                                    errors.quantity ? 'border-rose-500' : 'border-slate-200'
                                } text-slate-900 text-xs font-bold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors`}
                            />
                            {errors.quantity && <p className="text-rose-600 text-xs mt-1">{errors.quantity[0]}</p>}
                        </div>

                        {/* Live Calculation Preview Card */}
                        <div className="h-10 px-3.5 rounded-xl bg-slate-100/80 border border-slate-200 flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Stock Change:</span>
                            <div className="flex items-center space-x-2 font-mono font-bold">
                                <span className="text-slate-600">{previousStock}</span>
                                <span className="text-slate-400">&rarr;</span>
                                <span className={computedNewStock < previousStock ? 'text-rose-600' : 'text-emerald-700'}>
                                    {computedNewStock} units
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Reason / Reference Note */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Reason / Reference Note (Optional)
                        </label>
                        <input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Supplier Invoice #402, Counter Sale #18, Warehouse audit"
                            className="w-full h-10 px-3 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        />
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !quantity}
                            className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Recording...</span>
                                </>
                            ) : (
                                <span>Confirm Movement</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
