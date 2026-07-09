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
  Mail,
  Lock,
} from 'lucide-react';

import authService
  from '../services/authService';

import AuthLayout
  from '../components/AuthLayout';

const StudentLogin =
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
            await authService.login(
              email,
              password
            );

          if (
            data.token &&
            data.user
          ) {
            if (
              data.user
                .role !==
              'student'
            ) {
              setError(
                'Access denied. Not a student.'
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

            navigate(
              '/student-dashboard'
            );

            return;
          }

          setError(
            'Invalid server response'
          );
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
      <AuthLayout
      user={{ role: 'student' }}
      >
        <div className="w-full max-w-md">
          {/* back button */}

          <Link
            to="/"
            className="inline-flex items-center text-white/90 hover:text-white mb-8 transition-colors group font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />

            Back to
            Home
          </Link>

          {/* login card */}

          <div className="bg-white/95 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-8 md:p-10">
            {/* icon */}

            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl blur-xl opacity-50 animate-pulse" />

                <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>

            {/* title */}

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Student
                Portal
              </h2>

              <p className="text-gray-600">
                Access your
                student
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
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />

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
                    className="w-full pl-12 pr-4 py-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                    placeholder="student@iiitkottayam.ac.in"
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
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />

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
                    className="w-full pl-12 pr-12 py-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-600 transition-colors"
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
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-red-600 text-sm text-center">
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
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3.5 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5"
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
              <p className="text-sm text-gray-600">
                Student
                access only
              </p>
            </div>
          </div>

          {/* security */}

          <div className="mt-6 text-center">
            <p className="text-xs text-white/80 flex items-center justify-center gap-2">
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

export default StudentLogin;