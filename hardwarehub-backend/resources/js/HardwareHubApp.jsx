import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import TopBar from './components/TopBar.jsx';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import Users from './components/Users.jsx';
import Products from './components/Products.jsx';
import RecycleBin from './components/RecycleBin.jsx';
import { Loader2 } from 'lucide-react';

export default function HardwareHubApp() {
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [activePage, setActivePage] = useState('dashboard');
    const [loggingOut, setLoggingOut] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Check if user is logged in
    const checkAuth = async () => {
        setLoadingAuth(true);
        try {
            const response = await fetch('/api/web/me');
            if (response.ok) {
                const data = await response.json();
                if (data.user) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoadingAuth(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const handleLoginSuccess = (userData) => {
        setUser(userData);
        setActivePage('dashboard');
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            await fetch('/api/web/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
            });
            setUser(null);
        } catch (err) {
            setUser(null);
        } finally {
            setLoggingOut(false);
        }
    };

    if (loadingAuth) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-600">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                <span className="text-xs font-semibold tracking-wide text-slate-600">Loading HardwareHub...</span>
            </div>
        );
    }

    if (!user) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="min-h-screen bg-slate-50/70 text-slate-800 flex font-sans antialiased overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex h-screen sticky top-0 shrink-0">
                <Sidebar
                    user={user}
                    activePage={activePage}
                    setActivePage={setActivePage}
                    onLogout={handleLogout}
                    loggingOut={loggingOut}
                />
            </div>

            {/* Mobile Drawer Sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl">
                        <Sidebar
                            user={user}
                            activePage={activePage}
                            setActivePage={(page) => {
                                setActivePage(page);
                                setSidebarOpen(false);
                            }}
                            onLogout={handleLogout}
                            loggingOut={loggingOut}
                        />
                    </div>
                </div>
            )}

            {/* Main Application Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-slate-50/70">
                <TopBar
                    activePage={activePage}
                    toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                />

                <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
                    {activePage === 'dashboard' && (
                        <Dashboard setActivePage={setActivePage} />
                    )}

                    {activePage === 'products' && (
                        <Products />
                    )}

                    {activePage === 'recycle-bin' && (
                        <RecycleBin setActivePage={setActivePage} />
                    )}

                    {activePage === 'users' && (
                        <Users />
                    )}
                </main>

                <footer className="border-t border-slate-200/80 bg-white/70 py-3.5 px-8 text-center text-xs text-slate-400">
                    HardwareHub &bull; Shop Management System &copy; {new Date().getFullYear()} &bull; Professional Edition
                </footer>
            </div>
        </div>
    );
}
