import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { LockClosedIcon, EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface ResetPasswordFormData {
    password:   string;
    confirmPassword: string;
}

export const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const navigate = useNavigate();
    
    const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordFormData>();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const passwordVal = watch('password');

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) {
            setError('Missing password reset token in URL.');
            return;
        }

        setLoading(true);
        setMessage(null);
        setError(null);
        try {
            const res = await authApi.resetPassword({ token, password: data.password });
            if (res.status === 'success') {
                setMessage('Your password has been reset successfully! Redirecting you to sign in...');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(res.message || 'Failed to reset password.');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-zinc-900/50 p-8 rounded-2xl backdrop-blur-sm border border-zinc-800 shadow-xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
                        Create new password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Please enter your new password below.
                    </p>
                </div>

                {!token && (
                    <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg text-sm" role="alert">
                        <span className="block sm:inline">Invalid or missing reset token in the link. Please request a new link.</span>
                    </div>
                )}

                {message && (
                    <div className="bg-emerald-950/30 border border-emerald-800 text-emerald-200 px-4 py-4 rounded-lg text-sm text-center" role="alert">
                        <span className="block sm:inline">{message}</span>
                    </div>
                )}

                {!message && token && (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4 rounded-md shadow-sm">
                            {/* Password input */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="block w-full pl-10 pr-10 py-3 border border-zinc-700 rounded-lg bg-zinc-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent sm:text-sm transition-all duration-200"
                                    placeholder="New Password"
                                    {...register('password', { 
                                        required: 'Password is required',
                                        minLength: { value: 8, message: 'Password must be at least 8 characters long' }
                                    })}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-gray-400 hover:text-gray-300 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" aria-hidden="true" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            {errors.password && <span className="text-red-500 text-xs ml-1">{errors.password.message}</span>}

                            {/* Confirm Password input */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    className="block w-full pl-10 pr-10 py-3 border border-zinc-700 rounded-lg bg-zinc-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent sm:text-sm transition-all duration-200"
                                    placeholder="Confirm New Password"
                                    {...register('confirmPassword', { 
                                        required: 'Please confirm your password',
                                        validate: (val) => val === passwordVal || 'Passwords do not match'
                                    })}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="text-gray-400 hover:text-gray-300 focus:outline-none"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" aria-hidden="true" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            {errors.confirmPassword && <span className="text-red-500 text-xs ml-1">{errors.confirmPassword.message}</span>}
                        </div>

                        {error && (
                            <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg text-sm" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200 shadow-lg shadow-amber-900/20 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : null}
                                {loading ? 'Updating Password...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="text-center">
                    <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};
