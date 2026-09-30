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
                throw new Error(data.message || 'Failed to delete product');
            }

            onDeleted(product.id);
            onClose();
        } catch (err) {
            setError(err.message || 'Error occurred while deleting product');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 z-10 space-y-5">
                <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">Delete Product</h3>
                    <p className="text-sm text-slate-300">
                        Are you sure you want to remove <span className="font-bold text-white">{product.name}</span> (<span className="font-mono text-amber-400 text-xs">{product.sku}</span>)?
                    </p>
                    <p className="text-xs text-slate-500">
                        The item will be moved to the Recycle Bin and can be restored later.
                    </p>
                </div>

                {error && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-end space-x-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/25 transition-all disabled:opacity-50 active:scale-95"
                    >
                        {deleting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Deleting...</span>
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                <span>Delete Item</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
