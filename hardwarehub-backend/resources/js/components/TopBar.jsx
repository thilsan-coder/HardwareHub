import React from 'react';
import { Database, Menu, Bell, Clock, Calendar, Plus, ShieldCheck, Wrench } from 'lucide-react';

export default function TopBar({ activePage, toggleSidebar, onQuickAddProduct }) {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs select-none">
            {/* Left: Mobile Toggle & Page Title */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={toggleSidebar}
                    className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
                    title="Toggle Navigation Menu"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-2.5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">
                        HardwareHub
                    </span>
                    <span className="text-slate-300 hidden sm:inline">/</span>
                    <div className="flex items-center space-x-2">
                        <h2 className="text-base font-extrabold text-slate-900 capitalize">
                            {activePage === 'dashboard' ? 'Overview & Analytics' : activePage === 'users' ? 'System Administration' : activePage === 'recycle-bin' ? 'Recycle Bin Archive' : 'Inventory Catalog'}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Right: Quick Indicators & Date */}
            <div className="flex items-center space-x-3">
                {/* Database Connection Badge */}
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    <span>MySQL 127.0.0.1</span>
                </div>

                {/* Date Display */}
                <div className="hidden md:flex items-center space-x-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{today}</span>
                </div>
            </div>
        </header>
    );
}
