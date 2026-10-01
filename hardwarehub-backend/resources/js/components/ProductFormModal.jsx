import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Loader2, Package, Hash } from 'lucide-react';

export default function ProductFormModal({ isOpen, onClose, product, onSaved }) {
    const isEdit = Boolean(product && product.id);

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: 'General Hardware',
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
                category: product.category || 'General Hardware',
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
                category: 'General Hardware',
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
                    category: formData.category,
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
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-xl bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden z-10">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                            <Package className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">
                                {isEdit ? 'Edit Product' : 'Register New Product'}
                            </h3>
                            <p className="text-xs text-slate-500">
                                {isEdit ? `Updating specifications for SKU: ${product.sku}` : 'Fill in the details to register hardware item in catalog'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {errors.general && (
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2.5 text-rose-700 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{errors.general[0]}</span>
                        </div>
                    )}

                    {/* Row 1: Product Name (Full Width) */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Product Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Claw Hammer 16oz Steel"
                            className={`w-full h-10 px-3.5 rounded-xl bg-slate-50/70 border ${
                                errors.name ? 'border-rose-500' : 'border-slate-200'
                            } text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors`}
                        />
                        {errors.name && <p className="text-rose-600 text-xs mt-1">{errors.name[0]}</p>}
                    </div>

                    {/* Row 2: SKU, Category & Status (3 Columns) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Code / SKU <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-mono">
                                    <Hash className="w-3.5 h-3.5" />
                                </span>
                                <input
                                    type="text"
                                    required
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                                    placeholder="HW-HAM-001"
                                    className={`w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50/70 border font-mono ${
                                        errors.sku ? 'border-rose-500' : 'border-slate-200'
                                    } text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors`}
                                />
                            </div>
                            {errors.sku && <p className="text-rose-600 text-xs mt-1">{errors.sku[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Category <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full h-10 px-3 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            >
                                <option value="General Hardware">General Hardware</option>
                                <option value="Hand Tools">Hand Tools</option>
                                <option value="Power Tools">Power Tools</option>
                                <option value="Plumbing">Plumbing</option>
                                <option value="Electrical">Electrical</option>
                                <option value="Fasteners & Fixings">Fasteners & Fixings</option>
                                <option value="Paints & Chemicals">Paints & Chemicals</option>
                                <option value="Building Materials">Building Materials</option>
                                <option value="Safety & Security">Safety & Security</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Status <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full h-10 px-3 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            >
                                <option value="active">Active (Available)</option>
                                <option value="inactive">Inactive (Disabled)</option>
                            </select>
                            {errors.status && <p className="text-rose-600 text-xs mt-1">{errors.status[0]}</p>}
                        </div>
                    </div>

                    {/* Row 3: Pricing, Stock & Alert Threshold (3 Columns) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Unit Price ($) <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-semibold">
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
                                    className={`w-full h-10 pl-8 pr-3 rounded-xl bg-slate-50/70 border ${
                                        errors.price ? 'border-rose-500' : 'border-slate-200'
                                    } text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors`}
                                />
                            </div>
                            {errors.price && <p className="text-rose-600 text-xs mt-1">{errors.price[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                                className={`w-full h-10 px-3 rounded-xl bg-slate-50/70 border ${
                                    errors.quantity ? 'border-rose-500' : 'border-slate-200'
                                } text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors`}
                            />
                            {errors.quantity && <p className="text-rose-600 text-xs mt-1">{errors.quantity[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Low Stock Alert Limit <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                required
                                value={formData.low_stock_threshold}
                                onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                                placeholder="10"
                                className={`w-full h-10 px-3 rounded-xl bg-slate-50/70 border ${
                                    errors.low_stock_threshold ? 'border-rose-500' : 'border-slate-200'
                                } text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors`}
                            />
                            {errors.low_stock_threshold && <p className="text-rose-600 text-xs mt-1">{errors.low_stock_threshold[0]}</p>}
                        </div>
                    </div>

                    {/* Row 5: Description (Full Width) */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Description (Optional)
                        </label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detailed product specifications, dimensions, material..."
                            className={`w-full px-3 py-2 rounded-xl bg-slate-50/70 border ${
                                errors.description ? 'border-rose-500' : 'border-slate-200'
                            } text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors`}
                        />
                        {errors.description && <p className="text-rose-600 text-xs mt-1">{errors.description[0]}</p>}
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-3.5 h-3.5" />
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
