import React, {
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  User,
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from 'lucide-react';

import authService
  from '../services/authService';

import AuthLayout
  from '../components/AuthLayout';

interface LoginResponse {
  token: string;

  user: {
    _id: string;

    role: string;

    category?: string;
  };
}

const AdminLogin =
  () => {
    const [
      email,
      setEmail,
    ] = useState('');

    const [
      password,
      setPassword,
    ] = useState('');

    const [
      showPassword,
      setShowPassword,
    ] = useState(false);

    const [
      error,
      setError,
    ] = useState('');

    const [
      isLoading,
      setIsLoading,
    ] = useState(false);

    const navigate =
      useNavigate();

    // login

    const handleLogin =
      async (
        e: React.FormEvent
      ) => {
        e.preventDefault();

        setError('');

        setIsLoading(
          true
        );

        try {
          const data =
            (await authService.login(
              email,
              password
            )) as LoginResponse;

          if (
            !data.user ||
            !data.token
          ) {
            setError(
              'Invalid server response.'
            );

            return;
          }

          if (
            data.user
              .role !==
            'admin'
            &&
            data.user
            .role !==
            'superadmin'
          ) {
            setError(
              'Access denied. Not an authorized administrator.'
            );

            return;
          }

          localStorage.setItem(
            'token',
            data.token
          );

          localStorage.setItem(
            'userId',
            data.user._id
          );

          // route

          if (
            data.user
              .role ===
            'superadmin'
          ) {
            navigate(
              '/superadmin-dashboard'
            );
          } else {
            navigate(
              '/admin-dashboard'
            );
          }
        } catch (
          err: any
        ) {
          setError(
            err.message ||
              'Login failed'
          );
        } finally {
          setIsLoading(
            false
          );
        }
      };

    return (
      <AuthLayout>
        <div className="w-full max-w-md">
          {/* back button */}

          <Link
            to="/"
            className="inline-flex items-center text-purple-300 hover:text-purple-200 mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />

            Back to
            Home
          </Link>

          {/* login card */}

          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
            {/* icon */}

            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl blur-xl opacity-50 animate-pulse" />

                <div className="relative bg-gradient-to-br from-purple-500 to-indigo-600 w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>

            {/* title */}

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Admin
                Portal
              </h2>

              <p className="text-gray-600">
                Access your
                administrative
                dashboard
              </p>
            </div>

            {/* form */}

            <form
              onSubmit={
                handleLogin
              }
              className="space-y-5"
            >
              {/* email */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                  Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />

                  <input
                    type="email"
                    value={
                      email
                    }
                    onChange={(
                      e
                    ) =>
                      setEmail(
                        e
                          .target
                          .value
                      )
                    }
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-100 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    placeholder="admin@iiitkottayam.ac.in"
                    required
                  />
                </div>
              </div>

              {/* password */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />

                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={
                      password
                    }
                    onChange={(
                      e
                    ) =>
                      setPassword(
                        e
                          .target
                          .value
                      )
                    }
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-100 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-500 hover:text-purple-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* error */}

              {error && (
                <div className="bg-red-100 border border-red-400 rounded-xl p-3">
                  <p className="text-red-700 text-sm text-center">
                    {error}
                  </p>
                </div>
              )}

              {/* submit */}

              <button
                type="submit"
                disabled={
                  isLoading
                }
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />

                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>

                    Signing
                    in...
                  </span>
                ) : (
                  'Access Dashboard'
                )}
              </button>
            </form>

            {/* footer */}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Secure admin
                access only
              </p>
            </div>
          </div>

          {/* security */}

          <div className="mt-6 text-center">
            <p className="text-xs text-purple-300 flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" />

              Your
              connection is
              encrypted
              and secure
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  };

export default AdminLogin;