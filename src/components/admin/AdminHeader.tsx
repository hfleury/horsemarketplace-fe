import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminHeader = () => {
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-stroke bg-white px-4 py-4 shadow-sm dark:border-strokedark dark:bg-boxdark sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 sm:gap-8">
                {/* Search */}
                <div className="hidden sm:block">
                    <form action="#" method="POST">
                        <div className="relative">
                            <button className="absolute left-0 top-1/2 -translate-y-1/2">
                                <Search className="w-5 h-5 text-dark-400" />
                            </button>
                            <input
                                type="text"
                                placeholder="Type to search..."
                                className="w-full bg-transparent pl-9 pr-4 text-black focus:outline-none dark:text-white xl:w-96"
                            />
                        </div>
                    </form>
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-7">
                <ul className="flex items-center gap-2 sm:gap-4">
                    {/* Notification Menu Area */}
                    <li className="relative">
                        <button className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white">
                            <span className="absolute -top-0.5 right-0 z-1 h-2 w-2 rounded-full bg-meta-1">
                                <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-meta-1 opacity-75"></span>
                            </span>
                            <Bell className="w-5 h-5" />
                        </button>
                    </li>
                </ul>

                {/* User Area */}
                <div className="relative">
                    <div className="flex items-center gap-4">
                        <span className="hidden text-right lg:block">
                            <span className="block text-sm font-medium text-black dark:text-white">{user?.username}</span>
                            <span className="block text-xs text-dark-500">Admin</span>
                        </span>
                        <span className="h-10 w-10 rounded-full bg-dark-300 flex items-center justify-center overflow-hidden">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="User" className="h-full w-full object-cover" />
                            ) : (
                                <User className="w-6 h-6 text-dark-500" />
                            )}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};
