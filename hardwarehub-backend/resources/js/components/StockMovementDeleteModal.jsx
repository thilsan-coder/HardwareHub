import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, Loader2, RefreshCw } from 'lucide-react';

export default function StockMovementDeleteModal({ isOpen, onClose, movement, onDeleted }) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen || !movement) return null;

    const handleDelete = async () => {
        setDeleting(true);
        setError(null);

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        try {
            const response = await fetch(`/api/web/stock-movements/${movement.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete stock movement');
            }

            if (onDeleted) {
                onDeleted(movement.id);
            }
            onClose();
        } catch (err) {
            setError(err.message || 'An error occurred while deleting movement record');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-md overflow-hidden flex flex-col scale-in-95 duration-150">
                {/* Red Danger Header */}
                <div className="bg-gradient-to-r from-rose-900 to-rose-950 p-6 text-white flex items-center justify-between border-b border-rose-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/15 text-rose-300">
                            <Trash2 className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="text-base font-bold text-white tracking-tight">Void / Delete Movement</h3>
                                <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-white/15 text-rose-200">
                                    LOG-#{String(movement.id).padStart(5, '0')}
                                </span>
                            </div>
                            <p className="text-xs text-rose-200 mt-0.5">Audit Record Cancellation</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-rose-300 hover:text-white hover:bg-white/10 transition-colors"
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Body */}
                <div className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Are you sure you want to delete this movement record for{' '}
                            <span className="font-bold text-slate-900">{movement.product?.name || 'this item'}</span>?
                        </p>

                        {/* Automatic Rollback Notice Card */}
                        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs flex items-start space-x-2.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <span className="font-bold">Automatic Inventory Balance Reversion</span>
                                <p className="text-[11px] text-amber-800 leading-relaxed">
                                    Deleting this transaction will safely reverse its effect and roll back the product's stock balance from{' '}
                                    <span className="font-mono font-bold">{movement.new_stock} units</span> back to{' '}
                                    <span className="font-mono font-bold">{movement.previous_stock} units</span>.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="pt-2 flex items-center justify-end space-x-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={deleting}
                            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm shadow-rose-600/25 transition-all active:scale-95 cursor-pointer"
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Reverting & Deleting...</span>
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 stroke-[2.2]" />
                                    <span>Delete & Revert Stock</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
