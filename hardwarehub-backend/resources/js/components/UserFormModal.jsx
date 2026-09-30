import React, { useState, useEffect } from 'react';
import { X, UserPlus, AlertCircle, Loader2, User, Mail, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function UserFormModal({ isOpen, onClose, onUserCreated }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
            });
            setErrors({});
            setShowPassword(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (formData.password.length < 6) {
            setErrors({ password: ['Password must be at least 6 characters long.'] });
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            setErrors({ password_confirmation: ['Passwords do not match.'] });
            return;
        }

        setSaving(true);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        try {
            const response = await fetch('/api/web/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ general: [data.message || 'Failed to create user account.'] });
                }
                return;
            }

            onUserCreated(data.user);
            onClose();
        } catch (err) {
            setErrors({ general: [err.message || 'Network connection error occurred.'] });
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

            {/* Modal Dialog */}
            <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden z-10">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/70">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shadow-xs">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Add System User</h3>
                            <p className="text-xs text-slate-500">Create a new administrator account with system access</p>
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

                    {/* Full Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Full Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <User className="w-4 h-4" />
                            </span>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Alex Fernando"
                                className={`w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border ${
                                    errors.name ? 'border-rose-500' : 'border-slate-200'
                                } text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors`}
                            />
                        </div>
                        {errors.name && <p className="text-rose-600 text-xs mt-1">{errors.name[0]}</p>}
                    </div>

                    {/* Email Address */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Email Address <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Mail className="w-4 h-4" />
                            </span>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="admin@hardwarehub.com"
                                className={`w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border ${
                                    errors.email ? 'border-rose-500' : 'border-slate-200'
                                } text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors`}
                            />
                        </div>
                        {errors.email && <p className="text-rose-600 text-xs mt-1">{errors.email[0]}</p>}
                    </div>

                    {/* Password & Confirm Password (2 Columns) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Password <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-4 h-4" />
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={6}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Min. 6 chars"
                                    className={`w-full h-11 pl-10 pr-10 rounded-xl bg-slate-50 border ${
                                        errors.password ? 'border-rose-500' : 'border-slate-200'
                                    } text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-rose-600 text-xs mt-1">{errors.password[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Confirm Password <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <ShieldCheck className="w-4 h-4" />
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password_confirmation}
                                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                    placeholder="Repeat password"
                                    className={`w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border ${
                                        errors.password_confirmation ? 'border-rose-500' : 'border-slate-200'
                                    } text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors`}
                                />
                            </div>
                            {errors.password_confirmation && (
                                <p className="text-rose-600 text-xs mt-1">{errors.password_confirmation[0]}</p>
                            )}
                        </div>
                    </div>

                    {/* Footer Buttons */}
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
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    <span>Register User</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
