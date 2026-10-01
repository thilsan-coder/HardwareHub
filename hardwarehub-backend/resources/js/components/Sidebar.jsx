import React from 'react';
import { 
    Layers,
    LayoutDashboard, 
    Users, 
    Package, 
    Trash2, 
    LogOut, 
    ChevronRight,
    Boxes,
    Sparkles,
    Shield,
    ArrowRightLeft
} from 'lucide-react';

export default function Sidebar({ user, activePage, setActivePage, onLogout, loggingOut }) {
    const navSections = [
        {
            title: 'Overview',
            items: [
                {
                    id: 'dashboard',
                    label: 'Dashboard',
                    icon: LayoutDashboard,
                    description: 'Metrics & analytics'
                }
            ]
        },
        {
            title: 'Inventory',
            items: [
                {
                    id: 'products',
                    label: 'Products',
                    icon: Package,
                    description: 'Catalog & stock levels'
                },
                {
                    id: 'stock-movements',
                    label: 'Stock Movements',
                    icon: ArrowRightLeft,
                    description: 'Stock In / Out ledger'
                },
                {
                    id: 'recycle-bin',
                    label: 'Recycle Bin',
                    icon: Trash2,
                    description: 'Archived products'
                }
            ]
        },
        {
            title: 'Settings',
            items: [
                {
                    id: 'users',
                    label: 'System Users',
                    icon: Users,
                    description: 'Admin accounts'
                }
            ]
        }
    ];

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none text-slate-300">
            {/* Top Brand / Workspace Header */}
            <div>
                <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/30">
                            <Boxes className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center space-x-1">
                                <span className="text-base font-bold text-white tracking-tight">Hardware</span>
                                <span className="text-base font-bold text-indigo-400">Hub</span>
                            </div>
                            <p className="text-[10px] font-medium text-slate-400 -mt-0.5">Inventory Suite</p>
                        </div>
                    </div>
                </div>

                {/* Nav Menu */}
                <div className="p-3 space-y-6">
                    {navSections.map((section, sIndex) => (
                        <div key={sIndex} className="space-y-1">
                            <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                {section.title}
                            </div>
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = activePage === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActivePage(item.id)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                                            isActive
                                                ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/25'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800/70 font-medium'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2.5 min-w-0">
                                            <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                                                isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                                            }`} />
                                            <span className="text-xs truncate">{item.label}</span>
                                        </div>

                                        {isActive && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Profile Section */}
            <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 shadow-xs">
                    <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{user?.name || 'Admin User'}</p>
                            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        disabled={loggingOut}
                        title="Sign Out"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
