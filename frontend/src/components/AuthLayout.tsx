import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  user?: {
    role?: 'student' | 'admin';
  };
}

const AuthLayout: React.FC<
  AuthLayoutProps
> = ({ children, user }) => {
  const isStudent =
    user?.role === 'student';

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* bg */}

      <div
        className={`absolute inset-0 bg-gradient-to-br ${
          isStudent
            ? 'from-emerald-900 via-green-900 to-teal-900'
            : 'from-gray-900 via-indigo-900 to-slate-900'
        }`}
      />

      <div
        className={`absolute inset-0 bg-gradient-to-tr ${
          isStudent
            ? 'from-green-500/20 via-emerald-500/20 to-lime-500/20'
            : 'from-purple-600/20 via-pink-600/20 to-indigo-600/20'
        }`}
      />

      {/* blobs */}

      <div
        className={`absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isStudent
            ? 'bg-emerald-500/10'
            : 'bg-indigo-500/10'
        }`}
      />

      <div
        className={`absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isStudent
            ? 'bg-green-500/10'
            : 'bg-purple-500/10'
        }`}
        style={{
          animationDelay: '2s',
        }}
      />

      {/* content */}

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;