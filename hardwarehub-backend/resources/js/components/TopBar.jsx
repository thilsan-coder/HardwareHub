import React from 'react';
import { Database, Menu, Bell, Clock, Calendar } from 'lucide-react';

export default function TopBar({ activePage, toggleSidebar }) {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <header className="h-16 bg-white/95 border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
            {/* Left: Mobile Toggle & Page Title */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={toggleSidebar}
                    className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">HardwareHub</span>
                    <span className="text-slate-300">/</span>
                    <h2 className="text-sm font-bold text-slate-900 capitalize">
                        {activePage === 'dashboard' ? 'Overview Dashboard' : activePage === 'users' ? 'User Administration' : activePage}
                    </h2>
                </div>
            </div>

            {/* Right: Status Indicators */}
            <div className="flex items-center space-x-3">
                {/* Database Connection Badge */}
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <Database className="w-3.5 h-3.5" />
                    <span>MySQL Connected</span>
                </div>

                {/* Date Display */}
                <div className="hidden md:flex items-center space-x-1.5 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{today}</span>
                </div>
            </div>
        </header>
    );
}
