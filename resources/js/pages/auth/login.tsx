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
    ArrowRight,
    Flame,
    Package,
    Wrench,
    ShoppingCart
} from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="h-screen overflow-hidden flex">
            <Head title="Log in" />

            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white">
                    <div className="mb-8">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 shadow-2xl">
                            <Flame className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold mb-3">Boiler Parts Store</h1>
                        <p className="text-lg text-white/90">
                            Your trusted source for quality boiler parts and accessories
                        </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Package className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-base">Wide Selection</h3>
                                <p className="text-white/80 text-sm">Thousands of parts in stock</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Wrench className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-base">Expert Support</h3>
                                <p className="text-white/80 text-sm">Technical assistance available</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <ShoppingCart className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-base">Fast Delivery</h3>
                                <p className="text-white/80 text-sm">Quick shipping nationwide</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-4">
                        <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Flame className="h-7 w-7 text-white" />
                        </div>
                    </div>

                    {/* Status Message */}
                    {status && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                            <div className="text-xs font-medium text-green-800 text-center">
                                {status}
                            </div>
                        </div>
                    )}

                    {/* Form Card */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="lg:hidden mb-3">
                                <h1 className="text-xl font-bold text-gray-900 mb-1">Boiler Parts Store</h1>
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 mb-1">
                                Welcome Back
                            </h2>
                            <p className="text-gray-600 text-xs">
                                Sign in to your account to continue
                            </p>
                        </div>

                        {/* Form */}
                        <Form
                            {...AuthenticatedSessionController.store.form()}
                            resetOnSuccess={['password']}
                            className="p-6"
                        >
                            {({ processing, errors }) => (
                                <div className="space-y-4">
                                    {/* Email Field */}
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="email"
                                            className="text-xs font-semibold text-gray-700 flex items-center gap-1.5"
                                        >
                                            <Mail className="h-3.5 w-3.5 text-blue-600" />
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
                                                className={`w-full px-3 py-2 text-sm rounded-lg border-2 transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                                                    errors.email
                                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="password"
                                            className="text-xs font-semibold text-gray-700 flex items-center gap-1.5"
                                        >
                                            <Lock className="h-3.5 w-3.5 text-blue-600" />
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
                                                className={`w-full px-3 py-2 pr-10 text-sm rounded-lg border-2 transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                                                    errors.password
                                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors focus:outline-none"
                                                tabIndex={-1}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Remember Me & Forgot Password */}
                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex items-center">
                                            <div className="relative">
                                                <label
                                                    htmlFor="remember"
                                                    className="flex items-center cursor-pointer"
                                                >
                                                    <div className="relative">
                                                        <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded transition-all hover:border-blue-400">
                                                            <input
                                                                type="checkbox"
                                                                id="remember"
                                                                name="remember"
                                                                tabIndex={3}
                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer peer"
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 transition-opacity">
                                                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                            <div className="absolute inset-0 bg-blue-600 rounded opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                                        </div>
                                                    </div>
                                                    <span className="ml-2 text-xs text-gray-700 font-medium">
                                                        Remember me
                                                    </span>
                                                </label>
                                            </div>
                                        </div>

                                        {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                                tabIndex={5}
                                            >
                                                Forgot password?
                                            </TextLink>
                                        )}
                                    </div>

                                    {/* Login Button */}
                                    <button
                                        type="submit"
                                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-lg transition-all focus:ring-4 focus:ring-blue-500/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl mt-5"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing ? (
                                            <>
                                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                                <span>Signing in...</span>
                                            </>
                                        ) : (
                                            <>
                                                Sign In
                                                <ArrowRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>

                                    {/* Divider */}
                                    <div className="relative my-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="px-3 bg-white text-gray-500">New customer?</span>
                                        </div>
                                    </div>

                                    {/* Register Link */}
                                    <TextLink
                                        href={register()}
                                        className="w-full block text-center py-2.5 border-2 border-blue-600 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-all"
                                    >
                                        Create Account
                                    </TextLink>
                                </div>
                            )}
                        </Form>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                            <Shield className="h-3 w-3" />
                            <span>Enterprise-grade security & encryption</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
