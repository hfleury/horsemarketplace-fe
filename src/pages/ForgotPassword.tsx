import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { extractErrorMessage } from '../lib/errors';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface ForgotPasswordFormData {
    email: string;
}

export const ForgotPassword: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setLoading(true);
        setMessage(null);
        setError(null);
        try {
            const res = await authApi.forgotPassword(data.email);
            if (res.status === 'success') {
                setMessage(res.message || 'If the email exists, a password reset link has been sent.');
            } else {
                setError(res.message || 'Failed to send password reset request.');
            }
        } catch (err) {
            setError(extractErrorMessage(err, 'Failed to send password reset request.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-zinc-900/50 p-8 rounded-2xl backdrop-blur-sm border border-zinc-800 shadow-xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
                        Reset your password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Enter your email address and we will send you instructions to reset your password.
                    </p>
                </div>

                {message ? (
                    <div className="space-y-6">
                        <div className="bg-emerald-950/30 border border-emerald-800 text-emerald-200 px-4 py-4 rounded-lg text-sm text-center" role="alert">
                            <span className="block sm:inline">{message}</span>
                        </div>
                        <div className="text-center">
                            <Link to="/login" className="inline-flex items-center text-sm font-medium text-amber-500 hover:text-amber-400 transition-colors">
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back to Sign In
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4 rounded-md shadow-sm">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-lg bg-zinc-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent sm:text-sm transition-all duration-200"
                                    placeholder="Email Address"
                                    {...register('email', { 
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address'
                                        }
                                    })}
                                />
                            </div>
                            {errors.email && <span className="text-red-500 text-xs ml-1">{errors.email.message}</span>}
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
                                {loading ? 'Sending request...' : 'Send Reset Link'}
                            </button>
                        </div>

                        <div className="text-center">
                            <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back to Sign In
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
