import React from 'react';

import {
  LogOut,
  Send,
  UserCircle,
} from 'lucide-react';

interface DashboardHeaderProps {
  title: string;

  subtitle: string;

  user?: {
    role?: string;

    category?: string;
  } | null;

  onLogout: () => void;

  onOpenNotificationModal?: () => void;
}

const DashboardHeader: React.FC<
  DashboardHeaderProps
> = ({
  title,
  subtitle,
  user,
  onLogout,
  onOpenNotificationModal,
}) => {
  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-30 backdrop-blur-lg bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* left */}

          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
              <UserCircle className="w-7 h-7 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {title}
              </h1>

              <p className="text-sm text-gray-500">
                {subtitle}
              </p>
            </div>
          </div>

          {/* right */}

          <div className="flex items-center gap-3">
            {/* notification button */}

            {(user?.role ===
              'superadmin' || user?.role === 'admin')  &&
              onOpenNotificationModal && (
                <button
                  onClick={
                    onOpenNotificationModal
                  }
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg"
                >
                  <Send className="w-4 h-4" />

                  <span className="hidden sm:inline">
                    Send
                    Notification
                  </span>
                </button>
              )}

            {/* logout */}

            <button
              onClick={
                onLogout
              }
              className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />

              <span className="hidden sm:inline">
                Logout
              </span>
            </button>
          </div>
        </div>

        {/* admin category badge */}

        {user?.role ===
          'admin' &&
          user?.category && (
            <div className="pb-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                Managing:{' '}
                {
                  user.category
                }{' '}
                Complaints
              </span>
            </div>
          )}
      </div>
    </header>
  );
};

export default DashboardHeader;