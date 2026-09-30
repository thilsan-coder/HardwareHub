import React, { useEffect, useState } from 'react';
import { Users as UsersIcon, Shield, Mail, Calendar, RefreshCw, AlertCircle } from 'lucide-react';

export default function Users() {
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-3">
                        <UsersIcon className="w-7 h-7 text-amber-500" />
                        <span>System Users</span>
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Registered user accounts with system access rights
                    </p>
                </div>
                <button
                    onClick={fetchUsers}
                    disabled={loading}
                    className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-sm font-medium transition-colors w-fit"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-3 text-rose-400 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Users Table Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/70 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <th className="py-4 px-6">ID</th>
                                <th className="py-4 px-6">User Name</th>
                                <th className="py-4 px-6">Email Address</th>
                                <th className="py-4 px-6">Role</th>
                                <th className="py-4 px-6">Joined Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-slate-400">
                                        Loading user accounts...
                                    </td>
                                </tr>
                            ) : usersList.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-slate-400">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                usersList.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="py-4 px-6 text-slate-400 font-mono">#{user.id}</td>
                                        <td className="py-4 px-6 font-semibold text-white">
                                            {user.name}
                                        </td>
                                        <td className="py-4 px-6 text-slate-300">
                                            <div className="flex items-center space-x-2">
                                                <Mail className="w-4 h-4 text-slate-500" />
                                                <span>{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                <Shield className="w-3.5 h-3.5" />
                                                <span>Administrator</span>
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-slate-400 text-xs">
                                            <div className="flex items-center space-x-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                                <span>{new Date(user.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
