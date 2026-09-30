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
        <header className="h-16 bg-slate-900/60 border-b border-slate-800/80 px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-40">
            {/* Left: Mobile Toggle & Page Title */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={toggleSidebar}
                    className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">HardwareHub</span>
                    <span className="text-slate-600">/</span>
                    <h2 className="text-sm font-bold text-white capitalize">
                        {activePage === 'dashboard' ? 'Overview Dashboard' : activePage === 'users' ? 'User Administration' : activePage}
                    </h2>
                </div>
            </div>

            {/* Right: Status Indicators */}
            <div className="flex items-center space-x-4">
                {/* Database Connection Badge */}
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <Database className="w-3.5 h-3.5" />
                    <span>MySQL Connected</span>
                </div>

                {/* Date Display */}
                <div className="hidden md:flex items-center space-x-1.5 text-xs font-medium text-slate-400 bg-slate-800/60 px-3 py-1 rounded-lg border border-slate-800">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{today}</span>
                </div>
            </div>
        </header>
    );
}
