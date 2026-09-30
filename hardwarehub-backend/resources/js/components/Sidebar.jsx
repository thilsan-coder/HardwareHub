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
    Store,
    Sparkles,
    AlertTriangle
} from 'lucide-react';

export default function Sidebar({ user, activePage, setActivePage, onLogout, loggingOut }) {
    const navSections = [
        {
            title: 'CORE PLATFORM',
            items: [
                {
                    id: 'dashboard',
                    label: 'Dashboard Overview',
                    icon: LayoutDashboard,
                    description: 'KPIs & metrics'
                }
            ]
        },
        {
            title: 'INVENTORY CONTROL',
            items: [
                {
                    id: 'products',
                    label: 'Products Catalog',
                    icon: Package,
                    description: 'Stock & pricing'
                },
                {
                    id: 'recycle-bin',
                    label: 'Recycle Bin',
                    icon: Trash2,
                    description: 'Soft-deleted items'
                }
            ]
        },
        {
            title: 'ADMINISTRATION',
            items: [
                {
                    id: 'users',
                    label: 'System Users',
                    icon: Users,
                    description: 'Staff & permissions'
                }
            ]
        }
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none shadow-sm">
            {/* Top Store Header */}
            <div>
                <div className="p-5 border-b border-slate-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
                            <Wrench className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-1">
                                <span className="text-lg font-extrabold text-slate-900 tracking-tight">Hardware</span>
                                <span className="text-lg font-extrabold text-amber-600">Hub</span>
                            </div>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span className="text-[11px] font-semibold text-slate-500 truncate">
                                    Main Store &bull; Branch #1
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nav Menu */}
                <div className="p-3 space-y-6">
                    {navSections.map((section, sIndex) => (
                        <div key={sIndex} className="space-y-1">
                            <div className="px-3 pb-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                {section.title}
                            </div>
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = activePage === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActivePage(item.id)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 group ${
                                            isActive
                                                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3 min-w-0">
                                            <Icon className={`w-4 h-4 shrink-0 transition-transform duration-150 ${
                                                isActive ? 'text-slate-950 stroke-[2.2]' : 'text-slate-400 group-hover:text-slate-700'
                                            }`} />
                                            <div className="min-w-0">
                                                <p className="text-xs truncate">{item.label}</p>
                                                <p className={`text-[10px] truncate ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>

                                        {isActive && <ChevronRight className="w-4 h-4 text-slate-950 shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Profile & App Info */}
            <div className="p-3 border-t border-slate-200 bg-slate-50/70 space-y-2.5">
                {/* Store Status Pill */}
                <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-700">System v2.4</span>
                    <span className="text-emerald-700 font-bold flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>POS Online</span>
                    </span>
                </div>

                {/* User Card */}
                <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Administrator'}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <button
                        onClick={onLogout}
                        disabled={loggingOut}
                        title="Sign Out"
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
