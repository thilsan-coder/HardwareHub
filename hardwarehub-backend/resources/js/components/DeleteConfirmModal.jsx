import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, product, onDeleted }) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen || !product) return null;

    const handleDelete = async () => {
        setDeleting(true);
        setError(null);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        try {
            const response = await fetch(`/api/web/products/${product.id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to archive product');
            }

            onDeleted(product.id);
            onClose();
        } catch (err) {
            setError(err.message || 'Error occurred while archiving product');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-xl p-5 z-10 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" />
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold text-slate-900">Archive Product</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Are you sure you want to move <span className="font-semibold text-slate-900">{product.name}</span> (<span className="font-mono text-slate-700">{product.sku}</span>) to the Recycle Bin?
                    </p>
                    <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                        This item can be restored back to the catalog anytime from the Recycle Bin.
                    </p>
                </div>

                {error && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-xs"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 active:scale-95"
                    >
                        {deleting ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Archiving...</span>
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Move to Recycle Bin</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
