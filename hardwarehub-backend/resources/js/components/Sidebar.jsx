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
    Shield
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
        <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 select-none">
            {/* Top Brand / Workspace Header */}
            <div>
                <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-indigo-600/20">
                            <Boxes className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center space-x-1">
                                <span className="text-base font-bold text-slate-900 tracking-tight">Hardware</span>
                                <span className="text-base font-bold text-indigo-600">Hub</span>
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
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-150 group ${
                                            isActive
                                                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2.5 min-w-0">
                                            <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                                                isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                                            }`} />
                                            <span className="text-sm truncate">{item.label}</span>
                                        </div>

                                        {isActive && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Profile Section */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">{user?.name || 'Admin User'}</p>
                            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        disabled={loggingOut}
                        title="Sign Out"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
