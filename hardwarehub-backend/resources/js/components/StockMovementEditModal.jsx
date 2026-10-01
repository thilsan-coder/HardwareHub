import React, { useState, useEffect } from 'react';
import { X, Edit3, Loader2, FileText, AlertCircle, Check, ArrowRightLeft, ArrowDownRight, ArrowUpRight, RefreshCw, AlertTriangle, Layers } from 'lucide-react';

export default function StockMovementEditModal({ isOpen, onClose, movement, products = [], onSaved }) {
    const [productId, setProductId] = useState('');
    const [type, setType] = useState('in'); // 'in', 'out', 'adjustment', 'damage'
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (movement) {
            setProductId(String(movement.product?.id || movement.product_id || ''));
            setType(movement.type || 'in');
            setQuantity(String(Math.abs(movement.quantity_changed || 1)));
            setReason(movement.reason || '');
            setError(null);
        }
    }, [isOpen, movement]);

    if (!isOpen || !movement) return null;

    const selectedProduct = products.find((p) => String(p.id) === String(productId)) || movement.product;
    
    // Baseline stock calculation (reverting old movement effect)
    let baseStock = selectedProduct ? selectedProduct.quantity : 0;
    if (movement && selectedProduct && movement.product?.id === selectedProduct.id) {
        if (movement.type === 'in') {
            baseStock = Math.max(0, baseStock - Math.abs(movement.quantity_changed));
        } else if (movement.type === 'out' || movement.type === 'damage') {
            baseStock = baseStock + Math.abs(movement.quantity_changed);
        } else if (movement.type === 'adjustment') {
            baseStock = movement.previous_stock;
        }
    }

    const parsedQty = parseInt(quantity, 10) || 0;
    let computedNewStock = baseStock;
    if (type === 'in') {
        computedNewStock = baseStock + parsedQty;
    } else if (type === 'out' || type === 'damage') {
        computedNewStock = Math.max(0, baseStock - parsedQty);
    } else if (type === 'adjustment') {
        computedNewStock = parsedQty;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!productId) {
            setError('Please select a valid product.');
            return;
        }

        if (parsedQty <= 0) {
            setError('Quantity must be greater than 0.');
            return;
        }

        if ((type === 'out' || type === 'damage') && parsedQty > baseStock) {
            setError(`Cannot dispatch ${parsedQty} units! Available stock baseline is only ${baseStock}.`);
            return;
        }

        setSaving(true);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        try {
            const response = await fetch(`/api/web/stock-movements/${movement.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    product_id: parseInt(productId, 10),
                    type,
                    quantity: parsedQty,
                    reason: reason.trim() || 'Manual stock update',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update stock movement');
            }

            if (onSaved) {
                onSaved(data.movement);
            }
            onClose();
        } catch (err) {
            setError(err.message || 'An error occurred while updating stock movement');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col scale-in-95 duration-150 max-h-[90vh]">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/15 text-indigo-300">
                            <Edit3 className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="text-base font-bold text-white tracking-tight">Edit Stock Movement</h3>
                                <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-white/15 text-indigo-200">
                                    LOG-#{String(movement.id).padStart(5, '0')}
                                </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-0.5">Modify product, type, units shifted or audit notes</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    {error && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2.5 text-rose-700 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Product Selection */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1.5">
                            <Layers className="w-3.5 h-3.5 text-slate-500" />
                            <span>Target Product <span className="text-rose-500">*</span></span>
                        </label>
                        <select
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-all"
                        >
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.sku}) — Current: {p.quantity} units
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Movement Type Grid */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1.5">
                            <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
                            <span>Movement Classification <span className="text-rose-500">*</span></span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setType('in')}
                                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                                    type === 'in'
                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20 shadow-xs'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Stock In (+)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setType('out')}
                                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                                    type === 'out'
                                        ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20 shadow-xs'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                                <span>Stock Out (-)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setType('adjustment')}
                                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                                    type === 'adjustment'
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/20 shadow-xs'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Audit Adjustment</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setType('damage')}
                                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                                    type === 'damage'
                                        ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20 shadow-xs'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                <span>Damaged / Write-off (-)</span>
                            </button>
                        </div>
                    </div>

                    {/* Quantity Field */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                            {type === 'adjustment' ? 'Target Stock Count' : 'Units Shifted'}{' '}
                            <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                            placeholder="e.g. 10"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-all"
                        />
                    </div>

                    {/* Stock Delta Preview Banner */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Baseline Stock</span>
                            <span className="text-sm font-extrabold text-slate-800">{baseStock} units</span>
                        </div>
                        <div className="text-slate-400 font-bold text-base">&rarr;</div>
                        <div className="text-right">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Anticipated Balance</span>
                            <span className="text-sm font-extrabold text-indigo-600">{computedNewStock} units</span>
                        </div>
                    </div>

                    {/* Reason / Reference Note */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span>Audit Memo / Reason <span className="text-slate-400 font-normal">(Optional)</span></span>
                        </label>
                        <textarea
                            rows="2"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Purchase order PO-2026-081 received from supplier..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-all resize-none font-medium leading-relaxed"
                        />
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex items-center justify-end space-x-2.5 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving || !productId || parsedQty <= 0}
                            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm shadow-indigo-600/25 transition-all active:scale-95 cursor-pointer"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 stroke-[2.5]" />
                                    <span>Update Movement & Stock</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
