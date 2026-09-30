import React from 'react';
import { Wrench, LayoutDashboard, Users, LogOut } from 'lucide-react';

export default function Navbar({ user, activePage, setActivePage, onLogout, loggingOut }) {
    return (
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Brand Logo & Name */}
                <div className="flex items-center space-x-3">
                    <div className="bg-amber-500 p-2 rounded-lg text-slate-950 font-bold shadow-md shadow-amber-500/20">
                        <Wrench className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                        <span className="text-lg font-bold tracking-tight text-white">Hardware<span className="text-amber-500">Hub</span></span>
                        <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            Management System
                        </span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex items-center space-x-1 sm:space-x-2">
                    <button
                        onClick={() => setActivePage('dashboard')}
                        className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activePage === 'dashboard'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'text-slate-300 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                    </button>

                    <button
                        onClick={() => setActivePage('users')}
                        className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activePage === 'users'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'text-slate-300 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Users</span>
                    </button>
                </nav>

                {/* User Profile & Logout */}
                <div className="flex items-center space-x-3">
                    <div className="hidden md:flex flex-col text-right">
                        <span className="text-sm font-medium text-slate-200">{user?.name || 'Admin'}</span>
                        <span className="text-xs text-slate-400">{user?.email}</span>
                    </div>
                    <button
                        onClick={onLogout}
                        disabled={loggingOut}
                        className="flex items-center space-x-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">{loggingOut ? 'Logging out...' : 'Logout'}</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
