import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import {
    LoaderCircle,
    Mail,
    Lock,
    User,
    Phone,
    Calendar,
    Shield,
    ArrowRight,
    Flame,
    Package,
    Wrench,
    ShoppingCart
} from 'lucide-react';
import { useState } from 'react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="h-screen overflow-hidden flex">
            <Head title="Register" />

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
                        <h1 className="text-4xl font-bold mb-3">Join Our Store</h1>
                        <p className="text-lg text-white/90">
                            Create your account and start shopping for quality boiler parts
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

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-4">
                        <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Flame className="h-7 w-7 text-white" />
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 mt-16">
                            <div className="lg:hidden mb-3">
                                <h1 className="text-xl font-bold text-gray-900 mb-1">Boiler Parts Store</h1>
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 mb-1">
                                Create Account
                            </h2>
                            <p className="text-gray-600 text-xs">
                                Fill in your details to get started
                            </p>
                        </div>

                        {/* Form */}
                        <Form
                            {...RegisteredUserController.store.form()}
                            resetOnSuccess={['password', 'password_confirmation']}
                            className="p-6"
                        >
                            {({ processing, errors }) => (
                                <div className="space-y-3.5">
                                    {/* First Name & Last Name */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="first_name"
                                                className="text-xs font-semibold text-gray-700 flex items-center gap-1.5"
                                            >
                                                <User className="h-3.5 w-3.5 text-blue-600" />
                                                First Name
                                            </label>
                                            <input
                                                id="first_name"
                                                type="text"
                                                name="first_name"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="given-name"
                                                placeholder="First name"
                                                className={`w-full px-3 py-2 text-sm rounded-lg border-2 transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                                                    errors.first_name
                                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            />
                                            <InputError message={errors.first_name} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="last_name"
                                                className="text-xs font-semibold text-gray-700"
                                            >
                                                Last Name
                                            </label>
                                            <input
                                                id="last_name"
                                                type="text"
                                                name="last_name"
                                                required
                                                tabIndex={2}
                                                autoComplete="family-name"
                                                placeholder="Last name"
                                                className={`w-full px-3 py-2 text-sm rounded-lg border-2 transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                                                    errors.last_name
                                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            />
                                            <InputError message={errors.last_name} />
                                        </div>
                                    </div>

                                    {/* Email Field */}
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="email"
                                            className="text-xs font-semibold text-gray-700 flex items-center gap-1.5"
                                        >
                                            <Mail className="h-3.5 w-3.5 text-blue-600" />
                                            Email Address
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            tabIndex={3}
                                            autoComplete="email"
                                            placeholder="email@example.com"
                                            className={`w-full px-3 py-2 text-sm rounded-lg border-2 transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                                                errors.email
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Phone Field (Optional) */}
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="phone"
                                            className="text-xs font-semibold text-gray-700 flex items-center gap-1.5"
                                        >
                                            <Phone className="h-3.5 w-3.5 text-blue-600" />
                                            Phone Number <span className="text-gray-400">(Optional)</span>
                                        </label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            tabIndex={4}
                                            autoComplete="tel"
                                            placeholder="01XXXXXXXXX"
                                            className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                                        />
                                        <InputError message={errors.phone} />
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
                                                tabIndex={5}
                                                autoComplete="new-password"
                                                placeholder="Create a password"
                                                className={`w-full px-3 py-2 pr-10 text-sm rounded-lg border-2 transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                                                    errors.password
                                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
                                                tabIndex={-1}
                                            >
                                                {showPassword ? (
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                    </svg>
                                                ) : (
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="password_confirmation"
                                            className="text-xs font-semibold text-gray-700 flex items-center gap-1.5"
                                        >
                                            <Lock className="h-3.5 w-3.5 text-blue-600" />
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="password_confirmation"
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="password_confirmation"
                                                required
                                                tabIndex={6}
                                                autoComplete="new-password"
                                                placeholder="Confirm your password"
                                                className={`w-full px-3 py-2 pr-10 text-sm rounded-lg border-2 transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                                                    errors.password_confirmation
                                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
                                                tabIndex={-1}
                                            >
                                                {showConfirmPassword ? (
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                    </svg>
                                                ) : (
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        <InputError message={errors.password_confirmation} />
                                    </div>

                                    {/* Register Button */}
                                    <button
                                        type="submit"
                                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-lg transition-all focus:ring-4 focus:ring-blue-500/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl mt-5"
                                        tabIndex={7}
                                        disabled={processing}
                                        data-test="register-user-button"
                                    >
                                        {processing ? (
                                            <>
                                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                                <span>Creating account...</span>
                                            </>
                                        ) : (
                                            <>
                                                Create Account
                                                <ArrowRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>

                                    {/* Login Link */}
                                    <div className="text-center pt-3">
                                        <p className="text-xs text-gray-600">
                                            Already have an account?{' '}
                                            <TextLink
                                                href={login()}
                                                className="text-blue-600 hover:text-blue-700 font-semibold"
                                                tabIndex={8}
                                            >
                                                Sign In
                                            </TextLink>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </Form>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                            <Shield className="h-3 w-3" />
                            <span>Your data is secure and encrypted</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
