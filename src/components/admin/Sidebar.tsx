import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
    const location = useLocation();
    const { logout } = useAuth();
    const { pathname } = location;

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Categories', path: '/admin/categories', icon: Tag },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
    ];

    return (
        <aside className="absolute left-0 top-0 z-50 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
                <Link to="/" className="text-2xl font-bold text-white">
                    HorseMarket Admin
                </Link>
            </div>

            <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
                {/* Sidebar Menu */}
                <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
                    <div>
                        <ul className="mb-6 flex flex-col gap-1.5">
                            {navItems.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        to={item.path}
                                        className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium duration-300 ease-in-out hover:bg-gray-800 dark:hover:bg-gray-700 ${pathname === item.path || (pathname.includes(item.path) && item.path !== '/admin')
                                            ? 'bg-gray-800 dark:bg-gray-700 text-white'
                                            : 'text-gray-400'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-auto">
                        <button
                            onClick={logout}
                            className="group relative flex w-full items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-400 duration-300 ease-in-out hover:bg-gray-800 dark:hover:bg-gray-700 hover:text-red-500"
                        >
                            <LogOut className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </nav>
            </div>
        </aside>
    );
};
