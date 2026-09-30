import React from 'react';
import { 
    Wrench, 
    LayoutDashboard, 
    Users, 
    Package, 
    Trash2, 
    LogOut, 
    ShieldCheck, 
    ChevronRight,
} from 'lucide-react';

export default function Sidebar({ user, activePage, setActivePage, onLogout, loggingOut }) {
    const navItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            badge: null,
            disabled: false,
        },
        {
            id: 'products',
            label: 'Products',
            icon: Package,
            badge: null,
            disabled: false,
        },
        {
            id: 'recycle-bin',
            label: 'Recycle Bin',
            icon: Trash2,
            badge: null,
            disabled: false,
        },
        {
            id: 'users',
            label: 'System Users',
            icon: Users,
            badge: null,
            disabled: false,
        },
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none shadow-xs">
            {/* Top Brand Header */}
            <div>
                <div className="p-5 border-b border-slate-200 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
                        <Wrench className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-1">
                            <span className="text-lg font-extrabold text-slate-900 tracking-tight">Hardware</span>
                            <span className="text-lg font-extrabold text-amber-600">Hub</span>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                            Shop Management
                        </p>
                    </div>
                </div>

                {/* Navigation Menu */}
                <div className="px-3 py-6 space-y-1.5">
                    <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Main Navigation
                    </div>

                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activePage === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => setActivePage(item.id)}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group ${
                                    isActive
                                        ? 'bg-amber-50 text-amber-900 border border-amber-200/90 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <Icon className={`w-4 h-4 transition-transform duration-150 group-hover:scale-105 ${
                                        isActive ? 'text-amber-600' : 'text-slate-400 group-hover:text-slate-700'
                                    }`} />
                                    <span>{item.label}</span>
                                </div>

                                {isActive && <ChevronRight className="w-4 h-4 text-amber-600" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Bottom User Card & Logout */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 font-bold text-xs">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Administrator'}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" title="Administrator" />
                </div>

                <button
                    onClick={onLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-bold transition-all duration-150 active:scale-[0.99] disabled:opacity-50 shadow-xs"
                >
                    <LogOut className="w-4 h-4" />
                    <span>{loggingOut ? 'Logging out...' : 'Sign Out'}</span>
                </button>
            </div>
        </aside>
    );
}
