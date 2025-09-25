import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import {
    LoaderCircle,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Shield,
    ArrowRight
} from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <Head title="Log in" />

            <div className="w-full max-w-md">
                {/* Header Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-lg backdrop-blur-sm p-8 mb-6">
                    <div className="text-center space-y-2">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                        <p className="text-gray-600">Sign in to your admin account to continue</p>
                    </div>
                </div>

                {/* Status Message */}
                {status && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                        <div className="text-sm font-medium text-green-800 text-center">
                            {status}
                        </div>
                    </div>
                )}

                {/* Login Form Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-lg backdrop-blur-sm overflow-hidden">
                    <Form
                        {...AuthenticatedSessionController.store.form()}
                        resetOnSuccess={['password']}
                        className="p-8"
                    >
                        {({ processing, errors }) => (
                            <div className="space-y-6">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="email"
                                        className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                                    >
                                        <Mail className="h-4 w-4" />
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="Enter your email address"
                                            className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg focus:outline-none ${
                                                errors.email
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="password"
                                        className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                                    >
                                        <Lock className="h-4 w-4" />
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="Enter your password"
                                            className={`w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg focus:outline-none ${
                                                errors.password
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                {/* Remember Me & Forgot Password */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                id="remember"
                                                name="remember"
                                                tabIndex={3}
                                                className="sr-only"
                                            />
                                            <label
                                                htmlFor="remember"
                                                className="flex items-center cursor-pointer"
                                            >
                                                <div className="relative">
                                                    <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded transition-all duration-200 hover:border-blue-400">
                                                        <input
                                                            type="checkbox"
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer peer"
                                                            name="remember"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 transition-opacity">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        <div className="absolute inset-0 bg-blue-600 rounded opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                                    </div>
                                                </div>
                                                <span className="ml-3 text-sm text-gray-700 font-medium">
                                                    Remember me
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>

                                {/* Login Button */}
                                <button
                                    type="submit"
                                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    tabIndex={4}
                                    disabled={processing}
                                    data-test="login-button"
                                >
                                    {processing ? (
                                        <>
                                            <LoaderCircle className="h-5 w-5 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight className="h-5 w-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </Form>


                </div>

                {/* Additional Info */}
                <div className="mt-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <Shield className="h-3 w-3" />
                        <span>Enterprise-grade security & encryption</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
