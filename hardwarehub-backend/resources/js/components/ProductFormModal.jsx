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
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden z-10">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/60">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shadow-xs">
                            <Package className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                {isEdit ? 'Edit Product' : 'Add New Hardware Product'}
                            </h3>
                            <p className="text-xs text-slate-500">
                                {isEdit ? `Updating details for SKU: ${product.sku}` : 'Fill in the details to register product inventory'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errors.general && (
                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-3 text-rose-700 text-sm">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span>{errors.general[0]}</span>
                        </div>
                    )}

                    {/* Row 1: Product Name (Full Width) */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Product Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Claw Hammer 16oz Steel"
                            className={`w-full h-11 px-4 rounded-xl bg-slate-50 border ${
                                errors.name ? 'border-rose-500' : 'border-slate-200'
                            } text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors`}
                        />
                        {errors.name && <p className="text-rose-600 text-xs mt-1">{errors.name[0]}</p>}
                    </div>

                    {/* Row 2: SKU & Status (2 Columns) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Product Code / SKU <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs font-mono">
                                    <Hash className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    required
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                                    placeholder="HW-HAM-001"
                                    className={`w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border font-mono ${
                                        errors.sku ? 'border-rose-500' : 'border-slate-200'
                                    } text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors`}
                                />
                            </div>
                            {errors.sku && <p className="text-rose-600 text-xs mt-1">{errors.sku[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Status <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                            >
                                <option value="active">Active (Available)</option>
                                <option value="inactive">Inactive (Disabled)</option>
                            </select>
                            {errors.status && <p className="text-rose-600 text-xs mt-1">{errors.status[0]}</p>}
                        </div>
                    </div>

                    {/* Row 3: Unit Price & Quantity (2 Columns) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Unit Price ($) <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm font-bold">
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
                                    className={`w-full h-11 pl-9 pr-4 rounded-xl bg-slate-50 border ${
                                        errors.price ? 'border-rose-500' : 'border-slate-200'
                                    } text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors`}
                                />
                            </div>
                            {errors.price && <p className="text-rose-600 text-xs mt-1">{errors.price[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                                className={`w-full h-11 px-4 rounded-xl bg-slate-50 border ${
                                    errors.quantity ? 'border-rose-500' : 'border-slate-200'
                                } text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors`}
                            />
                            {errors.quantity && <p className="text-rose-600 text-xs mt-1">{errors.quantity[0]}</p>}
                        </div>
                    </div>

                    {/* Row 4: Low Stock Alert Limit & Helper Card (2 Columns) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
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
                                className={`w-full h-11 px-4 rounded-xl bg-slate-50 border ${
                                    errors.low_stock_threshold ? 'border-rose-500' : 'border-amber-200'
                                } text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors`}
                            />
                            {errors.low_stock_threshold && <p className="text-rose-600 text-xs mt-1">{errors.low_stock_threshold[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                Alert Rule Guide
                            </label>
                            <div className="h-11 px-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-center space-x-2 text-xs">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span className="text-[11px] leading-tight text-amber-800 font-medium">
                                    Alert triggers automatically when stock drops ≤ this limit.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Row 5: Description (Full Width) */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Description (Optional)
                        </label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detailed product specifications, dimensions, material..."
                            className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 border ${
                                errors.description ? 'border-rose-500' : 'border-slate-200'
                            } text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors`}
                        />
                        {errors.description && <p className="text-rose-600 text-xs mt-1">{errors.description[0]}</p>}
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-sm font-semibold transition-colors shadow-xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
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
