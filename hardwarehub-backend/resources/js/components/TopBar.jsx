import React, { useState, useEffect } from 'react';
import { Menu, Calendar, Clock } from 'lucide-react';

export default function TopBar({ activePage, toggleSidebar }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const dateFormatted = currentTime.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const timeFormatted = currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    const pageTitles = {
        'dashboard': 'Dashboard Overview',
        'products': 'Product Catalog',
        'recycle-bin': 'Recycle Bin Archive',
        'users': 'System Users'
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-40 select-none">
            {/* Left: Mobile Toggle & Minimal Breadcrumb */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={toggleSidebar}
                    className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
                    title="Toggle Menu"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-400">Workspace</span>
                    <span className="text-slate-300">/</span>
                    <h2 className="text-sm font-semibold text-slate-900">
                        {pageTitles[activePage] || 'Dashboard'}
                    </h2>
                </div>
            </div>

            {/* Right: Live Connection Indicator & Live Date/Time Clock */}
            <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Database Connected</span>
                </div>

                {/* Live Date & Time Clock Badge */}
                <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{dateFormatted}</span>
                    </div>
                    <span className="text-slate-300">&bull;</span>
                    <div className="flex items-center space-x-1.5 font-mono font-semibold text-indigo-600">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{timeFormatted}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

