import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Loader2, Package, Hash, DollarSign, Layers, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ProductFormModal({ isOpen, onClose, product, onSaved }) {
    const isEdit = Boolean(product && product.id);

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        price: '',
        quantity: '',
        low_stock_threshold: '',
        status: 'active',
    });

    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                sku: product.sku || '',
                description: product.description || '',
                price: product.price ? String(product.price) : '',
                quantity: product.quantity !== undefined ? String(product.quantity) : '',
                low_stock_threshold: product.low_stock_threshold !== undefined && product.low_stock_threshold !== null ? String(product.low_stock_threshold) : '',
                status: product.status || 'active',
            });
        } else {
            setFormData({
                name: '',
                sku: '',
                description: '',
                price: '',
                quantity: '',
                low_stock_threshold: '',
                status: 'active',
            });
        }
        setErrors({});
    }, [product, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSaving(true);

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const url = isEdit ? `/api/web/products/${product.id}` : '/api/web/products';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    name: formData.name,
                    sku: formData.sku,
                    description: formData.description || null,
                    price: parseFloat(formData.price),
                    quantity: parseInt(formData.quantity, 10),
                    low_stock_threshold: parseInt(formData.low_stock_threshold, 10),
                    status: formData.status,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ general: [data.message || 'Failed to save product'] });
                }
                return;
            }

            onSaved(data.product, isEdit ? 'updated' : 'created');
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
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                            <Package className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">
                                {isEdit ? 'Edit Product' : 'Add New Hardware Product'}
                            </h3>
                            <p className="text-xs text-slate-400">
                                {isEdit ? `Updating details for SKU: ${product.sku}` : 'Fill in the details to register product inventory'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errors.general && (
                        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-3 text-rose-400 text-sm">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span>{errors.general[0]}</span>
                        </div>
                    )}

                    {/* Product Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                            Product Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Claw Hammer 16oz"
                            className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border ${
                                errors.name ? 'border-rose-500' : 'border-slate-800'
                            } text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors`}
                        />
                        {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name[0]}</p>}
                    </div>

                    {/* SKU & Status Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                Product Code / SKU <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-xs font-mono">
                                    <Hash className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    required
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                                    placeholder="HW-HAM-001"
                                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border font-mono ${
                                        errors.sku ? 'border-rose-500' : 'border-slate-800'
                                    } text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors`}
                                />
                            </div>
                            {errors.sku && <p className="text-rose-400 text-xs mt-1">{errors.sku[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                Status <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                            >
                                <option value="active">Active (Available)</option>
                                <option value="inactive">Inactive (Disabled)</option>
                            </select>
                            {errors.status && <p className="text-rose-400 text-xs mt-1">{errors.status[0]}</p>}
                        </div>
                    </div>

                    {/* Price, Quantity & Low Stock Alert Threshold Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                Unit Price ($) <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm">
                                    $
                                </span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="18.50"
                                    className={`w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border ${
                                        errors.price ? 'border-rose-500' : 'border-slate-800'
                                    } text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors`}
                                />
                            </div>
                            {errors.price && <p className="text-rose-400 text-xs mt-1">{errors.price[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                Stock In Hand <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                required
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                placeholder="45"
                                className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border ${
                                    errors.quantity ? 'border-rose-500' : 'border-slate-800'
                                } text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors`}
                            />
                            {errors.quantity && <p className="text-rose-400 text-xs mt-1">{errors.quantity[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Low Stock Alert Limit <span className="text-rose-500">*</span></span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                required
                                value={formData.low_stock_threshold}
                                onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                                placeholder="e.g. 5, 10, 20"
                                className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border ${
                                    errors.low_stock_threshold ? 'border-rose-500' : 'border-amber-500/30'
                                } text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors`}
                            />
                            {errors.low_stock_threshold && <p className="text-rose-400 text-xs mt-1">{errors.low_stock_threshold[0]}</p>}
                        </div>
                    </div>
                    <p className="text-[11px] text-slate-400 -mt-1">
                        💡 Alert will trigger when stock level drops to or below this specified number.
                    </p>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                            Description (Optional)
                        </label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detailed product specifications, dimensions, material..."
                            className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border ${
                                errors.description ? 'border-rose-500' : 'border-slate-800'
                            } text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors`}
                        />
                        {errors.description && <p className="text-rose-400 text-xs mt-1">{errors.description[0]}</p>}
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold shadow-lg shadow-amber-500/25 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>{isEdit ? 'Update Product' : 'Create Product'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
