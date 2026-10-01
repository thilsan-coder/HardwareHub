import React, { useState } from 'react';
import { AlertOctagon, Trash2, X, Loader2 } from 'lucide-react';

export default function PermanentDeleteModal({ isOpen, onClose, product, onDeleted, type = 'product' }) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen || !product) return null;

    const isMovement = type === 'movement';

    const handleForceDelete = async () => {
        setDeleting(true);
        setError(null);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        const endpoint = isMovement 
            ? `/api/web/recycle-bin/stock-movements/${product.id}/force-delete`
            : `/api/web/recycle-bin/${product.id}/force-delete`;

        try {
            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to permanently delete record');
            }

            onDeleted(product.id);
            onClose();
        } catch (err) {
            setError(err.message || 'Error occurred while permanently deleting record');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-xl p-5 z-10 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                        <AlertOctagon className="w-4 h-4" />
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold text-slate-900">Permanent Deletion Warning</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        {isMovement ? (
                            <>
                                Are you sure you want to permanently purge stock movement record{' '}
                                <span className="font-bold text-slate-900">LOG-#{String(product.id).padStart(5, '0')}</span>?
                            </>
                        ) : (
                            <>
                                Are you sure you want to permanently purge{' '}
                                <span className="font-semibold text-slate-900">{product.name}</span>{' '}
                                (<span className="font-mono text-slate-700">{product.sku}</span>)?
                            </>
                        )}
                    </p>
                    <p className="text-[11px] text-rose-800 font-medium bg-rose-50 p-2.5 rounded-xl border border-rose-200/80">
                        Caution: This action is irreversible. All record history will be permanently erased.
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
                        onClick={handleForceDelete}
                        disabled={deleting}
                        className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
                    >
                        {deleting ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Purging...</span>
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Permanent Delete</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
