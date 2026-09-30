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
            id: 'users',
            label: 'System Users',
            icon: Users,
            badge: null,
            disabled: false,
        },
        {
            id: 'recycle-bin',
            label: 'Recycle Bin',
            icon: Trash2,
            badge: 'Phase 5',
            disabled: true,
        },
    ];

    return (
        <aside className="w-64 bg-slate-900/95 border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none backdrop-blur-xl">
            {/* Top Brand Header */}
            <div>
                <div className="p-6 border-b border-slate-800/80 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
                        <Wrench className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-1">
                            <span className="text-lg font-extrabold text-white tracking-tight">Hardware</span>
                            <span className="text-lg font-extrabold text-amber-500">Hub</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-400 tracking-wide uppercase">
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
                                onClick={() => {
                                    if (item.disabled) {
                                        alert(`${item.label} module will be implemented in ${item.badge}.`);
                                    } else {
                                        setActivePage(item.id);
                                    }
                                }}
                                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                                    isActive
                                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/5'
                                        : item.disabled
                                        ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/40 cursor-pointer'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                                        isActive ? 'text-amber-400' : item.disabled ? 'text-slate-400' : 'text-slate-400 group-hover:text-amber-400'
                                    }`} />
                                    <span>{item.label}</span>
                                </div>

                                {item.badge ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
                                        {item.badge}
                                    </span>
                                ) : isActive ? (
                                    <ChevronRight className="w-4 h-4 text-amber-400" />
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Bottom User Card & Logout */}
            <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
                <div className="flex items-center space-x-3 px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800/80">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" title="Administrator" />
                </div>

                <button
                    onClick={onLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                >
                    <LogOut className="w-4 h-4" />
                    <span>{loggingOut ? 'Logging out...' : 'Sign Out'}</span>
                </button>
            </div>
        </aside>
    );
}
