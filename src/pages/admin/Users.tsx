import { useState, useEffect } from 'react';
import { User, Shield, Ban } from 'lucide-react';
import { usersApi } from '../../api/users';
import type { BackendUser } from '../../types/users';

export const Users = () => {
    const [users, setUsers] = useState<BackendUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await usersApi.list();
            if (response.status === 'success' && response.data) {
                setUsers(response.data);
            } else {
                setError(response.message || 'Failed to fetch users');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleBlockUser = async (user: BackendUser) => {
        const newStatus = !user.is_active;
        try {
            const response = await usersApi.setBlockedStatus(user.id, newStatus);

            if (response.status === 'success') {
                // Update local state to reflect change
                setUsers(users.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
            } else {
                alert(response.message || 'Failed to update user status');
            }
        } catch (err) {
            console.error('Failed to block/unblock user:', err);
            alert('An error occurred while updating user status');
        }
    };

    return (
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-semibold text-black dark:text-white">
                    Registered Users
                </h4>
                <div className="flex gap-2">
                    <input type="text" placeholder="Search users..." className="border border-stroke rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>
            </div>

            {error && (
                <div className="mb-4 text-red-500 bg-red-100 p-3 rounded">
                    {error}
                </div>
            )}

            <div className="flex flex-col">
                <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5">
                    <div className="p-2.5 xl:p-5">
                        <h5 className="text-sm font-medium uppercase xsm:text-base">User</h5>
                    </div>
                    <div className="p-2.5 text-center xl:p-5">
                        <h5 className="text-sm font-medium uppercase xsm:text-base">Role</h5>
                    </div>
                    <div className="p-2.5 text-center xl:p-5">
                        <h5 className="text-sm font-medium uppercase xsm:text-base">Join Date</h5>
                    </div>
                    <div className="p-2.5 text-center xl:p-5">
                        <h5 className="text-sm font-medium uppercase xsm:text-base">Status</h5>
                    </div>
                    <div className="p-2.5 text-center xl:p-5">
                        <h5 className="text-sm font-medium uppercase xsm:text-base">Actions</h5>
                    </div>
                </div>

                {loading ? (
                    <div className="p-10 text-center">Loading users...</div>
                ) : (
                    users.map((user) => (
                        <div
                            className={`grid grid-cols-3 sm:grid-cols-5 ${users.indexOf(user) === users.length - 1 ? '' : 'border-b border-stroke dark:border-strokedark'
                                }`}
                            key={user.id}
                        >
                            <div className="flex items-center gap-3 p-2.5 xl:p-5">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-slate-500" />
                                </div>
                                <p className="hidden text-black dark:text-white sm:block">
                                    {user.username}
                                    <span className="block text-xs text-gray-500">{user.email}</span>
                                </p>
                            </div>

                            <div className="flex items-center justify-center p-2.5 xl:p-5">
                                <span className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${user.role === 'admin' ? 'bg-success text-success' : 'bg-warning text-warning'
                                    }`}>
                                    {user.role}
                                </span>
                            </div>

                            <div className="flex items-center justify-center p-2.5 xl:p-5">
                                <p className="text-black dark:text-white">{new Date(user.created_at).toLocaleDateString()}</p>
                            </div>

                            <div className="flex items-center justify-center p-2.5 xl:p-5">
                                <span className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${user.is_active ? 'bg-success text-success' : 'bg-danger text-danger'
                                    }`}>
                                    {user.is_active ? 'Active' : 'Blocked'}
                                </span>
                            </div>

                            <div className="flex items-center justify-center p-2.5 xl:p-5">
                                <button
                                    onClick={() => handleBlockUser(user)}
                                    className="hover:text-primary transition-colors"
                                    title={user.is_active ? "Block User" : "Unblock User"}
                                >
                                    {user.is_active ? <Ban className="w-5 h-5 text-red-500" /> : <Shield className="w-5 h-5 text-green-500" />}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
