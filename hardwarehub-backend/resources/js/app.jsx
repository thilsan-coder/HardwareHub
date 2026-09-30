import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import Users from './components/Users.jsx';
import { Loader2 } from 'lucide-react';

export default function App() {
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [activePage, setActivePage] = useState('dashboard');
    const [loggingOut, setLoggingOut] = useState(false);

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
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
                <span className="text-sm">Loading HardwareHub...</span>
            </div>
        );
    }

    if (!user) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
            <Navbar
                user={user}
                activePage={activePage}
                setActivePage={setActivePage}
                onLogout={handleLogout}
                loggingOut={loggingOut}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activePage === 'dashboard' && (
                    <Dashboard setActivePage={setActivePage} />
                )}

                {activePage === 'users' && (
                    <Users />
                )}
            </main>

            <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
                HardwareHub Shop Management System &copy; {new Date().getFullYear()} — Powered by Laravel & React
            </footer>
        </div>
    );
}
