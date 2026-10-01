import React, { useState, useEffect } from 'react';
import { X, Edit3, Loader2, FileText, AlertCircle, Check } from 'lucide-react';

export default function StockMovementEditModal({ isOpen, onClose, movement, onSaved }) {
    const [reason, setReason] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (movement) {
            setReason(movement.reason || '');
            setError(null);
        }
    }, [isOpen, movement]);

    if (!isOpen || !movement) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
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
                    reason: reason.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update stock movement notes');
            }

            if (onSaved) {
                onSaved(data.movement);
            }
            onClose();
        } catch (err) {
            setError(err.message || 'An error occurred while updating notes');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-md overflow-hidden flex flex-col scale-in-95 duration-150">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/15 text-indigo-300">
                            <Edit3 className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="text-base font-bold text-white tracking-tight">Edit Movement Note</h3>
                                <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-white/15 text-indigo-200">
                                    LOG-#{String(movement.id).padStart(5, '0')}
                                </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-0.5">{movement.product?.name || 'Inventory Record'}</p>
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2.5 text-rose-700 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                        <div className="text-slate-400 font-medium">Audit Shift Detail:</div>
                        <div className="font-bold text-slate-800 flex items-center space-x-2">
                            <span>{movement.previous_stock} units</span>
                            <span>&rarr;</span>
                            <span className="text-indigo-600">{movement.new_stock} units</span>
                            <span className="font-normal text-slate-500">
                                ({movement.quantity_changed > 0 ? `+${movement.quantity_changed}` : movement.quantity_changed} units)
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span>Reason / Reference Note <span className="text-rose-500">*</span></span>
                        </label>
                        <textarea
                            rows="4"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            placeholder="e.g. Purchase order PO-2026-081 received from supplier, verified by manager..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-all resize-none font-medium leading-relaxed"
                        />
                        <p className="text-[11px] text-slate-400">
                            Quantities are immutable for accounting audit compliance. You can update references, PO numbers or invoice remarks.
                        </p>
                    </div>

                    <div className="pt-2 flex items-center justify-end space-x-2.5">
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
                            disabled={saving || !reason.trim()}
                            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm shadow-indigo-600/25 transition-all active:scale-95 cursor-pointer"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 stroke-[2.5]" />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
