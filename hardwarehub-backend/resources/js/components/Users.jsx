import React, { useEffect, useState } from 'react';
import { Users as UsersIcon, Shield, Mail, Calendar, RefreshCw, AlertCircle, Plus, Check } from 'lucide-react';
import Pagination from './Pagination.jsx';
import UserFormModal from './UserFormModal.jsx';

export default function Users() {
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/web/users');
            if (!response.ok) {
                throw new Error('Failed to fetch user accounts');
            }
            const data = await response.json();
            setUsersList(data.users || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const showToast = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 4000);
    };

    const handleUserCreated = (newUser) => {
        showToast(`User "${newUser.name}" created successfully!`);
        fetchUsers();
    };

    const paginatedUsers = usersList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200/80">
                <div className="space-y-0.5">
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Users</h1>
                    <p className="text-xs text-slate-500">Registered administrator accounts with administrative permissions</p>
                </div>
                
                <div className="flex items-center space-x-2.5">
                    <button
                        onClick={fetchUsers}
                        disabled={loading}
                        className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80 text-xs font-medium transition-colors shadow-xs"
                        title="Refresh Users"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4 stroke-[2.2]" />
                        <span>Add New User</span>
                    </button>
                </div>
            </div>

            {/* Notification Toast */}
            {notification && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3 text-emerald-800 text-xs font-semibold shadow-xs animate-in fade-in slide-in-from-top-2">
                    <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{notification}</span>
                </div>
            )}

            {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-3 text-rose-700 text-xs shadow-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Users Table Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider select-none">
                                <th className="py-3.5 px-5">ID</th>
                                <th className="py-3.5 px-5">User Name</th>
                                <th className="py-3.5 px-5">Email Address</th>
                                <th className="py-3.5 px-5">Role</th>
                                <th className="py-3.5 px-5">Joined Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-slate-500">
                                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-600 mb-2" />
                                        <span className="font-medium text-xs">Loading user accounts...</span>
                                    </td>
                                </tr>
                            ) : usersList.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-slate-500">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-3.5 px-5 text-slate-400 font-mono text-xs">#{user.id}</td>
                                        <td className="py-3.5 px-5 font-medium text-slate-900">
                                            <div className="flex items-center space-x-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-xs flex items-center justify-center">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span>{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-5 text-slate-600">
                                            <div className="flex items-center space-x-2">
                                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-5">
                                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                                                <Shield className="w-3 h-3 text-indigo-600" />
                                                <span>Administrator</span>
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-5 text-slate-400 text-xs">
                                            <div className="flex items-center space-x-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{new Date(user.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalItems={usersList.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    }}
                />
            </div>

            {/* Add User Modal */}
            <UserFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUserCreated={handleUserCreated}
            />
        </div>
    );
}
